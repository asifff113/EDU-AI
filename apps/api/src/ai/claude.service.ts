import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { ChatMessage, AIResponse } from './ollama.service';

@Injectable()
export class ClaudeService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.anthropic.com/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') || '';
  }

  async chat(
    messages: ChatMessage[],
    model: string = 'claude-3-haiku-20240307',
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      // Convert messages to Claude format
      const systemMessage = messages.find((m) => m.role === 'system');
      const conversationMessages = messages
        .filter((m) => m.role !== 'system')
        .map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        }));

      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          model,
          max_tokens: 1000,
          system: systemMessage?.content || 'You are a helpful AI tutor.',
          messages: conversationMessages,
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
        },
      );

      const content = response.data.content[0]?.text || 'No response';

      return {
        content,
        model,
        provider: 'claude' as any,
      };
    } catch (error) {
      console.error('Claude chat error:', error);
      throw new Error('Failed to get response from Claude');
    }
  }

  async listModels() {
    // Claude doesn't have a models endpoint, return available models
    return [
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
    ];
  }
}
