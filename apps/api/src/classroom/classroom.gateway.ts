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
  namespace: '/classrooms',
  cors: { origin: true, credentials: true },
})
export class ClassroomGateway {
  private readonly logger = new Logger(ClassroomGateway.name);

  @WebSocketServer()
  public server!: Server;

  @SubscribeMessage('join')
  join(
    @MessageBody() payload: { classroomId: string; breakoutId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = payload.breakoutId || payload.classroomId;
    client.join(room);
    client.emit('joined', { room });
  }

  @SubscribeMessage('leave')
  leave(
    @MessageBody() payload: { classroomId: string; breakoutId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = payload.breakoutId || payload.classroomId;
    client.leave(room);
    client.emit('left', { room });
  }

  // WebRTC signaling for AV
  @SubscribeMessage('signal')
  signal(@MessageBody() payload: { room: string; data: any; from: string }) {
    this.server.to(payload.room).emit('signal', payload);
  }

  // Collaborative whiteboard updates (vector ops)
  @SubscribeMessage('whiteboard')
  whiteboard(@MessageBody() payload: { room: string; op: any }) {
    this.server.to(payload.room).emit('whiteboard', payload);
  }

  // In-room chat
  @SubscribeMessage('chat')
  chat(@MessageBody() payload: { room: string; message: any }) {
    this.server.to(payload.room).emit('chat', payload.message);
  }

  // Raise hand / reactions
  @SubscribeMessage('hand')
  hand(
    @MessageBody() payload: { room: string; hand: boolean; userId: string },
  ) {
    this.server.to(payload.room).emit('hand', payload);
  }

  @SubscribeMessage('reaction')
  reaction(
    @MessageBody() payload: { room: string; emoji: string; userId: string },
  ) {
    this.server.to(payload.room).emit('reaction', payload);
  }

  // Host controls broadcast (mute, unmute, kick, role)
  @SubscribeMessage('host')
  host(
    @MessageBody()
    payload: {
      room: string;
      type: 'mute' | 'unmute' | 'kick' | 'role';
      targetUserId?: string;
      role?: string;
    },
  ) {
    this.server.to(payload.room).emit('host', payload);
  }
}
