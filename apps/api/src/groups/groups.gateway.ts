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
  namespace: '/groups',
  cors: { origin: true, credentials: true },
})
export class GroupsGateway {
  private readonly logger = new Logger(GroupsGateway.name);

  @WebSocketServer()
  public server!: Server;

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() payload: { groupId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(payload.groupId);
    client.emit('joined', { groupId: payload.groupId });
  }

  @SubscribeMessage('leave')
  handleLeave(
    @MessageBody() payload: { groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(payload.groupId);
    client.emit('left', { groupId: payload.groupId });
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() payload: { groupId: string; message: any }) {
    this.server.to(payload.groupId).emit('message', payload.message);
  }

  // Simple WebRTC signaling passthrough
  @SubscribeMessage('signal')
  handleSignal(
    @MessageBody() payload: { groupId: string; data: any; from: string },
  ) {
    this.server.to(payload.groupId).emit('signal', payload);
  }
}
