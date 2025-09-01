import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: 'ollama' | 'google' | 'huggingface' | 'deepseek' | 'claude';
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class OllamaService {
  private readonly ollamaUrl: string;

  constructor(private configService: ConfigService) {
    this.ollamaUrl = this.configService.get<string>(
      'OLLAMA_URL',
      'http://localhost:11434',
    );
  }

  async listModels() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Error listing Ollama models:', error);
      return [];
    }
  }

  async chat(
    messages: ChatMessage[],
    model: string = 'llama2',
  ): Promise<AIResponse> {
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model,
        messages,
        stream: false,
      });

      return {
        content: response.data.message.content,
        model,
        provider: 'ollama',
      };
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw new Error('Failed to get response from Ollama');
    }
  }

  async generate(
    prompt: string,
    model: string = 'llama2',
  ): Promise<AIResponse> {
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model,
        prompt,
        stream: false,
      });

      return {
        content: response.data.response,
        model,
        provider: 'ollama',
      };
    } catch (error) {
      console.error('Ollama generate error:', error);
      throw new Error('Failed to generate response from Ollama');
    }
  }
}
