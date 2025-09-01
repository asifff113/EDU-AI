import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  AIService,
  type ChatRequest,
  type AIProvider,
  type AIModel,
} from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Get('providers')
  async getProviders(): Promise<AIProvider[]> {
    try {
      return await this.aiService.getProviders();
    } catch (error) {
      throw new HttpException(
        'Failed to get providers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('models')
  async getModels(@Query('provider') provider?: string): Promise<AIModel[]> {
    try {
      return await this.aiService.getModels(provider);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to get models',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('chat')
  async chat(@Body() request: ChatRequest) {
    try {
      return await this.aiService.chat(request);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to generate chat response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-text')
  async generateText(
    @Body() body: { prompt: string; provider: string; model?: string },
  ) {
    try {
      const { prompt, provider, model } = body;
      const response = await this.aiService.generateText(
        prompt,
        provider,
        model,
      );
      return { text: response };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to generate text',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-image')
  async generateImage(
    @Body() body: { prompt: string; provider?: string; options?: any },
  ) {
    try {
      const { prompt, provider, options } = body;
      const response = await this.aiService.generateImage(
        prompt,
        provider,
        options,
      );
      return { url: response };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to generate image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
