import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { ChatMessage, AIResponse } from './ollama.service';

interface HuggingFaceInferenceRequest {
  inputs: string;
  parameters?: {
    max_new_tokens?: number;
    temperature?: number;
    do_sample?: boolean;
    top_p?: number;
    repetition_penalty?: number;
    return_full_text?: boolean;
  };
  options?: {
    wait_for_model?: boolean;
    use_cache?: boolean;
  };
}

interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

@Injectable()
export class HuggingFaceService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api-inference.huggingface.co/models';

  // Supported models with their specific capabilities
  private readonly supportedModels = [
    'mistralai/Mistral-7B-Instruct-v0.1',
    'HuggingFaceH4/zephyr-7b-beta',
    'microsoft/DialoGPT-large',
    'facebook/blenderbot-400M-distill',
    'gpt2',
  ];

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('HUGGINGFACE_API_KEY') || '';
  }

  async chat(
    messages: ChatMessage[],
    model: string = 'mistralai/Mistral-7B-Instruct-v0.1',
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error(
        'HuggingFace API key not configured. Please set HUGGINGFACE_API_KEY in your environment.',
      );
    }

    try {
      // Format messages into a single prompt based on the model
      const prompt = this.formatMessages(messages, model);

      const requestBody: HuggingFaceInferenceRequest = {
        inputs: prompt,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.95,
          repetition_penalty: 1.1,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/${model}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        },
      );

      const result = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      if (result.error) {
        throw new Error(`HuggingFace API error: ${result.error}`);
      }

      let generatedText = result.generated_text || '';

      // Clean up the response to remove the original prompt if included
      if (generatedText.includes(prompt)) {
        generatedText = generatedText.replace(prompt, '').trim();
      }

      // Additional cleanup for instruct models
      if (model.includes('Instruct') || model.includes('instruct')) {
        generatedText = this.cleanInstructResponse(generatedText);
      }

      return {
        content: generatedText,
        model: model,
        provider: 'huggingface',
        usage: {
          prompt_tokens: this.estimateTokens(prompt),
          completion_tokens: this.estimateTokens(generatedText),
          total_tokens:
            this.estimateTokens(prompt) + this.estimateTokens(generatedText),
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error || error.message;

        if (status === 401) {
          throw new Error('Invalid HuggingFace API key');
        } else if (status === 429) {
          throw new Error('HuggingFace API rate limit exceeded');
        } else if (status === 503) {
          throw new Error(
            'Model is currently loading. Please try again in a moment.',
          );
        } else {
          throw new Error(`HuggingFace API error (${status}): ${message}`);
        }
      }
      throw error;
    }
  }

  async listModels() {
    return this.supportedModels.map((model) => ({
      name: model,
      description: this.getModelDescription(model),
    }));
  }

  private formatMessages(messages: ChatMessage[], model: string): string {
    // Different formatting based on model type
    if (model === 'mistralai/Mistral-7B-Instruct-v0.1') {
      return this.formatMistralMessages(messages);
    } else if (model === 'HuggingFaceH4/zephyr-7b-beta') {
      return this.formatZephyrMessages(messages);
    } else {
      // Default formatting for other models
      return this.formatGenericMessages(messages);
    }
  }

  private formatMistralMessages(messages: ChatMessage[]): string {
    // Mistral Instruct format: <s>[INST] user_message [/INST] assistant_response</s>
    let conversation = '';

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      if (message.role === 'user') {
        if (i === 0) {
          conversation += `<s>[INST] ${message.content} [/INST]`;
        } else {
          conversation += ` [INST] ${message.content} [/INST]`;
        }
      } else if (message.role === 'assistant') {
        conversation += ` ${message.content}</s>`;
        if (i < messages.length - 1) {
          conversation += '<s>';
        }
      } else if (message.role === 'system') {
        // System messages are included at the beginning
        conversation = `<s>[INST] ${message.content}\n\n${conversation.replace('<s>[INST] ', '')}`;
      }
    }

    // If the last message is from user, we're expecting a response
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user' && !conversation.endsWith('[/INST]')) {
      conversation += '';
    }

    return conversation;
  }

  private formatZephyrMessages(messages: ChatMessage[]): string {
    // Zephyr format: <|system|>\nsystem_message</s>\n<|user|>\nuser_message</s>\n<|assistant|>\nassistant_message</s>\n
    let conversation = '';

    // Add system message if present
    const systemMessage = messages.find((m) => m.role === 'system');
    if (systemMessage) {
      conversation += `<|system|>\n${systemMessage.content}</s>\n`;
    }

    // Add conversation turns
    for (const message of messages) {
      if (message.role === 'system') continue; // Already handled above

      if (message.role === 'user') {
        conversation += `<|user|>\n${message.content}</s>\n`;
      } else if (message.role === 'assistant') {
        conversation += `<|assistant|>\n${message.content}</s>\n`;
      }
    }

    // If the last message is from user, prepare for assistant response
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      conversation += '<|assistant|>\n';
    }

    return conversation;
  }

  private formatGenericMessages(messages: ChatMessage[]): string {
    // Simple format for generic models
    let conversation = '';

    for (const message of messages) {
      if (message.role === 'system') {
        conversation += `System: ${message.content}\n\n`;
      } else if (message.role === 'user') {
        conversation += `Human: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        conversation += `Assistant: ${message.content}\n\n`;
      }
    }

    // Add prompt for next response
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      conversation += 'Assistant:';
    }

    return conversation;
  }

  private cleanInstructResponse(text: string): string {
    // Remove common instruction artifacts
    text = text.replace(/^\s*Assistant:\s*/i, '');
    text = text.replace(/^\s*AI:\s*/i, '');
    text = text.replace(/^\s*Response:\s*/i, '');
    text = text.replace(/<\/s>\s*$/i, '');
    text = text.replace(/\[\/INST\]\s*/i, '');

    // Remove repeated patterns
    const lines = text.split('\n');
    const cleanLines = lines.filter((line, index) => {
      if (index === 0) return true;
      return line !== lines[index - 1]; // Remove consecutive duplicate lines
    });

    return cleanLines.join('\n').trim();
  }

  private getModelDescription(model: string): string {
    const descriptions: Record<string, string> = {
      'mistralai/Mistral-7B-Instruct-v0.1':
        'Mistral 7B Instruct model optimized for instruction following and chat',
      'HuggingFaceH4/zephyr-7b-beta':
        'Zephyr 7B Beta - Fine-tuned for helpful, harmless, and honest conversations',
      'microsoft/DialoGPT-large':
        'Large-scale conversational response generation',
      'facebook/blenderbot-400M-distill':
        'Distilled BlenderBot for conversations',
      gpt2: 'GPT-2 text generation model',
    };

    return descriptions[model] || 'HuggingFace model for text generation';
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}
