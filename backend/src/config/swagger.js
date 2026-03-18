import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger/OpenAPI configuration
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce API',
    version: '1.0.0',
    description:
      'REST API documentation for the E-Commerce backend. Auth is JWT based. All responses use a `success` flag and either `data` or `message`.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponseSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
        },
      },
      ApiResponseError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
          errors: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'user_id' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          role: { type: 'string', example: 'user' },
          isActive: { type: 'boolean', example: true },
        },
      },
      UserAuthResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponseSuccess' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: 'user_id' },
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  role: { type: 'string', example: 'user' },
                  token: { type: 'string', example: 'jwt_token_here' },
                },
              },
            },
          },
        ],
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'product_id' },
          name: { type: 'string', example: 'Laptop' },
          description: { type: 'string', example: 'High-performance laptop' },
          price: { type: 'number', example: 999.99 },
          category: { type: 'string', example: 'Electronics' },
          stock: { type: 'integer', example: 50 },
          image: { type: 'string', nullable: true, example: 'laptop.jpg' },
          rating: { type: 'number', example: 4.5 },
          numReviews: { type: 'integer', example: 100 },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;

