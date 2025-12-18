import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AllExceptionFilter } from '@app/common';
import { WebSocketGateway } from './websocket.gateway';

/**
 * Consumer để nhận events từ các services khác qua TCP/Kafka
 * và emit qua WebSocket đến clients
 */
@UseFilters(AllExceptionFilter)
@Controller()
export class WebSocketConsumer {
  constructor(private readonly webSocketGateway: WebSocketGateway) {}

  /**
   * Emit event đến một user cụ thể
   * Pattern: 'ws:emit:user'
   * Payload: { userId: string, event: string, data: any }
   */
  @MessagePattern('ws:emit:user')
  async emitToUser(@Payload() payload: { userId: string; event: string; data: any }) {
    await this.webSocketGateway.emitToUser(payload.userId, payload.event, payload.data);
    return { success: true };
  }

  /**
   * Emit event đến nhiều users
   * Pattern: 'ws:emit:users'
   * Payload: { userIds: string[], event: string, data: any }
   */
  @MessagePattern('ws:emit:users')
  async emitToUsers(@Payload() payload: { userIds: string[]; event: string; data: any }) {
    await this.webSocketGateway.emitToUsers(payload.userIds, payload.event, payload.data);
    return { success: true };
  }

  /**
   * Broadcast event đến tất cả clients
   * Pattern: 'ws:broadcast'
   * Payload: { event: string, data: any }
   */
  @MessagePattern('ws:broadcast')
  async broadcast(@Payload() payload: { event: string; data: any }) {
    await this.webSocketGateway.broadcast(payload.event, payload.data);
    return { success: true };
  }

  /**
   * Emit event đến một room cụ thể
   * Pattern: 'ws:emit:room'
   * Payload: { room: string, event: string, data: any }
   */
  @MessagePattern('ws:emit:room')
  async emitToRoom(@Payload() payload: { room: string; event: string; data: any }) {
    await this.webSocketGateway.emitToRoom(payload.room, payload.event, payload.data);
    return { success: true };
  }
}

