import { db } from '../db'
import { users, orders, walletTransactions, wallets } from '../db/schemas'
import { eq, count, sum, desc } from 'drizzle-orm'

interface UpdateProfileData {
  // Currently no additional profile fields beyond basic user info
}

export const profileService = {
  async getProfile(userId: string) {
    const user = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.id, userId)).limit(1)

    if (!user.length) {
      throw new Error('User not found')
    }

    const userData = user[0]

    return {
      ...userData,
      createdAt: userData.createdAt.toISOString(),
      updatedAt: userData.updatedAt.toISOString()
    }
  },

  async updateProfile(userId: string, data: UpdateProfileData) {
    // Currently no additional profile fields to update
    // Just update the timestamp
    const updateData: any = {
      updatedAt: new Date()
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))

    // Return updated profile
    return this.getProfile(userId)
  },

  async getUserStats(userId: string) {
    try {
      // Get order statistics
      const orderStats = await db.select({
        totalOrders: count(),
        totalSpent: sum(orders.totalAmount)
      }).from(orders).where(eq(orders.userId, userId))

      // Get recent orders
      const recentOrders = await db.select({
        id: orders.id,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt
      }).from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt))
        .limit(5)

      // Get transaction statistics
      const transactionStats = await db.select({
        totalTransactions: count(),
        totalAmount: sum(walletTransactions.amount)
      }).from(walletTransactions)
        .innerJoin(wallets, eq(walletTransactions.walletId, wallets.id))
        .where(eq(wallets.userId, userId))

      return {
        orders: {
          total: orderStats[0]?.totalOrders || 0,
          totalSpent: parseFloat(orderStats[0]?.totalSpent?.toString() || '0'),
          recent: recentOrders.map(order => ({
            ...order,
            totalAmount: parseFloat(order.totalAmount.toString()),
            createdAt: order.createdAt.toISOString()
          }))
        },
        transactions: {
          total: transactionStats[0]?.totalTransactions || 0,
          totalAmount: parseFloat(transactionStats[0]?.totalAmount?.toString() || '0')
        },
        memberSince: await this.getMemberSince(userId)
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return {
        orders: { total: 0, totalSpent: 0, recent: [] },
        transactions: { total: 0, totalAmount: 0 },
        memberSince: new Date().toISOString()
      }
    }
  },

  async getMemberSince(userId: string) {
    const user = await db.select({ createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return user.length ? user[0].createdAt.toISOString() : new Date().toISOString()
  }
}
