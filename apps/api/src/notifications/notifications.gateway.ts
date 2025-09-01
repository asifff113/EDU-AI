import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: true, credentials: true },
})
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  broadcast(userId: string) {
    this.server.emit('notifications:update', { userId });
  }
}
