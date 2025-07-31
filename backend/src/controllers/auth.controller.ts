import { Context } from 'hono';
import { authService } from '../services/auth.service';
import { securityService } from '../services/security.service';
import { ok } from '../utils/response';
import {
  validateInput,
  userRegistrationSchema,
  userLoginSchema,
  sanitizeString,
  sanitizeEmail,
  sanitizeUsername
} from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';

export const register = asyncHandler(async (c: Context) => {
  const body = await c.req.json();

  // Validate input
  const validatedData = validateInput(userRegistrationSchema, body);

  // Sanitize inputs
  const sanitizedData = {
    username: sanitizeUsername(validatedData.username),
    email: sanitizeEmail(validatedData.email),
    password: validatedData.password, // Don't sanitize password
  };

  // Check rate limiting for registration
  await securityService.enforceRateLimit(
    c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    'register',
    c
  );

  const token = await authService.register(
    sanitizedData.username,
    sanitizedData.email,
    sanitizedData.password,
    c
  );

  const { body: responseBody, status } = ok('Registration successful', { token });
  return c.json(responseBody, status as any);
});

export const login = asyncHandler(async (c: Context) => {
  const body = await c.req.json();

  // Validate input
  const validatedData = validateInput(userLoginSchema, body);

  // Sanitize inputs
  const sanitizedData = {
    username: sanitizeString(validatedData.username),
    password: validatedData.password, // Don't sanitize password
  };

  // Check rate limiting for login attempts
  await securityService.enforceRateLimit(
    c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    'login',
    c
  );

  const result = await authService.login(
    sanitizedData.username,
    sanitizedData.password,
    c
  );

  const { body: responseBody, status } = ok('Login successful', {
    token: result.token,
    sessionToken: result.sessionToken
  });
  return c.json(responseBody, status as any);
});

export const logout = asyncHandler(async (c: Context) => {
  const user = c.get('user');

  if (user?.sub) {
    await authService.logout(user.sub, c, user.sessionToken);
  }

  const { body: responseBody, status } = ok('Logout successful', { success: true });
  return c.json(responseBody, status as any);
});