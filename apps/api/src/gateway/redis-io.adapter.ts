import { IoAdapter } from '@nestjs/platform-socket.io';

import type { INestApplicationContext } from '@nestjs/common';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Server, ServerOptions } from 'socket.io';
import { Redis } from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly redisUrl: string,
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: ServerOptions): Server {
    const pubClient = new Redis(this.redisUrl);
    const subClient = new Redis(this.redisUrl);
    const adapter = createAdapter(pubClient, subClient);
    const server = super.createIOServer(port, options) as unknown as Server;
    if (adapter) {
      server.adapter(adapter);
    }
    return server;
  }
}
