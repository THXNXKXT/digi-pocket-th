import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { 
  createOrder, 
  getOrder, 
  getUserOrders,
  getProductPrice,
  cancelOrder,
  peamsubCallback, 
  preorderCallback 
} from '../controllers/order.controller';

export const orderRoute = new Hono();

// Public webhook endpoints (no auth required)
orderRoute.post('/callback', peamsubCallback);
orderRoute.post('/preorder-callback', preorderCallback);

// Protected routes for authenticated users
orderRoute.use('*', authMiddleware);

// Order management endpoints
orderRoute.post('/', createOrder);
orderRoute.get('/', getUserOrders);
orderRoute.get('/price/:productId', getProductPrice);
orderRoute.get('/:id', getOrder);
orderRoute.patch('/:id/cancel', cancelOrder); 