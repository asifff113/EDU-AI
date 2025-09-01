import { Logger } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/' })
export class AppGateway {
  private readonly logger = new Logger(AppGateway.name);

  @WebSocketServer()
  public server!: Server;

  handleConnection(): void {
    this.logger.log('Client connected');
  }

  handleDisconnect(): void {
    this.logger.log('Client disconnected');
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() message: string): string {
    return `pong:${message}`;
  }
}
