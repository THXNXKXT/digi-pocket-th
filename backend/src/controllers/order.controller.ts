import { Context } from 'hono';
import { orderService } from '../services/order.service';
import { peamsubQueue } from '../queues/peamsub.queue';
import { activityService } from '../services/activity.service';
import { ok } from '../utils/response';
import { 
  validateInput,
  sanitizeString,
  paginationSchema
} from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { 
  AppError,
  ValidationError,
  UserNotFoundError,
  AuthorizationError
} from '../utils/errors';
import { z } from 'zod';

// Enhanced validation schemas
const createOrderSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  uid: z.string().optional(),
  number: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits').optional(),
});

const callbackSchema = z.object({
  upstreamId: z.string().min(1, 'Upstream ID is required'),
  status: z.enum(['success', 'failed'], {
    errorMap: () => ({ message: 'Status must be either success or failed' })
  }),
});

const preorderCallbackSchema = z.object({
  reference: z.string().min(1, 'Reference is required'),
  status: z.enum(['success', 'failed'], {
    errorMap: () => ({ message: 'Status must be either success or failed' })
  }),
  prize: z.string().optional(),
});

const orderListSchema = z.object({
  status: z.enum(['pending', 'success', 'failed', 'refunded']).optional(),
  ...paginationSchema.shape,
});

export const createOrder = asyncHandler(async (c: Context) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  // Validate input
  const validatedData = validateInput(createOrderSchema, body);
  
  // Sanitize string inputs
  const sanitizedData = {
    ...validatedData,
    uid: validatedData.uid ? sanitizeString(validatedData.uid) : undefined,
    number: validatedData.number ? sanitizeString(validatedData.number) : undefined,
  };

  const order = await orderService.createOrder(user.sub, sanitizedData);
  
  // Log order creation activity
  await activityService.logActivity({
    userId: user.sub,
    activityType: 'api_access',
    description: `Order created: ${order.id}`,
    ...activityService.extractRequestInfo(c),
    severity: 'low',
    metadata: {
      orderId: order.id,
      productId: sanitizedData.productId,
      quantity: sanitizedData.quantity,
      amount: order.amount,
    },
  });

  const { body: responseBody, status } = ok('Order created successfully', order);
  return c.json(responseBody, status as any);
});

export const getOrder = asyncHandler(async (c: Context) => {
  const user = c.get('user');
  const id = c.req.param('id');
  
  if (!id) {
    throw new ValidationError('Order ID is required');
  }

  const order = await orderService.getOrder(id, user.sub);
  
  const { body, status } = ok('Order retrieved successfully', order);
  return c.json(body, status as any);
});

export const getUserOrders = asyncHandler(async (c: Context) => {
  const user = c.get('user');
  const query = c.req.query();
  
  const filters = validateInput(orderListSchema, query);
  
  const result = await orderService.getUserOrders(user.sub, filters);
  
  const { body, status } = ok('Orders retrieved successfully', result);
  return c.json(body, status as any);
});

export const getProductPrice = asyncHandler(async (c: Context) => {
  const user = c.get('user');
  const productId = c.req.param('productId');
  
  if (!productId) {
    throw new ValidationError('Product ID is required');
  }

  const price = await orderService.getProductPrice(productId, user.role);
  
  const { body, status } = ok('Product price retrieved successfully', { 
    productId,
    price,
    userRole: user.role 
  });
  return c.json(body, status as any);
});

export const cancelOrder = asyncHandler(async (c: Context) => {
  const user = c.get('user');
  const id = c.req.param('id');
  
  if (!id) {
    throw new ValidationError('Order ID is required');
  }

  const order = await orderService.cancelOrder(id, user.sub);
  
  // Log order cancellation
  await activityService.logActivity({
    userId: user.sub,
    activityType: 'api_access',
    description: `Order cancelled: ${order.id}`,
    ...activityService.extractRequestInfo(c),
    severity: 'medium',
    metadata: {
      orderId: order.id,
      previousStatus: 'pending',
      newStatus: 'failed',
    },
  });

  const { body, status } = ok('Order cancelled successfully', order);
  return c.json(body, status as any);
});

// Webhook endpoints (public)
export const peamsubCallback = asyncHandler(async (c: Context) => {
  const body = await c.req.json();
  
  const validatedData = validateInput(callbackSchema, body);
  
  // Log callback received
  await activityService.logActivity({
    activityType: 'api_access',
    description: `Peamsub callback received: ${validatedData.upstreamId}`,
    ...activityService.extractRequestInfo(c),
    severity: 'low',
    metadata: {
      upstreamId: validatedData.upstreamId,
      status: validatedData.status,
      source: 'peamsub_callback',
    },
  });

  await peamsubQueue.add('callback', validatedData);
  
  const { body: responseBody, status } = ok('Callback queued successfully', { queued: true });
  return c.json(responseBody, status as any);
});

export const preorderCallback = asyncHandler(async (c: Context) => {
  const body = await c.req.json();
  
  const validatedData = validateInput(preorderCallbackSchema, body);
  
  // Log callback received
  await activityService.logActivity({
    activityType: 'api_access',
    description: `Preorder callback received: ${validatedData.reference}`,
    ...activityService.extractRequestInfo(c),
    severity: 'low',
    metadata: {
      reference: validatedData.reference,
      status: validatedData.status,
      prize: validatedData.prize,
      source: 'preorder_callback',
    },
  });

  await orderService.handlePreorderCallback(
    validatedData.reference, 
    validatedData.status, 
    validatedData.prize
  );
  
  const { body: responseBody, status } = ok('Preorder callback processed successfully', { processed: true });
  return c.json(responseBody, status as any);
}); 