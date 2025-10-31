import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LlmProvider } from '@prisma/client';
import { LLMConfig, LLMResponse } from '../types';

export interface ILLMProvider {
  analyze<T = any>(prompt: string, config: LLMConfig): Promise<LLMResponse<T>>;
}

/**
 * OpenAI Provider
 */
export class OpenAIProvider implements ILLMProvider {
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required');
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyze<T = any>(prompt: string, config: LLMConfig): Promise<LLMResponse<T>> {
    try {
      const response = await this.client.chat.completions.create({
        model: config.model || 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: config.temperature || 0.3,
        max_tokens: config.maxTokens || 4000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in response');
      }

      const parsed = JSON.parse(content) as T;
      const tokensUsed = response.usage?.total_tokens || 0;

      // Rough cost calculation (GPT-4o pricing as of 2025)
      const inputCost = (response.usage?.prompt_tokens || 0) * 0.005 / 1000;
      const outputCost = (response.usage?.completion_tokens || 0) * 0.015 / 1000;
      const cost = inputCost + outputCost;

      return {
        provider: LlmProvider.OPENAI,
        model: config.model || 'gpt-4o',
        content: parsed,
        tokensUsed,
        cost,
        raw: response,
      };
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      throw error;
    }
  }
}

/**
 * Anthropic Provider
 */
export class AnthropicProvider implements ILLMProvider {
  private client: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyze<T = any>(prompt: string, config: LLMConfig): Promise<LLMResponse<T>> {
    try {
      const response = await this.client.messages.create({
        model: config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: config.maxTokens || 4000,
        temperature: config.temperature || 0.3,
        messages: [
          {
            role: 'user',
            content: prompt + '\n\nIMPORTANT: Return your response as valid JSON only, with no additional text.',
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const parsed = JSON.parse(content.text) as T;
      const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

      // Rough cost calculation (Claude 3.5 Sonnet pricing as of 2025)
      const inputCost = response.usage.input_tokens * 0.003 / 1000;
      const outputCost = response.usage.output_tokens * 0.015 / 1000;
      const cost = inputCost + outputCost;

      return {
        provider: LlmProvider.ANTHROPIC,
        model: config.model || 'claude-3-5-sonnet-20241022',
        content: parsed,
        tokensUsed,
        cost,
        raw: response,
      };
    } catch (error) {
      console.error('Anthropic analysis error:', error);
      throw error;
    }
  }
}

/**
 * Google Provider
 */
export class GoogleProvider implements ILLMProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is required');
    }
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }

  async analyze<T = any>(prompt: string, config: LLMConfig): Promise<LLMResponse<T>> {
    try {
      const model = this.client.getGenerativeModel({
        model: config.model || 'gemini-1.5-pro',
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt + '\n\nReturn your response as valid JSON only.' }] }],
        generationConfig: {
          temperature: config.temperature || 0.3,
          maxOutputTokens: config.maxTokens || 4000,
        },
      });

      const response = result.response;
      const text = response.text();

      const parsed = JSON.parse(text) as T;

      // Google doesn't provide detailed token counts in the same way
      // Rough estimation
      const tokensUsed = Math.ceil((prompt.length + text.length) / 4);

      // Rough cost calculation (Gemini 1.5 Pro pricing)
      const cost = tokensUsed * 0.00125 / 1000;

      return {
        provider: LlmProvider.GOOGLE,
        model: config.model || 'gemini-1.5-pro',
        content: parsed,
        tokensUsed,
        cost,
        raw: result,
      };
    } catch (error) {
      console.error('Google analysis error:', error);
      throw error;
    }
  }
}

/**
 * Factory to get the appropriate provider
 */
export class LLMProviderFactory {
  private static providers: Map<LlmProvider, ILLMProvider> = new Map();

  static getProvider(provider: LlmProvider): ILLMProvider {
    if (!this.providers.has(provider)) {
      switch (provider) {
        case LlmProvider.OPENAI:
          this.providers.set(provider, new OpenAIProvider());
          break;
        case LlmProvider.ANTHROPIC:
          this.providers.set(provider, new AnthropicProvider());
          break;
        case LlmProvider.GOOGLE:
          this.providers.set(provider, new GoogleProvider());
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    }

    return this.providers.get(provider)!;
  }

  static getAllProviders(): LlmProvider[] {
    return [LlmProvider.OPENAI, LlmProvider.ANTHROPIC, LlmProvider.GOOGLE];
  }
}
