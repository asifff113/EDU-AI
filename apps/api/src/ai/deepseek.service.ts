import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { ChatMessage, AIResponse } from './ollama.service';

@Injectable()
export class DeepSeekService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.deepseek.com/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY') || '';
  }

  async chat(
    messages: ChatMessage[],
    model: string = 'deepseek-chat',
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    try {
      // Convert messages to OpenAI format (DeepSeek uses OpenAI-compatible API)
      const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content =
        response.data.choices[0]?.message?.content || 'No response';

      return {
        content,
        model,
        provider: 'deepseek' as any,
      };
    } catch (error) {
      console.error('DeepSeek chat error:', error);
      throw new Error('Failed to get response from DeepSeek');
    }
  }

  async listModels() {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error listing DeepSeek models:', error);
      // Return default models if API call fails
      return [
        { id: 'deepseek-chat', object: 'model' },
        { id: 'deepseek-coder', object: 'model' },
      ];
    }
  }
}
