import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, wallets } from "../db/schemas";
import { env } from "../config/env";
import { activityService } from "./activity.service";
import { securityService } from "./security.service";
import { DeviceTrackingUtils } from "../utils/device-tracking.utils";
import { SecurityUtils } from "../utils/security.utils";
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  AccountLockedError,
  AccountSuspendedError
} from "../utils/errors";
import type { Context } from "hono";

const SALT_ROUNDS = 10;

type UserRow = typeof users.$inferSelect;

function signToken(user: UserRow) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    env.jwtSecret,
    {
      expiresIn: "12h",
    }
  );
}

export const authService = {
  async register(username: string, email: string, password: string, c: Context) {
    // ตรวจชื่อซ้ำ
    const nameDup = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    if (nameDup.length) {
      throw new UserAlreadyExistsError("Username already exists");
    }

    // ตรวจอีเมลซ้ำ
    const emailDup = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (emailDup.length) {
      throw new UserAlreadyExistsError("Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [user] = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(users)
        .values({ username, email, passwordHash })
        .returning();

      await tx.insert(wallets).values({
        userId: created.id,
        balance: "0"
      });
      return [created];
    });

    // Log registration activity
    await activityService.logRegistration(user.id, c);

    return signToken(user);
  },

  async login(username: string, password: string, c: Context) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      throw new InvalidCredentialsError("Invalid credentials");
    }

    // Check if account is locked
    const isLocked = await securityService.checkAccountLockout(user.id);
    if (isLocked) {
      throw new AccountLockedError("Account is temporarily locked due to security reasons");
    }

    // Check account status
    if (user.status === 'suspended') {
      throw new AccountSuspendedError("Account is suspended");
    }

    if (user.status === 'banned') {
      throw new AccountSuspendedError("Account is banned");
    }

    // Verify password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      // Increment failed attempts and potentially lock account
      await securityService.incrementFailedAttempts(user.id, c);
      throw new InvalidCredentialsError("Invalid credentials");
    }

    // Reset failed attempts on successful login
    await securityService.resetFailedAttempts(user.id);

    // Create new session
    const sessionToken = await securityService.createSession(user.id, c);

    // Track device and IP information
    await this.trackLoginInfo(user.id, c);

    // Log successful login
    await activityService.logLogin(user.id, c, true);

    // Check for suspicious activity
    await securityService.detectSuspiciousActivity(user.id, c);

    // Generate JWT with session info
    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
        sessionToken
      },
      env.jwtSecret,
      { expiresIn: "12h" }
    );

    return { token, sessionToken };
  },

  async logout(userId: string, c: Context, sessionToken?: string) {
    // Terminate session if provided
    if (sessionToken) {
      await securityService.terminateSession(sessionToken);
    } else {
      // Terminate all user sessions if no specific session
      await securityService.terminateAllUserSessions(userId);
    }

    // Log logout activity
    await activityService.logLogout(userId, c);

    return { success: true };
  },

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, env.jwtSecret);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new InvalidCredentialsError("Token has expired");
      }
      throw new InvalidCredentialsError("Invalid token");
    }
  },

  // Generate password reset token (placeholder for future implementation)
  async generatePasswordResetToken(email: string): Promise<string> {
    // This would generate a secure token and store it in database
    // For now, just return a placeholder
    return crypto.randomUUID();
  },

  // Track login information (device, IP, patterns)
  async trackLoginInfo(userId: string, c: Context) {
    try {
      // Extract client information
      const clientIP = SecurityUtils.extractClientIPFromContext(c);

      const userAgent = c.req.header('user-agent') || '';

      // Extract device and network information
      const headers = {
        'user-agent': userAgent,
        'accept-language': c.req.header('accept-language') || '',
        'accept-encoding': c.req.header('accept-encoding') || '',
        'accept': c.req.header('accept') || '',
      };

      const deviceFingerprint = await DeviceTrackingUtils.generateDeviceFingerprint(headers);

      // Update basic login info
      await db.update(users).set({
        lastLoginAt: new Date(),
        lastLoginIp: clientIP,
        lastDeviceFingerprint: deviceFingerprint
      }).where(eq(users.id, userId));

      // Update basic tracking fields only
      await db.update(users).set({
        lastLoginIp: clientIP,
        lastDeviceFingerprint: deviceFingerprint,
        lastLoginAt: new Date()
      }).where(eq(users.id, userId));

    } catch (error) {
      console.error('Error tracking login info:', error);
      // Don't throw error to avoid breaking login flow
    }
  },
};
