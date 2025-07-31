import { db } from '../db';
import { users } from '../db/schemas/base';
import { orders } from '../db/schemas/order';
import { products, productPrices } from '../db/schemas/product';
import { eq, and, desc, count } from 'drizzle-orm';
import { walletService } from './wallet.service';
import { callPeamsub } from './upstream';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env';
import {
  AppError,
  UserNotFoundError,
  AuthorizationError,
  ValidationError,
  DatabaseError
} from '../utils/errors';
import { handleDatabaseError } from '../middleware/errorHandler';

interface CreateOrderArgs {
  productId: string;
  quantity: number;
  unitPrice: number;
  uid?: string;
  number?: string;
}

interface OrderFilters {
  status?: 'pending' | 'success' | 'failed' | 'refunded';
  page?: number;
  limit?: number;
}

export const orderService = {
  // Helper function to get product price based on user role and product type
  async getProductPrice(productId: string, userRole: string): Promise<number> {
    const [result] = await db
      .select({
        productType: products.type,
        recommended: productPrices.recommended,
        price: productPrices.price,
        agentPrice: productPrices.agentPrice,
      })
      .from(productPrices)
      .leftJoin(products, eq(productPrices.productId, products.id))
      .where(eq(productPrices.productId, productId))
      .limit(1);

    if (!result) {
      throw new ValidationError('Product pricing not found');
    }

    // Return price based on user role and product type
    if (userRole === 'admin') {
      return Number(result.agentPrice || result.price || result.recommended || 0);
    }

    // For customer: game, mobile, cashcard use recommended price
    if (result.productType && ['game', 'mobile', 'cashcard'].includes(result.productType)) {
      return Number(result.recommended || result.price || 0);
    }

    // For other product types (app-premium, preorder) use regular price
    return Number(result.price || result.recommended || 0);
  },

  async createOrder(userId: string, args: CreateOrderArgs) {
    const { productId, quantity, unitPrice, uid, number: phone } = args;
    const total = unitPrice * quantity;

    try {
      // Verify user exists
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) {
        throw new UserNotFoundError('User not found');
      }

      // Check user status
      if (user.status !== 'active') {
        throw new AuthorizationError('Account is not active');
      }

      // ดึงข้อมูลสินค้าเพื่อตรวจ type และ upstream_id
      const [prod] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
      if (!prod) {
        throw new ValidationError('Product not found');
      }

      // Check if product has valid pricing and validate unit price
      const actualPrice = await this.getProductPrice(productId, user.role);

      // Allow some tolerance for price differences (e.g., due to promotions)
      if (Math.abs(unitPrice - actualPrice) > 0.01) {
        throw new ValidationError(`Invalid unit price. Expected: ${actualPrice}, received: ${unitPrice}`);
      }

      // Validate required fields based on product type
      if (prod.type === 'game' && !uid) {
        throw new ValidationError('UID is required for game products');
      }

      if (prod.type === 'mobile' && !phone) {
        throw new ValidationError('Phone number is required for mobile products');
      }

      // ถ้ามีค่าใช้จ่าย > 0 ให้หักเงินก่อน
      if (total > 0) {
        await walletService.withdraw(userId, total);
      }

      const reference = randomUUID();

      return await this.processOrderByType(prod, {
        userId,
        productId,
        quantity,
        total,
        reference,
        uid,
        phone,
      });

    } catch (error) {
      // Refund if payment was deducted
      if (total > 0) {
        try {
          await walletService.deposit(userId, total);
        } catch (refundError) {
          console.error('Failed to refund payment:', refundError);
        }
      }

      if (error instanceof AppError) {
        throw error;
      }

      handleDatabaseError(error);
      throw new AppError('Failed to create order', 500);
    }
  },

  async processOrderByType(product: any, orderData: any) {
    const { userId, productId, quantity, total, reference, uid, phone } = orderData;

    try {
      switch (product.type) {
        case 'app-premium':
          return await this.processAppPremiumOrder(product, { userId, productId, quantity, total, reference });

        case 'preorder':
          return await this.processPreorderOrder(product, { userId, productId, quantity, total, reference });

        case 'game':
          return await this.processGameOrder(product, { userId, productId, quantity, total, reference, uid });

        case 'mobile':
          return await this.processMobileOrder(product, { userId, productId, quantity, total, reference, phone });

        case 'cashcard':
          return await this.processCashcardOrder(product, { userId, productId, quantity, total, reference });

        default:
          return await this.processDefaultOrder(product, { userId, productId, quantity, total, reference });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new AppError(`Failed to process ${product.type} order: ${message}`, 500);
    }
  },

  async processAppPremiumOrder(product: any, orderData: any) {
    const { userId, productId, quantity, total, reference } = orderData;

    const codeStr = await callPeamsub<string>('/v2/app-premium', 'POST', {
      id: Number(product.upstreamId),
      reference,
    });

    const [order] = await db
      .insert(orders)
      .values({
        userId,
        productId,
        quantity: quantity.toString(),
        amount: total.toString(),
        status: 'success',
        upstreamId: reference,
        code: codeStr,
      })
      .returning();

    return order;
  },

  async processPreorderOrder(product: any, orderData: any) {
    const { userId, productId, quantity, total, reference } = orderData;

    const callbackUrl = `${process.env.BASE_URL || `http://localhost:${env.port}`}/orders/preorder-callback`;

    await callPeamsub('/v2/preorder', 'POST', {
      id: Number(product.upstreamId),
      reference,
      callbackUrl,
    });

    const [order] = await db
      .insert(orders)
      .values({
        userId,
        productId,
        quantity: quantity.toString(),
        amount: total.toString(),
        status: 'pending',
        upstreamId: reference,
      })
      .returning();

    return order;
  },

  async processGameOrder(product: any, orderData: any) {
    const { userId, productId, quantity, total, reference, uid } = orderData;

    await callPeamsub('/v2/game', 'POST', {
      id: Number(product.upstreamId),
      uid,
      reference,
    });

    const [order] = await db
      .insert(orders)
      .values({
        userId,
        productId,
        quantity: quantity.toString(),
        amount: total.toString(),
        status: 'pending',
        upstreamId: reference,
      })
      .returning();

    return order;
  },

  async processMobileOrder(product: any, orderData: any) {
    const { userId, productId, quantity, total, reference, phone } = orderData;

    await callPeamsub('/v2/mobile', 'POST', {
      id: Number(product.upstreamId),
      number: phone,
      reference,
    });

    const [order] = await db
      .insert(orders)
      .values({
        userId,
        productId,
        quantity: quantity.toString(),
        amount: total.toString(),
        status: 'pending',
        upstreamId: reference,
      })
      .returning();

    return order;
  },

  async processCashcardOrder(product: any, orderData: any) {
    const { userId, productId, quantity, total, reference } = orderData;

    await callPeamsub('/v2/cashcard', 'POST', {
      id: Number(product.upstreamId),
      reference,
    });

    const [order] = await db
      .insert(orders)
      .values({
        userId,
        productId,
        quantity: quantity.toString(),
        amount: total.toString(),
        status: 'pending',
        upstreamId: reference,
      })
      .returning();

    return order;
  },

  async processDefaultOrder(product: any, orderData: any) {
    const { userId, productId, quantity, total, reference } = orderData;

    const resp = await callPeamsub<{ orderId: string }>('/v2/order', 'POST', {
      productId: product.upstreamId,
      quantity,
    });

    const [order] = await db
      .insert(orders)
      .values({
        userId,
        productId,
        quantity: quantity.toString(),
        amount: total.toString(),
        status: 'pending',
        upstreamId: resp.orderId,
      })
      .returning();

    return order;
  },

  async getOrder(id: string, userId: string) {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

      if (!order) {
        throw new ValidationError('Order not found');
      }

      if (order.userId !== userId) {
        throw new AuthorizationError('Access denied to this order');
      }

      return order;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      handleDatabaseError(error);
      throw new DatabaseError('Failed to retrieve order');
    }
  },

  async getUserOrders(userId: string, filters: OrderFilters = {}) {
    try {
      const { status, page = 1, limit = 20 } = filters;
      const offset = (page - 1) * limit;

      const conditions = [eq(orders.userId, userId)];
      if (status) {
        conditions.push(eq(orders.status, status));
      }
      const whereCondition = and(...conditions);

      const userOrders = await db
        .select()
        .from(orders)
        .where(whereCondition)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalCount] = await db
        .select({ count: count() })
        .from(orders)
        .where(whereCondition);

      return {
        orders: userOrders,
        pagination: {
          page,
          limit,
          total: totalCount.count,
          totalPages: Math.ceil(totalCount.count / limit),
        },
      };
    } catch (error) {
      handleDatabaseError(error);
      throw new DatabaseError('Failed to retrieve user orders');
    }
  },

  async cancelOrder(id: string, userId: string) {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

      if (!order) {
        throw new ValidationError('Order not found');
      }

      if (order.userId !== userId) {
        throw new AuthorizationError('Access denied to this order');
      }

      if (order.status !== 'pending') {
        throw new ValidationError('Only pending orders can be cancelled');
      }

      // Update order status to failed
      const [updatedOrder] = await db
        .update(orders)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(orders.id, id))
        .returning();

      // Refund the amount
      const amount = Number(order.amount);
      if (amount > 0) {
        await walletService.deposit(userId, amount);
      }

      return updatedOrder;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      handleDatabaseError(error);
      throw new DatabaseError('Failed to cancel order');
    }
  },

  async handleCallback(upstreamId: string, status: 'success' | 'failed') {
    try {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.upstreamId, upstreamId))
        .limit(1);

      if (!order) {
        throw new ValidationError('Order not found');
      }

      if (order.status !== 'pending') {
        return; // Already processed
      }

      if (status === 'success') {
        await db
          .update(orders)
          .set({ status: 'success', updatedAt: new Date() })
          .where(eq(orders.id, order.id));
      } else {
        await db
          .update(orders)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(eq(orders.id, order.id));

        // Refund
        const amount = Number(order.amount);
        if (amount > 0) {
          await walletService.deposit(order.userId, amount);
        }
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      handleDatabaseError(error);
      throw new DatabaseError('Failed to handle callback');
    }
  },

  async handlePreorderCallback(reference: string, status: 'success' | 'failed', prize?: string) {
    try {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.upstreamId, reference))
        .limit(1);

      if (!order) {
        throw new ValidationError('Order not found');
      }

      if (order.status !== 'pending') {
        return; // Already processed
      }

      if (status === 'success') {
        await db
          .update(orders)
          .set({
            status: 'success',
            code: prize ?? null,
            updatedAt: new Date()
          })
          .where(eq(orders.id, order.id));
      } else {
        await db
          .update(orders)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(eq(orders.id, order.id));

        // Refund
        const amount = Number(order.amount);
        if (amount > 0) {
          await walletService.deposit(order.userId, amount);
        }
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      handleDatabaseError(error);
      throw new DatabaseError('Failed to handle preorder callback');
    }
  },
}; 