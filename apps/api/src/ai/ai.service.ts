import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  models: AIModel[];
  type: 'text' | 'image';
}

export interface AIModel {
  id: string;
  name: string;
  displayName: string;
  provider: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  provider: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  message: string;
  provider: string;
  model: string;
}

@Injectable()
export class AIService {
  constructor(private readonly configService: ConfigService) {}
  async getProviders(): Promise<AIProvider[]> {
    const providers: AIProvider[] = [];

    // Get all local models
    const localModels = await this.getModels('local');

    // Add local models provider
    providers.push({
      id: 'local',
      name: 'local',
      displayName: 'Local AI Models',
      models: localModels,
      type: 'text',
    });

    // Get Google/Gemini models
    const geminiModels = await this.getModels('google');

    // Add Google/Gemini provider
    providers.push({
      id: 'google',
      name: 'google',
      displayName: 'Google AI (Gemini)',
      models: geminiModels,
      type: 'text',
    });

    return providers;
  }

  async getModels(provider?: string): Promise<AIModel[]> {
    const models: AIModel[] = [];

    if (!provider) {
      // Get models from all providers
      const providers = await this.getProviders();
      for (const p of providers) {
        const providerModels = await this.getModels(p.id);
        models.push(...providerModels);
      }
      return models;
    }

    switch (provider) {
      case 'local':
        models.push(
          {
            id: 'llama3.1:8b',
            name: 'llama3.1:8b',
            displayName: 'Llama 3.1 8B',
            provider: 'local',
          },
          {
            id: 'qwen3-coder:30b',
            name: 'qwen3-coder:30b',
            displayName: 'Qwen 3 Coder 30B',
            provider: 'local',
          },
          {
            id: 'gpt-oss:20b',
            name: 'gpt-oss:20b',
            displayName: 'GPT-OSS 20B',
            provider: 'local',
          },
          {
            id: 'deepseek-coder-v2:latest',
            name: 'deepseek-coder-v2:latest',
            displayName: 'DeepSeek Coder V2',
            provider: 'local',
          },
        );
        break;

      case 'google':
        models.push(
          {
            id: 'gemini-1.5-pro',
            name: 'gemini-1.5-pro',
            displayName: 'Gemini 1.5 Pro',
            provider: 'google',
          },
          {
            id: 'gemini-1.5-flash',
            name: 'gemini-1.5-flash',
            displayName: 'Gemini 1.5 Flash',
            provider: 'google',
          },
          {
            id: 'gemini-pro',
            name: 'gemini-pro',
            displayName: 'Gemini Pro',
            provider: 'google',
          },
        );
        break;

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    return models;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { provider, model, messages, temperature = 0.7 } = request;

    if (provider === 'local') {
      try {
        // Use Ollama API for local models
        const response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model || 'llama3.1:8b',
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            stream: false,
            options: {
              temperature,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = (await response.json()) as {
          message?: { content?: string };
        };
        return {
          message: data.message?.content || 'No response from model',
          provider,
          model: model || 'llama3.1:8b',
        };
      } catch (error) {
        console.error('Ollama API error:', error);
        // Fallback to mock response if Ollama is not available
        return {
          message: `Mock response from ${provider} using model ${model}. You said: "${messages[messages.length - 1].content}"`,
          provider,
          model: model || 'llama3.1:8b',
        };
      }
    }

    if (provider === 'google') {
      try {
        // Use Google AI Studio API for Gemini models
        const apiKey =
          process.env.GOOGLE_AI_API_KEY ||
          'AIzaSyBmffnjO0VAkPSDyZk0WRj8iFFxHtq7BAE';
        const modelName = model || 'gemini-1.5-flash';

        // Convert messages to Google AI format
        const contents = messages.map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature,
                maxOutputTokens: 2048,
              },
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`Google AI API error: ${response.statusText}`);
        }

        const data = (await response.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };

        const responseText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          'No response from Gemini';

        return {
          message: responseText,
          provider,
          model: modelName,
        };
      } catch (error) {
        console.error('Google AI API error:', error);
        // Fallback to mock response if Google AI is not available
        return {
          message: `Mock response from ${provider} using model ${model}. You said: "${messages[messages.length - 1].content}"`,
          provider,
          model: model || 'gemini-1.5-flash',
        };
      }
    }

    // For other providers, return mock response for now
    return {
      message: `Mock response from ${provider} using model ${model}. You said: "${messages[messages.length - 1].content}"`,
      provider,
      model: model || 'default',
    };
  }

  async generateText(
    prompt: string,
    provider: string,
    model?: string,
  ): Promise<string> {
    const messages: ChatMessage[] = [{ role: 'user', content: prompt }];
    const response = await this.chat({
      messages,
      provider,
      model,
    });
    return response.message;
  }

  generateImage(
    prompt: string,
    _provider: string = 'dalle',
    _options?: any,
  ): Promise<string> {
    return Promise.resolve(`Mock image generated for prompt: ${prompt}`);
  }
}
