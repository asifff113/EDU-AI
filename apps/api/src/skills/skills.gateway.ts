import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/skills',
  cors: { origin: true, credentials: true },
})
export class SkillsGateway {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const userId = (client.handshake.auth?.userId ||
      client.handshake.query?.userId) as string;
    if (userId) client.join(userId);
  }
}
