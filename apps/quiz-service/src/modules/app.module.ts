import {
  AllExceptionFilter,
  appCommonConfiguration,
  getWinstonConfig,
  HttpLoggerMiddleware,
  kafkaConfiguration,
  rabbitmqConfiguration,
  tcpConfiguration,
} from '@app/common';
import {
  AwsS3Module,
  MicroserviceModule,
  MicroserviceName,
  RedisModule,
} from '@app/core';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { appConfiguration, dbConfiguration } from 'src/config';
import { RoleBasedAccessControlGuard } from 'src/guards/rbac.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { QuizModule } from './quiz';
import { QuizCategoryModule } from './quiz-category';
import { AppAuthGuard } from '../guards/app-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // validationSchema,
      validationOptions: {
        abortEarly: false,
      },
      load: [
        appCommonConfiguration,
        appConfiguration,
        dbConfiguration,
        rabbitmqConfiguration,
        kafkaConfiguration,
        tcpConfiguration,
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (dbConfig: ConfigType<typeof dbConfiguration>) => {
        return dbConfig;
      },
      inject: [dbConfiguration.KEY],
    }),
    WinstonModule.forRootAsync({
      useFactory: (
        appConfig: ConfigType<typeof appConfiguration>,
        appCommonConfig: ConfigType<typeof appCommonConfiguration>,
      ) => {
        return getWinstonConfig(appConfig.appName, appCommonConfig.nodeEnv);
      },
      inject: [appConfiguration.KEY, appCommonConfiguration.KEY],
    }),
    MicroserviceModule.registerAsync([
      {
        name: MicroserviceName.UserService,
        transport: Transport.TCP,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const userTcpURLConfig = configService.get('tcp.userService');
          return {
            ...userTcpURLConfig,
          };
        },
      },
      {
        name: MicroserviceName.QuizService,
        transport: Transport.TCP,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const userTcpURLConfig = configService.get('tcp.quizService');
          return {
            ...userTcpURLConfig,
          };
        },
      },
    ]),
    AuthModule,
    QuizCategoryModule,
    QuizModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AppAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleBasedAccessControlGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
