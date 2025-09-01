import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('forums')
@UseGuards(AuthGuard)
export class ForumController {
  constructor(private forum: ForumService) {}

  @Get('boards')
  listBoards() {
    return this.forum.listBoards();
  }

  @Post('boards')
  createBoard(
    @Req() req: any,
    @Body() body: { name: string; description?: string; isPublic?: boolean },
  ) {
    return this.forum.createBoard(req.user.id, body);
  }

  @Get('boards/:boardId/topics')
  listTopics(@Param('boardId') boardId: string) {
    return this.forum.listTopics(boardId);
  }

  @Post('boards/:boardId/topics')
  createTopic(
    @Req() req: any,
    @Param('boardId') boardId: string,
    @Body() body: { title: string; tags?: string[] },
  ) {
    return this.forum.createTopic(
      req.user.id,
      boardId,
      body.title,
      body.tags ?? [],
    );
  }

  @Get('topics/:topicId/posts')
  listPosts(@Param('topicId') topicId: string) {
    return this.forum.listPosts(topicId);
  }

  @Post('topics/:topicId/posts')
  addPost(
    @Req() req: any,
    @Param('topicId') topicId: string,
    @Body() body: { content: string },
  ) {
    return this.forum.addPost(req.user.id, topicId, body.content);
  }

  @Post('topics/:topicId/accept/:postId')
  accept(
    @Req() req: any,
    @Param('topicId') topicId: string,
    @Param('postId') postId: string,
  ) {
    return this.forum.setAccepted(req.user.id, topicId, postId, true);
  }

  @Post('topics/:topicId/pin')
  pin(
    @Req() req: any,
    @Param('topicId') topicId: string,
    @Body() body: { pinned: boolean },
  ) {
    return this.forum.togglePin(req.user.id, topicId, !!body.pinned);
  }

  @Post('topics/:topicId/lock')
  lock(
    @Req() req: any,
    @Param('topicId') topicId: string,
    @Body() body: { locked: boolean },
  ) {
    return this.forum.toggleLock(req.user.id, topicId, !!body.locked);
  }

  @Post('posts/:postId/delete')
  deletePost(@Req() req: any, @Param('postId') postId: string) {
    return this.forum.deletePost(req.user.id, postId);
  }

  @Post('posts/:postId/edit')
  editPost(
    @Req() req: any,
    @Param('postId') postId: string,
    @Body() body: { content: string },
  ) {
    return this.forum.editPost(req.user.id, postId, body.content);
  }

  @Post('posts/:postId/soft-delete')
  softDelete(@Req() req: any, @Param('postId') postId: string) {
    return this.forum.softDeletePost(req.user.id, postId);
  }

  @Post('subscribe')
  subscribe(
    @Req() req: any,
    @Body() body: { boardId?: string; topicId?: string; emailDigest?: boolean },
  ) {
    return this.forum.subscribe(req.user.id, body);
  }

  @Get('boards/:boardId/search')
  search(
    @Param('boardId') boardId: string,
    @Query('text') text?: string,
    @Query('tag') tag?: string,
    @Query('authorId') authorId?: string,
  ) {
    return this.forum.search(boardId, { text, tag, authorId });
  }
}
