import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class ForumGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  handleConnection() {}
  handleDisconnect() {}

  @SubscribeMessage('forums:join')
  join(@MessageBody() payload: { room: string }) {
    // handled client-side by joining a room; rooms managed on client sockets
  }

  @SubscribeMessage('forums:post')
  post(@MessageBody() payload: { room: string; post: any }) {
    this.server.to(payload.room).emit('forums:post', payload.post);
  }
}
