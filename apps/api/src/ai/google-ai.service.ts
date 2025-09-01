import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { ChatMessage, AIResponse } from './ollama.service';

@Injectable()
export class GoogleAIService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY') || '';
  }

  async chat(
    messages: ChatMessage[],
    model: string = 'gemini-1.5-flash',
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error(
        'Google AI API key not configured. Please set GOOGLE_AI_API_KEY in your environment.',
      );
    }

    try {
      // Handle system messages for Gemini
      const systemMessage = messages.find((msg) => msg.role === 'system');
      const conversationMessages = messages.filter(
        (msg) => msg.role !== 'system',
      );

      // Convert messages to Google AI format
      const contents = conversationMessages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const requestBody: any = {
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          stopSequences: [],
        },
      };

      // Add system instruction if present (for newer Gemini models)
      if (systemMessage && (model.includes('1.5') || model.includes('2.0'))) {
        requestBody.systemInstruction = {
          parts: [{ text: systemMessage.content }],
        };
      }

      const response = await axios.post(
        `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
        requestBody,
        {
          timeout: 30000,
        },
      );

      const candidate = response.data.candidates?.[0];
      if (!candidate) {
        throw new Error('No response generated');
      }

      if (candidate.finishReason === 'SAFETY') {
        throw new Error('Response blocked by safety filters');
      }

      const content = candidate.content?.parts?.[0]?.text || 'No response';

      // Calculate token usage (estimation)
      const promptTokens = this.estimateTokens(
        messages.map((m) => m.content).join(' '),
      );
      const completionTokens = this.estimateTokens(content);

      return {
        content,
        model,
        provider: 'google',
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens,
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.message;

        if (status === 400) {
          throw new Error(`Invalid request: ${message}`);
        } else if (status === 403) {
          throw new Error('Google AI API key is invalid or has no access');
        } else if (status === 429) {
          throw new Error('Google AI API rate limit exceeded');
        } else {
          throw new Error(`Google AI API error (${status}): ${message}`);
        }
      }
      console.error('Google AI chat error:', error);
      throw new Error('Failed to get response from Google AI');
    }
  }

  async listModels() {
    // Return available Gemini models
    const supportedModels = [
      {
        name: 'gemini-1.5-flash',
        description: 'Fast and efficient model for most tasks',
      },
      {
        name: 'gemini-1.5-pro',
        description: 'Advanced reasoning and complex tasks',
      },
      {
        name: 'gemini-pro',
        description: 'Previous generation general purpose model',
      },
      {
        name: 'gemini-pro-vision',
        description: 'Multimodal model with vision capabilities',
      },
    ];

    if (!this.apiKey) {
      return supportedModels;
    }

    try {
      // Try to fetch actual available models from API
      const response = await axios.get(
        `${this.baseUrl}/models?key=${this.apiKey}`,
        { timeout: 5000 },
      );

      const availableModels = response.data.models
        ?.filter((model: any) => model.name.includes('gemini'))
        .map((model: any) => ({
          name: model.name.replace('models/', ''),
          description: model.displayName || 'Google Gemini model',
        }));

      return availableModels?.length > 0 ? availableModels : supportedModels;
    } catch (error) {
      console.log('Using default Gemini models (API fetch failed)');
      return supportedModels;
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for most languages
    return Math.ceil(text.length / 4);
  }
}
