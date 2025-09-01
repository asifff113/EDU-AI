import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/goals',
  cors: { origin: true, credentials: true },
})
export class GoalsGateway {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const userId = (client.handshake.auth?.userId ||
      client.handshake.query?.userId) as string;
    if (userId) client.join(userId);
  }
}
