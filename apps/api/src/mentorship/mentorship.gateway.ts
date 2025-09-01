import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/mentorship',
  cors: { origin: true, credentials: true },
})
export class MentorshipGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  afterInit() {}

  emitRequestUpdate(payload: any) {
    this.server.emit('requests:update', payload);
  }
}
