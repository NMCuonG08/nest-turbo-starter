import { registerAs } from '@nestjs/config';

export const tcpConfiguration = registerAs('tcp', () => ({
  authService: {
    host: process.env.TCP_AUTH_SERVICE_HOST,
    port: process.env.TCP_AUTH_SERVICE_PORT,
  },
  userService: {
    host: process.env.TCP_USER_SERVICE_HOST,
    port: process.env.TCP_USER_SERVICE_PORT,
  },
  productService: {
    host: process.env.TCP_PRODUCT_SERVICE_HOST,
    port: process.env.TCP_PRODUCT_SERVICE_PORT,
  },
  notificationService: {
    host: process.env.TCP_NOTIFICATION_SERVICE_HOST,
    port: process.env.TCP_NOTIFICATION_SERVICE_PORT,
  },
  quizService: {
    host: process.env.TCP_QUIZ_SERVICE_HOST,
    port: process.env.TCP_QUIZ_SERVICE_PORT,
  },
}));
