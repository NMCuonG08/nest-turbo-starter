import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private pubClient: ReturnType<typeof createClient>;
  private subClient: ReturnType<typeof createClient>;
  private isConnected = false;

  constructor(
    private readonly app: any,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const redisUrl = this.configService.get<string>('REDIS_URL');

      this.pubClient = createClient({ url: redisUrl });
      this.subClient = this.pubClient.duplicate();

      this.pubClient.on('error', (err) => {
        this.logger.error({
          message: `Redis Pub Client error: ${err.message}`,
          context: 'RedisIoAdapter',
        });
      });

      this.subClient.on('error', (err) => {
        this.logger.error({
          message: `Redis Sub Client error: ${err.message}`,
          context: 'RedisIoAdapter',
        });
      });

      this.pubClient.on('connect', () => {
        this.logger.info({
          message: 'Redis Pub Client connected',
          context: 'RedisIoAdapter',
        });
      });

      this.subClient.on('connect', () => {
        this.logger.info({
          message: 'Redis Sub Client connected',
          context: 'RedisIoAdapter',
        });
      });

      await Promise.all([this.pubClient.connect(), this.subClient.connect()]);

      this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
      this.isConnected = true;

      this.logger.info({
        message: 'Redis IoAdapter connected for Socket.IO',
        context: 'RedisIoAdapter',
      });
    } catch (error) {
      this.logger.error({
        message: `Failed to connect Redis IoAdapter: ${error.message}`,
        context: 'RedisIoAdapter',
        error: error.stack,
      });
      throw error;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    if (!this.isConnected || !this.adapterConstructor) {
      this.logger.warn({
        message: 'Redis adapter not connected, using default adapter',
        context: 'RedisIoAdapter',
      });
      return super.createIOServer(port, options);
    }

    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }

  async close(): Promise<void> {
    try {
      if (this.pubClient?.isOpen) {
        await this.pubClient.quit();
      }
      if (this.subClient?.isOpen) {
        await this.subClient.quit();
      }
      this.isConnected = false;
      this.logger.info({
        message: 'Redis IoAdapter closed',
        context: 'RedisIoAdapter',
      });
    } catch (error) {
      this.logger.error({
        message: `Error closing Redis IoAdapter: ${error.message}`,
        context: 'RedisIoAdapter',
      });
    }
  }
}

