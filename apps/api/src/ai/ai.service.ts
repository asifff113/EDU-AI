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
        models.push({
          id: 'llama3.1:8b',
          name: 'llama3.1:8b',
          displayName: 'Llama 3.1 8B',
          provider: 'local',
        });
        break;

      case 'google':
        // First, let's check what models are actually available
        try {
          const apiKey = process.env.GOOGLE_AI_API_KEY || '';
          if (apiKey) {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
            );
            if (response.ok) {
              const data = (await response.json()) as {
                models?: Array<{
                  name: string;
                  displayName?: string;
                  supportedGenerationMethods?: string[];
                }>;
              };
              const geminiModels = data.models?.filter(
                (m) =>
                  m.name.includes('gemini') &&
                  m.supportedGenerationMethods?.includes('generateContent'),
              );
              console.log(
                '[Google AI] Available models:',
                geminiModels?.map((m) => m.name),
              );

              // Use the first two available Gemini models
              if (geminiModels && geminiModels.length > 0) {
                geminiModels.slice(0, 2).forEach((m) => {
                  const modelId = m.name.replace('models/', '');
                  models.push({
                    id: modelId,
                    name: modelId,
                    displayName: m.displayName || modelId,
                    provider: 'google',
                  });
                });
                break;
              }
            }
          }
        } catch (error) {
          console.error('[Google AI] Failed to fetch models:', error);
        }

        // Fallback to hardcoded models if API call fails
        models.push(
          {
            id: 'gemini-1.5-flash',
            name: 'gemini-1.5-flash',
            displayName: 'Gemini 1.5 Flash',
            provider: 'google',
          },
          {
            id: 'gemini-1.5-pro',
            name: 'gemini-1.5-pro',
            displayName: 'Gemini 1.5 Pro',
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
        const apiKey = process.env.GOOGLE_AI_API_KEY || '';

        if (!apiKey) {
          throw new Error(
            'Google AI API key not configured. Please set GOOGLE_AI_API_KEY in your .env file',
          );
        }

        const modelName = model || 'gemini-2.5-flash';

        console.log('[Google AI] Making request with model:', modelName);
        console.log('[Google AI] API Key present:', !!apiKey);

        // Convert messages to Google AI format
        const contents = messages.map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`,
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

        console.log('[Google AI] Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Google AI] Error response:', errorText);
          throw new Error(
            `Google AI API error: ${response.status} - ${errorText}`,
          );
        }

        const data = (await response.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };

        const responseText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          'No response from Gemini';

        console.log(
          '[Google AI] Success! Response length:',
          responseText.length,
        );

        return {
          message: responseText,
          provider,
          model: modelName,
        };
      } catch (error) {
        console.error('[Google AI] Error:', error);
        // Fallback to mock response if Google AI is not available
        return {
          message: `Error from Google AI: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and try again.`,
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
