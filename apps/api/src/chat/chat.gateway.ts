import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
})
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  public server!: Server;

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  join(
    @MessageBody() payload: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(payload.conversationId);
    client.emit('joined', { conversationId: payload.conversationId });
  }

  @SubscribeMessage('leave')
  leave(
    @MessageBody() payload: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(payload.conversationId);
    client.emit('left', { conversationId: payload.conversationId });
  }

  @SubscribeMessage('message')
  message(@MessageBody() payload: { conversationId: string; message: any }) {
    this.server.to(payload.conversationId).emit('message', payload.message);
  }

  @SubscribeMessage('signal')
  signal(
    @MessageBody() payload: { conversationId: string; data: any; from: string },
  ) {
    this.server.to(payload.conversationId).emit('signal', payload);
  }
}
