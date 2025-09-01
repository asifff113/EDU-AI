import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly gateway: ChatGateway,
  ) {}

  @Get('search')
  async search(@Query('q') q: string) {
    return this.chat.searchUsers(q);
  }

  @Post('conversation')
  async getOrCreate(@Request() req: any, @Body() body: { userId: string }) {
    try {
      return await this.chat.getOrCreateConversation(req.user.id, body.userId);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('conversations')
  async list(@Request() req: any) {
    return this.chat.listConversations(req.user.id);
  }

  @Get('messages/:conversationId')
  async messages(
    @Request() req: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chat.listMessages(conversationId, req.user.id);
  }

  @Post('messages/:conversationId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'chat');
          if (!fs.existsSync(uploadDir))
            fs.mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  async send(
    @Request() req: any,
    @Param('conversationId') conversationId: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const fileUrl = file ? `/uploads/chat/${file.filename}` : undefined;
    const msg = await this.chat.sendMessage({
      conversationId,
      senderId: req.user.id,
      content: body.content,
      type: body.type || (file ? inferType(file.originalname) : 'text'),
      fileUrl,
    });
    // Broadcast to room so other participant(s) receive in realtime even without client emit
    try {
      this.gateway.server.to(conversationId).emit('message', msg);
    } catch {}
    return msg;
  }

  @Post('conversations/:conversationId/delete')
  async deleteConversation(
    @Request() req: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chat.deleteConversation(conversationId, req.user.id);
  }
}

function inferType(name: string): string {
  const lower = name.toLowerCase();
  if (
    lower.endsWith('.mp4') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.webm')
  )
    return 'video';
  if (lower.endsWith('.pdf')) return 'pdf';
  if (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.gif')
  )
    return 'image';
  if (
    lower.endsWith('.mp3') ||
    lower.endsWith('.wav') ||
    lower.endsWith('.m4a')
  )
    return 'audio';
  return 'file';
}
