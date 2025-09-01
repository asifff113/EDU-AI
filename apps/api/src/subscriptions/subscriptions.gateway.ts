import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/subscriptions',
  cors: { origin: true, credentials: true },
})
export class SubscriptionsGateway {
  @WebSocketServer()
  server!: Server;

  broadcastUpdate(payload: any) {
    this.server.emit('plans:update', payload);
  }
}
