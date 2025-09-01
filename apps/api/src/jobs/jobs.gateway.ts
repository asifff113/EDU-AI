import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/jobs',
  cors: { origin: '*', credentials: true },
})
export class JobsGateway {
  @WebSocketServer()
  server!: Server;
}
