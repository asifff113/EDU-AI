import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { AuthGuard } from '../auth/auth.guard';

interface AuthenticatedRequest extends Request {
  user?: any;
}

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get()
  async getExams(
    @Query('category') category?: string,
    @Query('subject') subject?: string,
    @Query('difficulty') difficulty?: string,
    @Query('search') search?: string,
  ) {
    try {
      const exams = await this.examService.getAllExams({
        category,
        subject,
        difficulty,
        search,
      });
      return exams;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch exams',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('categories')
  async getCategories() {
    try {
      return await this.examService.getExamCategories();
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('subjects')
  async getSubjects(@Query('category') category?: string) {
    try {
      return await this.examService.getExamSubjects(category);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch subjects',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getExam(@Param('id') id: string) {
    try {
      return await this.examService.getExamById(id);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch exam',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get(':id/questions')
  @UseGuards(AuthGuard)
  async getExamQuestions(@Param('id') id: string) {
    try {
      return await this.examService.getExamById(id, true);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch exam questions',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  async createExam(@Request() req: AuthenticatedRequest, @Body() body: any) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.examService.createExam(body, userId);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to create exam',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/questions')
  @UseGuards(AuthGuard)
  async addQuestions(
    @Param('id') examId: string,
    @Request() req: AuthenticatedRequest,
    @Body() body: { questions: any[] },
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.examService.addQuestionsToExam(
        examId,
        body.questions,
        userId,
      );
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to add questions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/start')
  @UseGuards(AuthGuard)
  async startExam(
    @Param('id') examId: string,
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

      return await this.examService.startExamAttempt(examId, userId);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to start exam',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('attempt/:attemptId/answer')
  @UseGuards(AuthGuard)
  async submitAnswer(
    @Param('attemptId') attemptId: string,
    @Body() body: { questionId: string; answer: string; timeSpent?: number },
  ) {
    try {
      return await this.examService.submitAnswer(
        attemptId,
        body.questionId,
        body.answer,
        body.timeSpent,
      );
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to submit answer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('attempt/:attemptId/finish')
  @UseGuards(AuthGuard)
  async finishExam(@Param('attemptId') attemptId: string) {
    try {
      return await this.examService.finishExamAttempt(attemptId);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to finish exam',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/history')
  @UseGuards(AuthGuard)
  async getUserHistory(@Request() req: AuthenticatedRequest) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.examService.getUserExamHistory(userId);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch user history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/stats')
  @UseGuards(AuthGuard)
  async getUserStats(@Request() req: AuthenticatedRequest) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.examService.getUserStats(userId);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch user stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-questions')
  @UseGuards(AuthGuard)
  async generateQuestions(
    @Body()
    body: {
      topic: string;
      difficulty: string;
      count: number;
      type: string;
    },
  ) {
    try {
      return await this.examService.generateAIQuestions(
        body.topic,
        body.difficulty,
        body.count,
        body.type,
      );
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to generate questions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
