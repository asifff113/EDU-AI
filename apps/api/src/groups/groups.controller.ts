import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { GroupsService } from './groups.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get()
  async list(@Query('search') search?: string) {
    return this.groups.listGroups({ search, onlyPublic: false });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.groups.getGroup(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Request() req: any, @Body() body: any) {
    const userId = req.user?.id as string;
    return this.groups.createGroup({
      name: body.name,
      description: body.description,
      isPublic: body.isPublic !== undefined ? isTruthy(body.isPublic) : true,
      creatorId: userId,
    });
  }

  @Post(':id/join')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async join(@Param('id') id: string, @Request() req: any) {
    return this.groups.joinGroup(id, req.user.id);
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async leave(@Param('id') id: string, @Request() req: any) {
    return this.groups.leaveGroup(id, req.user.id);
  }

  @Get(':id/messages')
  @UseGuards(AuthGuard)
  async messages(@Param('id') id: string) {
    return this.groups.listMessages(id);
  }

  @Post(':id/messages')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'groups');
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
  async postMessage(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user?.id as string;
    const fileUrl = file ? `/uploads/groups/${file.filename}` : undefined;
    return this.groups.postMessage({
      groupId: id,
      senderId: userId,
      content: body.content,
      type:
        body.type ||
        (file ? inferTypeFromExtension(file.originalname) : 'text'),
      fileUrl,
    });
  }
}

function isTruthy(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string')
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  return false;
}

function inferTypeFromExtension(name: string): string {
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
