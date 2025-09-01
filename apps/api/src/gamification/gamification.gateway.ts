import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/gamification',
  cors: { origin: true, credentials: true },
})
export class GamificationGateway {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    // Auto-join a private room if userId is provided via query for targeted updates
    const userId = (client.handshake.auth?.userId ||
      client.handshake.query?.userId) as string;
    if (userId) {
      client.join(userId);
    }
  }

  @SubscribeMessage('joinUser')
  joinUser(client: Socket, payload: { userId: string }) {
    if (payload?.userId) client.join(payload.userId);
  }
}
