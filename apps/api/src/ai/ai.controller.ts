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
      const providers = await this.aiService.getProviders();
      console.log(
        '[AI Controller] Providers loaded:',
        providers.map((p) => ({ name: p.name, models: p.models.length })),
      );
      return providers;
    } catch (error) {
      throw new HttpException(
        'Failed to get providers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('test-key')
  async testGoogleKey() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    console.log('[AI Controller] Testing Google AI key...');
    console.log('[AI Controller] Key present:', !!apiKey);
    console.log('[AI Controller] Key length:', apiKey?.length || 0);

    if (!apiKey) {
      return { success: false, message: 'No API key found in environment' };
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      );

      if (response.ok) {
        const data = (await response.json()) as { models?: any[] };
        return {
          success: true,
          message: 'API key is valid!',
          modelCount: data.models?.length || 0,
        };
      } else {
        const error = await response.json();
        return { success: false, message: error };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
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
