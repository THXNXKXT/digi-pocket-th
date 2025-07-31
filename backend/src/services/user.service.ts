import { db } from '../db';
import { users, statusEnum, roleEnum, wallets } from '../db/schemas';
import { eq } from 'drizzle-orm';

export const userService = {
  list() {
    return db.select().from(users);
  },

  async detail(id: string) {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async create(args: {
    username: string;
    email: string;
    password: string;
    role?: typeof roleEnum.enumValues[number];
    status?: typeof statusEnum.enumValues[number];
  }) {
    const bcrypt = await import('bcryptjs');
    const { username, email, password, role = 'customer', status = 'active' } = args;

    const SALT_ROUNDS = 10;
    const passwordHash = await bcrypt.default.hash(password, SALT_ROUNDS);

    const [user] = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(users)
        .values({ username, email, passwordHash, role, status })
        .returning();

      // สร้าง wallet ให้ user ทันที
      await tx.insert(wallets).values({ userId: created.id });
      return [created];
    });

    return user;
  },

  async update(id: string, data: Partial<{
    email: string;
    role: typeof roleEnum.enumValues[number];
    status: typeof statusEnum.enumValues[number];
  }>) {
    if (!Object.keys(data).length) return [];
    return db.update(users).set(data).where(eq(users.id, id)).returning();
  },

  updateStatus(id: string, status: typeof statusEnum.enumValues[number]) {
    return db.update(users).set({ status }).where(eq(users.id, id)).returning();
  },

  delete(id: string) {
    return db.delete(users).where(eq(users.id, id));
  },
}; 