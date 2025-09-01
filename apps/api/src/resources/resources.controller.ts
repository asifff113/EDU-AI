import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResourcesService } from './resources.service';
import { AuthGuard } from '../auth/auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

interface AuthenticatedRequest extends Request {
  user?: any;
}

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  async getResources(
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    try {
      await this.resourcesService.ensureDemoStoreItems().catch(() => {});
      const resources = await this.resourcesService.getAllResources({
        category,
        type,
        level,
        search,
        sortBy,
      });
      return resources;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch resources',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getResource(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user?.id;
      const resource = await this.resourcesService.getResourceById(id, userId);

      // Increment view count
      await this.resourcesService.incrementViews(id);

      return resource;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch resource',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/resources',
        filename: (req: any, file: any, cb: any) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    }),
  )
  async createResource(
    @Request() req: AuthenticatedRequest,
    @Body() body: any,
    @UploadedFile() file?: any,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const resourceData = {
        ...body,
        fileUrl: file ? `/uploads/resources/${file.filename}` : undefined,
        fileSize: file
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : undefined,
      };

      const resource = await this.resourcesService.createResource(
        resourceData,
        userId,
      );
      return resource;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to create resource',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateResource(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() body: any,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const resource = await this.resourcesService.updateResource(
        id,
        body,
        userId,
      );
      return resource;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to update resource',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteResource(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result = await this.resourcesService.deleteResource(id, userId);
      return result;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to delete resource',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/download')
  async downloadResource(@Param('id') id: string) {
    try {
      await this.resourcesService.incrementDownloads(id);
      return { message: 'Download count updated' };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to update download count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Store: create a purchase for paid items
  @Post(':id/purchase')
  @UseGuards(AuthGuard)
  async purchase(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      const purchase = await this.resourcesService.purchase(id, userId);
      return purchase;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Purchase failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/favorite')
  @UseGuards(AuthGuard)
  async toggleFavorite(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result = await this.resourcesService.toggleFavorite(id, userId);
      return result;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to toggle favorite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/review')
  @UseGuards(AuthGuard)
  async addReview(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() body: { rating: number; comment?: string },
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const review = await this.resourcesService.addReview(
        id,
        userId,
        body.rating,
        body.comment,
      );
      return review;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to add review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/my-resources')
  @UseGuards(AuthGuard)
  async getUserResources(@Request() req: AuthenticatedRequest) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const resources = await this.resourcesService.getUserResources(userId);
      return resources;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch user resources',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/favorites')
  @UseGuards(AuthGuard)
  async getUserFavorites(@Request() req: AuthenticatedRequest) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const favorites = await this.resourcesService.getUserFavorites(userId);
      return favorites;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch user favorites',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
