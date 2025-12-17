import { MicroserviceName } from '@app/core';
import { registerAs } from '@nestjs/config';

export const getAppConfig = () => ({
  appName: process.env.QUIZ_SERVICE_APP_NAME,
  appPort: +process.env.QUIZ_SERVICE_APP_PORT || 3302,
  microserviceName: MicroserviceName.QuizService,
});

export const appConfiguration = registerAs('app', getAppConfig);
