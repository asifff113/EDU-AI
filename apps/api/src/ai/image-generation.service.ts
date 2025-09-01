import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ImageResponse {
  url: string;
  provider: 'splash' | 'stability' | 'openai';
  model?: string;
}

@Injectable()
export class ImageGenerationService {
  private readonly splashApiKey: string;
  private readonly stabilityApiKey: string;
  private readonly openaiApiKey: string;

  constructor(private configService: ConfigService) {
    this.splashApiKey = this.configService.get<string>('SPLASH_API_KEY') || '';
    this.stabilityApiKey =
      this.configService.get<string>('STABILITY_API_KEY') || '';
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
  }

  async generateWithSplash(prompt: string): Promise<ImageResponse> {
    if (!this.splashApiKey) {
      throw new Error('Splash API key not configured');
    }

    try {
      // Note: Replace with actual Splash API endpoint
      const response = await axios.post(
        'https://api.splash.com/v1/generate',
        {
          prompt,
          width: 1024,
          height: 1024,
        },
        {
          headers: {
            Authorization: `Bearer ${this.splashApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        url: response.data.url,
        provider: 'splash',
      };
    } catch (error) {
      console.error('Splash generation error:', error);
      throw new Error('Failed to generate image with Splash');
    }
  }

  async generateWithStability(prompt: string): Promise<ImageResponse> {
    if (!this.stabilityApiKey) {
      throw new Error('Stability AI API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
        {
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        },
        {
          headers: {
            Authorization: `Bearer ${this.stabilityApiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      // Convert base64 to URL (you might want to save to storage)
      const base64Image = response.data.artifacts[0].base64;
      const url = `data:image/png;base64,${base64Image}`;

      return {
        url,
        provider: 'stability',
        model: 'stable-diffusion-v1-6',
      };
    } catch (error) {
      console.error('Stability AI generation error:', error);
      throw new Error('Failed to generate image with Stability AI');
    }
  }

  async generateWithOpenAI(prompt: string): Promise<ImageResponse> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          prompt,
          n: 1,
          size: '1024x1024',
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        url: response.data.data[0].url,
        provider: 'openai',
        model: 'dall-e-2',
      };
    } catch (error) {
      console.error('OpenAI DALL-E generation error:', error);
      throw new Error('Failed to generate image with OpenAI DALL-E');
    }
  }
}
