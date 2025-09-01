import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/wellness',
  cors: { origin: true, credentials: true },
})
export class WellnessGateway {
  @WebSocketServer()
  server!: Server;

  announceLog(log: any) {
    this.server.emit('logs:update', log);
  }
}
