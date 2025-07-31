export const openApiDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Digi-Pocket API',
    version: '1.0.0',
    description: 'Basic endpoints documentation',
  },
  paths: {
    '/products/{type}': {
      get: {
        summary: 'List products by type',
        parameters: [
          {
            name: 'type',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['app-premium', 'preorder', 'game', 'mobile', 'cashcard'],
            },
          },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiSuccessProducts',
                },
              },
            },
          },
        },
      },
    },
    '/wallet/balance': {
      get: {
        summary: 'Get wallet balance',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/orders': {
      post: {
        summary: 'Create order',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Created' } },
      },
    },
    '/admin/users': {
      get: { summary: 'List users', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Success' } } },
      post: {
        summary: 'Create user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserInput' } } },
        },
        responses: { 200: { description: 'Created' } },
      },
    },
    '/admin/users/{id}': {
      get: { summary: 'Get user', security: [{ bearerAuth: [] }], parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ], responses: { 200: { description: 'Success' } } },
      patch: {
        summary: 'Update user',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserInput' } } },
        },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        summary: 'Delete user',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
        responses: { 200: { description: 'Deleted' } },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          upstream_id: { type: 'string' },
          type: { type: 'string' },
          category: { type: 'string' },
          name: { type: 'string' },
          img: { type: 'string', format: 'uri' },
          description: { type: 'string' },
          format_id: { type: 'string' },
          extra: { type: 'object', additionalProperties: true },
          updated_at: { type: 'string', format: 'date-time' },
          price: { type: 'string' },
          priceVip: { type: 'string' },
          agentPrice: { type: 'string' },
          discount: { type: 'string' },
          stock: { type: 'integer' },
        },
      },
      ApiSuccessProducts: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Product' },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      CreateUserInput: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: ['admin', 'customer'] },
          status: { type: 'string', enum: ['active', 'suspended', 'banned', 'pending'] },
        },
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'customer'] },
          status: { type: 'string', enum: ['active', 'suspended', 'banned', 'pending'] },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
} as const; 