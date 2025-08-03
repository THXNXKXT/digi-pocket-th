import { Context } from 'hono';
import { orderService } from '../../services/order.service';
import { activityService } from '../../services/activity.service';
import { ok } from '../../utils/response';
import {
  validateInput,
  paginationSchema
} from '../../utils/validation';
import { asyncHandler } from '../../middleware/errorHandler';
import { z } from 'zod';
import { db } from '../../db';
import { orders, users, products } from '../../db/schemas';
import { eq, desc, and, count, like, gte, lte, sum, sql } from 'drizzle-orm';

// Admin order filter schema
const adminOrderFilterSchema = z.object({
  status: z.enum(['pending', 'success', 'failed', 'refunded']).optional(),
  userId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().optional(), // Search by user email/username
  ...paginationSchema.shape,
});

const orderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'success', 'failed', 'refunded']),
  reason: z.string().optional(),
});

// Get all orders with advanced filtering (admin only)
export const getAllOrders = asyncHandler(async (c: Context) => {
  const query = c.req.query();
  const filters = validateInput(adminOrderFilterSchema, query);

  const { page = 1, limit = 20, status, userId, productId, startDate, endDate, search } = filters;
  const offset = (page - 1) * limit;

  // Build where conditions
  let whereConditions: any[] = [];
  
  if (status) {
    whereConditions.push(eq(orders.status, status));
  }
  
  if (userId) {
    whereConditions.push(eq(orders.userId, userId));
  }
  
  if (productId) {
    whereConditions.push(eq(orders.productId, productId));
  }
  
  if (startDate) {
    whereConditions.push(gte(orders.createdAt, startDate));
  }
  
  if (endDate) {
    whereConditions.push(lte(orders.createdAt, endDate));
  }

  // Join with users and products for search and additional info
  // Note: orders.productId stores UUID as varchar, need to cast for JOIN
  let query_builder = db
    .select({
      id: orders.id,
      userId: orders.userId,
      productId: orders.productId,
      quantity: orders.quantity,
      amount: orders.amount,
      status: orders.status,
      upstreamId: orders.upstreamId,
      code: orders.code,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      userEmail: users.email,
      username: users.username,
      productName: products.name,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(products, sql`${orders.productId}::uuid = ${products.id}`);

  // Add search condition
  if (search) {
    whereConditions.push(
      like(users.email, `%${search}%`)
    );
  }

  // Apply where conditions and execute query
  const finalQuery = whereConditions.length > 0
    ? query_builder.where(and(...whereConditions))
    : query_builder;

  const ordersList = await finalQuery
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const baseCountQuery = db
    .select({ count: count() })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id));

  const finalCountQuery = whereConditions.length > 0
    ? baseCountQuery.where(and(...whereConditions))
    : baseCountQuery;

  const [totalCount] = await finalCountQuery;

  const result = {
    orders: ordersList,
    pagination: {
      page,
      limit,
      total: totalCount.count,
      totalPages: Math.ceil(totalCount.count / (limit || 20)),
    },
  };

  const { body, status: responseStatus } = ok('Orders retrieved successfully', result);
  return c.json(body, responseStatus as any);
});

// Get order details (admin only)
export const getOrderDetails = asyncHandler(async (c: Context) => {
  const orderId = c.req.param('id');

  const [orderDetails] = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      productId: orders.productId,
      quantity: orders.quantity,
      amount: orders.amount,
      status: orders.status,
      upstreamId: orders.upstreamId,
      code: orders.code,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      userEmail: users.email,
      username: users.username,
      userStatus: users.status,
      productName: products.name,
      productType: products.type,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(products, sql`${orders.productId}::uuid = ${products.id}`)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!orderDetails) {
    const { body } = ok('Order not found', null);
    return c.json(body, 404);
  }

  const { body, status } = ok('Order details retrieved successfully', orderDetails);
  return c.json(body, status as any);
});

// Update order status (admin only)
export const updateOrderStatus = asyncHandler(async (c: Context) => {
  const orderId = c.req.param('id');
  const admin = c.get('user');
  const body = await c.req.json();
  
  const validatedData = validateInput(orderStatusUpdateSchema, body);
  
  // Get current order
  const [currentOrder] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!currentOrder) {
    const { body: responseBody } = ok('Order not found', null);
    return c.json(responseBody, 404);
  }

  const previousStatus = currentOrder.status;
  
  // Update order status
  const [updatedOrder] = await db
    .update(orders)
    .set({ 
      status: validatedData.status,
      updatedAt: new Date()
    })
    .where(eq(orders.id, orderId))
    .returning();

  // Handle refunds if changing to failed/refunded
  if ((validatedData.status === 'failed' || validatedData.status === 'refunded') &&
      (previousStatus === 'success' || previousStatus === 'pending')) {
    const amount = Number(currentOrder.amount);
    if (amount > 0) {
      const { walletService } = await import('../../services/wallet.service');
      await walletService.deposit(currentOrder.userId, amount);
    }
  }

  // Log admin action
  await activityService.logAdminAction(
    admin.sub,
    currentOrder.userId,
    `update_order_status_${orderId}`,
    c
  );

  await activityService.logActivity({
    userId: admin.sub,
    activityType: 'admin_action',
    description: `Order status updated: ${orderId} from ${previousStatus} to ${validatedData.status}`,
    ...activityService.extractRequestInfo(c),
    severity: 'medium',
    metadata: {
      orderId,
      previousStatus,
      newStatus: validatedData.status,
      reason: validatedData.reason,
      targetUserId: currentOrder.userId,
    },
  });

  const { body: responseBody, status } = ok('Order status updated successfully', updatedOrder);
  return c.json(responseBody, status as any);
});

// Get order statistics (admin only)
export const getOrderStatistics = asyncHandler(async (c: Context) => {
  const days = parseInt(c.req.query('days') || '7');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Total orders by status
  const statusStats = await db
    .select({
      status: orders.status,
      count: count(),
    })
    .from(orders)
    .where(gte(orders.createdAt, since))
    .groupBy(orders.status);

  // Total revenue
  const [revenueStats] = await db
    .select({
      totalRevenue: sum(orders.amount),
      totalOrders: count(),
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, since),
        eq(orders.status, 'success')
      )
    );

  // Top products
  const topProducts = await db
    .select({
      productId: orders.productId,
      productName: products.name,
      orderCount: count(),
      totalRevenue: sum(orders.amount),
    })
    .from(orders)
    .leftJoin(products, sql`${orders.productId}::uuid = ${products.id}`)
    .where(
      and(
        gte(orders.createdAt, since),
        eq(orders.status, 'success')
      )
    )
    .groupBy(orders.productId, products.name)
    .orderBy(desc(count()))
    .limit(10);

  const statistics = {
    period: `${days} days`,
    statusBreakdown: statusStats,
    revenue: {
      total: revenueStats?.totalRevenue || 0,
      orderCount: revenueStats?.totalOrders || 0,
    },
    topProducts,
  };

  const { body, status } = ok('Order statistics retrieved successfully', statistics);
  return c.json(body, status as any);
});

// Manually trigger order callback (admin only)
export const triggerOrderCallback = asyncHandler(async (c: Context) => {
  const orderId = c.req.param('id');
  const admin = c.get('user');
  const body = await c.req.json();
  
  const callbackData = validateInput(z.object({
    status: z.enum(['success', 'failed']),
    code: z.string().optional(),
  }), body);

  // Get order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    const { body: responseBody } = ok('Order not found', null);
    return c.json(responseBody, 404);
  }

  // Process callback
  if (order.upstreamId) {
    await orderService.handleCallback(order.upstreamId, callbackData.status);
  }

  // Update code if provided
  if (callbackData.code) {
    await db
      .update(orders)
      .set({ code: callbackData.code })
      .where(eq(orders.id, orderId));
  }

  // Log admin action
  await activityService.logAdminAction(
    admin.sub,
    order.userId,
    `manual_order_callback_${orderId}`,
    c
  );

  const { body: responseBody, status } = ok('Order callback triggered successfully', { processed: true });
  return c.json(responseBody, status as any);
});