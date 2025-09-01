import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/scholarships',
  cors: { origin: true, credentials: true },
})
export class ScholarshipsGateway {
  @WebSocketServer()
  server!: Server;

  emitUpdate(userId: string) {
    this.server.emit('scholarships:update', { userId });
  }
}
