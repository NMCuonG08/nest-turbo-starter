import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '@nestjs/config';
import { jwtConfiguration } from '@app/common';
import { RedisService } from '@app/core';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
  role?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // TODO: Configure properly based on environment
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
@Injectable()
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger: Logger;

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    @Inject(jwtConfiguration.KEY)
    private readonly jwtConfig: ConfigType<typeof jwtConfiguration>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: Logger,
  ) {
    this.logger = this.winstonLogger.child({ context: WebSocketGateway.name });
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth or query
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn({
          message: 'WebSocket connection rejected: No token provided',
          socketId: client.id,
        });
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfig.secret,
      });

      if (!payload || !payload.id) {
        this.logger.warn({
          message: 'WebSocket connection rejected: Invalid token',
          socketId: client.id,
        });
        client.disconnect();
        return;
      }

      // Check token validity in Redis
      const userTokenKey = this.redisService.getUserTokenKey(
        payload.id,
        payload.jti,
      );
      const isTokenValid =
        await this.redisService.getValue<string>(userTokenKey);

      if (!isTokenValid) {
        this.logger.warn({
          message: 'WebSocket connection rejected: Token not found in Redis',
          socketId: client.id,
          userId: payload.id,
        });
        client.disconnect();
        return;
      }

      // Attach user info to socket
      client.userId = payload.id;
      client.email = payload.email;
      client.role = payload.role;

      // Join user-specific room
      await client.join(`user:${payload.id}`);

      // Store connection info in Redis
      const connectionKey = `ws:connection:${payload.id}:${client.id}`;
      await this.redisService.setValue(
        connectionKey,
        {
          connectedAt: new Date().toISOString(),
          socketId: client.id,
        },
        3600, // 1 hour TTL
      );

      this.logger.info({
        message: 'WebSocket client connected',
        socketId: client.id,
        userId: payload.id,
        email: payload.email,
      });

      // Emit connection confirmation
      client.emit('connected', {
        message: 'Connected to WebSocket server',
        userId: payload.id,
      });
    } catch (error) {
      this.logger.error({
        message: `WebSocket connection error: ${error.message}`,
        socketId: client.id,
        error: error.stack,
      });
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Clean up connection info from Redis
      const connectionKey = `ws:connection:${client.userId}:${client.id}`;
      await this.redisService.deleteKey(connectionKey);

      this.logger.info({
        message: 'WebSocket client disconnected',
        socketId: client.id,
        userId: client.userId,
      });
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
      userId: client.userId,
    });
  }

  /**
   * Emit event to specific user
   */
  async emitToUser(userId: string, event: string, data: any): Promise<void> {
    this.server.to(`user:${userId}`).emit(event, data);
    this.logger.debug({
      message: 'Emitted event to user',
      userId,
      event,
    });
  }

  /**
   * Emit event to multiple users
   */
  async emitToUsers(
    userIds: string[],
    event: string,
    data: any,
  ): Promise<void> {
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit(event, data);
    });
    this.logger.debug({
      message: 'Emitted event to multiple users',
      userIds,
      event,
    });
  }

  /**
   * Broadcast event to all connected clients
   */
  async broadcast(event: string, data: any): Promise<void> {
    this.server.emit(event, data);
    this.logger.debug({
      message: 'Broadcasted event to all clients',
      event,
    });
  }

  /**
   * Emit to a custom room
   */
  async emitToRoom(room: string, event: string, data: any): Promise<void> {
    this.server.to(room).emit(event, data);
    this.logger.debug({
      message: 'Emitted event to room',
      room,
      event,
    });
  }

  /**
   * Join user to a custom room
   */
  async joinRoom(socketId: string, room: string): Promise<void> {
    const socket = this.server.sockets.sockets.get(socketId);
    if (socket) {
      await socket.join(room);
      this.logger.debug({
        message: 'User joined room',
        socketId,
        room,
      });
    }
  }

  /**
   * Leave user from a room
   */
  async leaveRoom(socketId: string, room: string): Promise<void> {
    const socket = this.server.sockets.sockets.get(socketId);
    if (socket) {
      await socket.leave(room);
      this.logger.debug({
        message: 'User left room',
        socketId,
        room,
      });
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.server.sockets.sockets.size;
  }
}

