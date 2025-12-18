import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { WebSocketGateway } from './websocket.gateway';
import { WebSocketConsumer } from './websocket.consumer';
import { jwtConfiguration } from '@app/common';
import { RedisModule } from '@app/core';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    RedisModule,
  ],
  providers: [WebSocketGateway],
  controllers: [WebSocketConsumer],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}

