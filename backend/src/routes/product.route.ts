import { Hono } from 'hono';
import { listProducts } from '../controllers/product.controller';

export const productRoute = new Hono();

productRoute.get('/:type', listProducts); 