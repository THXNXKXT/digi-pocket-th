import { describe, it, expect, beforeEach } from 'bun:test';
import { setupTestEnvironment, TestAPI, TestDatabase, TEST_USERS, TEST_PRODUCTS } from './setup';

setupTestEnvironment();

describe('🛒 E-commerce System - Comprehensive Tests', () => {
  let customerToken: string;
  let adminToken: string;
  let productId: string;

  beforeEach(async () => {
    // Create admin user
    await TestAPI.register(TEST_USERS.admin);
    const adminLogin = await TestAPI.login({
      username: TEST_USERS.admin.username,
      password: TEST_USERS.admin.password,
    });
    adminToken = adminLogin.data.data.token;

    // Create customer user
    await TestAPI.register(TEST_USERS.customer);
    const customerLogin = await TestAPI.login({
      username: TEST_USERS.customer.username,
      password: TEST_USERS.customer.password,
    });
    customerToken = customerLogin.data.data.token;

    // Create test product
    const product = await TestDatabase.createTestProduct(TEST_PRODUCTS.product1);
    productId = product.id;
  });

  describe('Product Management', () => {
    it('should list products for customers', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/products',
        customerToken
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);

      const product = response.data.data[0];
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.price).toBeDefined();
      expect(product.stock).toBeDefined();
    });

    it('should get product details', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        `/products/${productId}`,
        customerToken
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe(productId);
      expect(response.data.data.name).toBe(TEST_PRODUCTS.product1.name);
      expect(response.data.data.price).toBe(TEST_PRODUCTS.product1.price);
    });

    it('should filter products by availability', async () => {
      // Create out of stock product
      await TestDatabase.createTestProduct({
        ...TEST_PRODUCTS.product2,
        stock: 0,
      });

      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/products?available=true',
        customerToken
      );

      expect(response.status).toBe(200);
      response.data.data.forEach((product: any) => {
        expect(product.stock).toBeGreaterThan(0);
      });
    });

    it('should search products by name', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        `/products?search=${encodeURIComponent(TEST_PRODUCTS.product1.name)}`,
        customerToken
      );

      expect(response.status).toBe(200);
      expect(response.data.data.length).toBeGreaterThan(0);
      expect(response.data.data[0].name).toContain(TEST_PRODUCTS.product1.name);
    });

    it('should handle product not found', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/products/non-existent-id',
        customerToken
      );

      expect(response.status).toBe(404);
      expect(response.data.success).toBe(false);
    });
  });

  describe('Order Management', () => {
    it('should create order successfully', async () => {
      const orderData = {
        items: [
          {
            productId: productId,
            quantity: 2,
            price: TEST_PRODUCTS.product1.price,
          },
        ],
        shippingInfo: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Thailand',
        },
      };

      const response = await TestAPI.authenticatedRequest(
        'POST',
        '/orders',
        customerToken,
        { body: orderData }
      );

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBeDefined();
      expect(response.data.data.status).toBe('pending');
      expect(response.data.data.totalAmount).toBeDefined();
    });

    it('should calculate order total correctly', async () => {
      const orderData = {
        items: [
          {
            productId: productId,
            quantity: 3,
            price: TEST_PRODUCTS.product1.price,
          },
        ],
        shippingInfo: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Thailand',
        },
      };

      const response = await TestAPI.authenticatedRequest(
        'POST',
        '/orders',
        customerToken,
        { body: orderData }
      );

      expect(response.status).toBe(201);
      const expectedTotal = parseFloat(TEST_PRODUCTS.product1.price) * 3;
      expect(parseFloat(response.data.data.totalAmount)).toBe(expectedTotal);
    });

    it('should reject order with insufficient stock', async () => {
      const orderData = {
        items: [
          {
            productId: productId,
            quantity: 1000, // More than available stock
            price: TEST_PRODUCTS.product1.price,
          },
        ],
        shippingInfo: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Thailand',
        },
      };

      const response = await TestAPI.authenticatedRequest(
        'POST',
        '/orders',
        customerToken,
        { body: orderData }
      );

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.message).toContain('stock');
    });

    it('should reject order with invalid product', async () => {
      const orderData = {
        items: [
          {
            productId: 'non-existent-product-id',
            quantity: 1,
            price: '99.99',
          },
        ],
        shippingInfo: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Thailand',
        },
      };

      const response = await TestAPI.authenticatedRequest(
        'POST',
        '/orders',
        customerToken,
        { body: orderData }
      );

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });

    it('should validate required shipping information', async () => {
      const orderData = {
        items: [
          {
            productId: productId,
            quantity: 1,
            price: TEST_PRODUCTS.product1.price,
          },
        ],
        // Missing shipping info
      };

      const response = await TestAPI.authenticatedRequest(
        'POST',
        '/orders',
        customerToken,
        { body: orderData }
      );

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });
  });

  describe('Order Retrieval', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create test order
      const orderData = {
        items: [
          {
            productId: productId,
            quantity: 1,
            price: TEST_PRODUCTS.product1.price,
          },
        ],
        shippingInfo: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Thailand',
        },
      };

      const orderResponse = await TestAPI.authenticatedRequest(
        'POST',
        '/orders',
        customerToken,
        { body: orderData }
      );

      orderId = orderResponse.data.data.id;
    });

    it('should get user orders', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/users/orders',
        customerToken
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);

      const order = response.data.data[0];
      expect(order.id).toBeDefined();
      expect(order.status).toBeDefined();
      expect(order.totalAmount).toBeDefined();
      expect(order.createdAt).toBeDefined();
    });

    it('should get specific order details', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        `/orders/${orderId}`,
        customerToken
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe(orderId);
      expect(response.data.data.items).toBeDefined();
      expect(response.data.data.shippingInfo).toBeDefined();
    });

    it('should not allow access to other users orders', async () => {
      // Create second customer
      await TestAPI.register(TEST_USERS.customer2);
      const customer2Login = await TestAPI.login({
        username: TEST_USERS.customer2.username,
        password: TEST_USERS.customer2.password,
      });
      const customer2Token = customer2Login.data.data.token;

      const response = await TestAPI.authenticatedRequest(
        'GET',
        `/orders/${orderId}`,
        customer2Token
      );

      expect(response.status).toBe(403);
      expect(response.data.success).toBe(false);
    });

    it('should filter orders by status', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/users/orders?status=pending',
        customerToken
      );

      expect(response.status).toBe(200);
      response.data.data.forEach((order: any) => {
        expect(order.status).toBe('pending');
      });
    });

    it('should paginate orders', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/users/orders?page=1&limit=5',
        customerToken
      );

      expect(response.status).toBe(200);
      expect(response.data.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Order Status Management', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create test order
      const orderData = {
        items: [
          {
            productId: productId,
            quantity: 1,
            price: TEST_PRODUCTS.product1.price,
          },
        ],
        shippingInfo: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Thailand',
        },
      };

      const orderResponse = await TestAPI.authenticatedRequest(
        'POST',
        '/orders',
        customerToken,
        { body: orderData }
      );

      orderId = orderResponse.data.data.id;
    });

    it('should allow admin to update order status', async () => {
      const response = await TestAPI.authenticatedRequest(
        'PUT',
        `/admin/orders/${orderId}/status`,
        adminToken,
        {
          body: { status: 'processing' },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.status).toBe('processing');
    });

    it('should not allow customer to update order status', async () => {
      const response = await TestAPI.authenticatedRequest(
        'PUT',
        `/admin/orders/${orderId}/status`,
        customerToken,
        {
          body: { status: 'processing' },
        }
      );

      expect(response.status).toBe(403);
      expect(response.data.success).toBe(false);
    });

    it('should validate order status transitions', async () => {
      const response = await TestAPI.authenticatedRequest(
        'PUT',
        `/admin/orders/${orderId}/status`,
        adminToken,
        {
          body: { status: 'invalid_status' },
        }
      );

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });
  });

  describe('Inventory Management', () => {
    it('should update stock after order creation', async () => {
      // Get initial stock
      const initialProductResponse = await TestAPI.authenticatedRequest(
        'GET',
        `/products/${productId}`,
        customerToken
      );
      const initialStock = initialProductResponse.data.data.stock;

      // Create order
      const orderData = {
        items: [
          {
            productId: productId,
            quantity: 2,
            price: TEST_PRODUCTS.product1.price,
          },
        ],
        shippingInfo: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Thailand',
        },
      };

      await TestAPI.authenticatedRequest(
        'POST',
        '/orders',
        customerToken,
        { body: orderData }
      );

      // Check updated stock
      const updatedProductResponse = await TestAPI.authenticatedRequest(
        'GET',
        `/products/${productId}`,
        customerToken
      );
      const updatedStock = updatedProductResponse.data.data.stock;

      expect(updatedStock).toBe(initialStock - 2);
    });

    it('should handle concurrent order attempts', async () => {
      // Create multiple orders simultaneously
      const orderData = {
        items: [
          {
            productId: productId,
            quantity: 50, // Large quantity
            price: TEST_PRODUCTS.product1.price,
          },
        ],
        shippingInfo: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Thailand',
        },
      };

      const promises = Array(3).fill(null).map(() =>
        TestAPI.authenticatedRequest(
          'POST',
          '/orders',
          customerToken,
          { body: orderData }
        )
      );

      const responses = await Promise.all(promises);

      // Only one should succeed due to stock limitations
      const successfulOrders = responses.filter(r => r.status === 201);
      const failedOrders = responses.filter(r => r.status === 400);

      expect(successfulOrders.length).toBeLessThanOrEqual(2);
      expect(failedOrders.length).toBeGreaterThan(0);
    });
  });

  describe('Order Validation', () => {
    it('should validate order item quantities', async () => {
      const invalidOrderData = {
        items: [
          {
            productId: productId,
            quantity: -1, // Invalid quantity
            price: TEST_PRODUCTS.product1.price,
          },
        ],
        shippingInfo: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Thailand',
        },
      };

      const response = await TestAPI.authenticatedRequest(
        'POST',
        '/orders',
        customerToken,
        { body: invalidOrderData }
      );

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });

    it('should validate order item prices', async () => {
      const invalidOrderData = {
        items: [
          {
            productId: productId,
            quantity: 1,
            price: '-99.99', // Invalid price
          },
        ],
        shippingInfo: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Thailand',
        },
      };

      const response = await TestAPI.authenticatedRequest(
        'POST',
        '/orders',
        customerToken,
        { body: invalidOrderData }
      );

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });

    it('should require at least one item in order', async () => {
      const invalidOrderData = {
        items: [], // Empty items
        shippingInfo: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Thailand',
        },
      };

      const response = await TestAPI.authenticatedRequest(
        'POST',
        '/orders',
        customerToken,
        { body: invalidOrderData }
      );

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });
  });
});
