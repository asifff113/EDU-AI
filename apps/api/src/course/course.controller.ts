import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UploadedFiles,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { CourseService } from './course.service';

@Controller('courses')
export class CourseController {
  constructor(private readonly courses: CourseService) {}

  @Get()
  async list() {
    try {
      return await this.courses.listCourses();
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch courses',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'courses');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const random = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${random}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 500 * 1024 * 1024 },
    }),
  )
  async create(
    @Request() req: any,
    @Body() body: any,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    try {
      // Expect body fields: title, description, details, price, seats, category, level, isPublic
      // And optional JSON string field contents describing text entries etc.
      const {
        title,
        description,
        details,
        price,
        seats,
        category,
        level,
        isPublic,
        contents: contentsJson,
      } = body;

      if (!title) {
        throw new HttpException('Title is required', HttpStatus.BAD_REQUEST);
      }

      const uploadedMap: Record<string, string> = {};
      for (const f of files ?? []) {
        // Accept fields: thumbnail, contentFiles[] or generic names
        const rel = `/uploads/courses/${f.filename}`;
        if (f.fieldname === 'thumbnail') {
          uploadedMap.thumbnail = rel;
        } else {
          if (!uploadedMap.contentFiles) uploadedMap.contentFiles = '';
          uploadedMap.contentFiles += `${rel};`;
        }
      }

      let contents: Array<any> = [];
      if (contentsJson) {
        try {
          const parsed = JSON.parse(contentsJson);
          if (Array.isArray(parsed)) contents = parsed;
        } catch {}
      }

      // Append uploaded file entries to contents if provided as files without explicit JSON
      if (uploadedMap.contentFiles) {
        const filesList = uploadedMap.contentFiles.split(';').filter(Boolean);
        const fileEntries = filesList.map((url, index) => ({
          type: inferTypeFromExtension(url),
          fileUrl: url,
          order: index,
        }));
        contents = [...contents, ...fileEntries];
      }

      const created = await this.courses.createCourse({
        title,
        description,
        details,
        price: price ? Number(price) : undefined,
        seats: seats ? Number(seats) : undefined,
        category,
        level,
        isPublic: isPublic !== undefined ? isTruthy(isPublic) : true,
        createdById: req.user?.id ?? null,
        thumbnail: uploadedMap.thumbnail ?? null,
        contents,
      });
      return created;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to create course',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

function isTruthy(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  return false;
}

function inferTypeFromExtension(url: string): string {
  const lower = url.toLowerCase();
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
