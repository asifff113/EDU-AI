import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/admin',
  cors: { origin: true, credentials: true },
})
export class AdminGateway {
  private readonly logger = new Logger(AdminGateway.name);

  @WebSocketServer()
  public server!: Server;

  emit(event: string, payload: any) {
    try {
      this.server.emit(event, payload);
    } catch {}
  }
}
