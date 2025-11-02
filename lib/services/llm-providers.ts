import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LlmProvider } from '@prisma/client';
import { LLMConfig, LLMResponse } from '../types';
import { retryWithBackoff } from '../utils/retry';

export interface ILLMProvider {
  analyze<T = any>(prompt: string, config: LLMConfig): Promise<LLMResponse<T>>;
}

/**
 * Strip markdown code fences from JSON response
 */
function stripMarkdownCodeFences(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove ```json ... ``` or ``` ... ``` code blocks
  let cleaned = text
    .replace(/^```json\s*\n/gm, '')
    .replace(/^```\s*\n/gm, '')
    .replace(/\n```\s*$/gm, '')
    .replace(/^```$/gm, '')
    .trim();

  // Sometimes LLMs wrap with just ``` at start and end
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }

  return cleaned.trim();
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
    return retryWithBackoff(
      async () => {
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

      // Defensive parsing: strip markdown fences and validate
      const cleanedText = stripMarkdownCodeFences(content.trim());

      // Log first 500 chars for debugging
      console.log(`[OpenAI] Raw response preview: ${cleanedText.substring(0, 500)}...`);

      if (!cleanedText || cleanedText.length === 0) {
        console.error(`[OpenAI] Empty response. Original length: ${content.length}, After cleaning: ${cleanedText.length}`);
        console.error(`[OpenAI] Original content: ${content.substring(0, 1000)}`);
        throw new Error('Empty response after cleaning markdown fences');
      }

      // Validate it looks like JSON before parsing
      if (!cleanedText.trim().startsWith('{') && !cleanedText.trim().startsWith('[')) {
        console.error(`[OpenAI] Response doesn't look like JSON: ${cleanedText.substring(0, 200)}`);
        throw new Error('Response is not valid JSON format');
      }

      let parsed: T;
      try {
        parsed = JSON.parse(cleanedText) as T;
      } catch (parseError) {
        console.error(`[OpenAI] JSON parse error. Raw content (first 500 chars): ${cleanedText.substring(0, 500)}`);
        throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
      }

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
          console.error('[OpenAI] Analysis error:', error);
          throw error;
        }
      },
      {
        maxAttempts: 3,
        delayMs: 2000,
        onRetry: (attempt, error) => {
          console.warn(`[OpenAI] Retry attempt ${attempt}/3: ${error.message}`);
        },
      }
    );
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
    return retryWithBackoff(
      async () => {
        try {
          const response = await this.client.messages.create({
            model: config.model || 'claude-sonnet-4-5-20250929',
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

          // Defensive parsing: strip markdown fences and validate
          const cleanedText = stripMarkdownCodeFences(content.text);

          // Log first 200 chars for debugging
          console.log(`[Anthropic] Raw response preview: ${cleanedText.substring(0, 200)}...`);

          if (!cleanedText) {
            throw new Error('Empty response after cleaning markdown fences');
          }

          let parsed: T;
          try {
            parsed = JSON.parse(cleanedText) as T;
          } catch (parseError) {
            console.error(`[Anthropic] JSON parse error. Raw content (first 500 chars): ${cleanedText.substring(0, 500)}`);
            throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
          }

          const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

          // Rough cost calculation (Claude 3.5 Sonnet pricing as of 2025)
          const inputCost = response.usage.input_tokens * 0.003 / 1000;
          const outputCost = response.usage.output_tokens * 0.015 / 1000;
          const cost = inputCost + outputCost;

          return {
            provider: LlmProvider.ANTHROPIC,
            model: config.model || 'claude-sonnet-4-5-20250929',
            content: parsed,
            tokensUsed,
            cost,
            raw: response,
          };
        } catch (error) {
          console.error('[Anthropic] Analysis error:', error);
          throw error;
        }
      },
      {
        maxAttempts: 3,
        delayMs: 2000,
        onRetry: (attempt, error) => {
          console.warn(`[Anthropic] Retry attempt ${attempt}/3: ${error.message}`);
        },
      }
    );
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
    return retryWithBackoff(
      async () => {
        try {
          const model = this.client.getGenerativeModel({
            model: config.model || 'gemini-2.5-pro',
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

      // Defensive parsing: strip markdown fences and validate
      const cleanedText = stripMarkdownCodeFences(text);

      // Log first 500 chars for debugging
      console.log(`[Google] Raw response preview (${cleanedText.length} chars): ${cleanedText.substring(0, 500)}...`);

      if (!cleanedText) {
        throw new Error('Empty response after cleaning markdown fences');
      }

      // Calculate tokens/cost before attempting to parse
      const tokensUsed = Math.ceil((prompt.length + text.length) / 4);
      const cost = tokensUsed * 0.00125 / 1000;

      // Check if response was truncated (ends mid-JSON)
      if (!cleanedText.trim().endsWith('}') && !cleanedText.trim().endsWith(']')) {
        console.warn(`[Google] Response appears truncated (doesn't end with } or ]). Length: ${cleanedText.length}`);
        // Try to fix by adding closing braces
        const openBraces = (cleanedText.match(/{/g) || []).length;
        const closeBraces = (cleanedText.match(/}/g) || []).length;
        const missing = openBraces - closeBraces;
        if (missing > 0) {
          const fixed = cleanedText + '}'.repeat(missing);
          console.log(`[Google] Attempting to fix by adding ${missing} closing braces`);
          try {
            const parsed = JSON.parse(fixed) as T;
            console.log(`[Google] ✅ Successfully parsed after adding closing braces`);
            return {
              provider: LlmProvider.GOOGLE,
              model: config.model || 'gemini-2.5-pro',
              content: parsed,
              tokensUsed,
              cost,
              raw: result,
            };
          } catch (e) {
            console.error(`[Google] Fix failed, continuing with original error`);
          }
        }
      }

      let parsed: T;
      try {
        parsed = JSON.parse(cleanedText) as T;
      } catch (parseError) {
        console.error(`[Google] JSON parse error. Raw content (first 1000 chars): ${cleanedText.substring(0, 1000)}`);
        console.error(`[Google] Raw content (last 500 chars): ${cleanedText.substring(Math.max(0, cleanedText.length - 500))}`);
        throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
      }

      return {
        provider: LlmProvider.GOOGLE,
        model: config.model || 'gemini-2.5-pro',
        content: parsed,
        tokensUsed,
        cost,
        raw: result,
      };
        } catch (error) {
          console.error('[Google] Analysis error:', error);
          throw error;
        }
      },
      {
        maxAttempts: 3,
        delayMs: 2000,
        onRetry: (attempt, error) => {
          console.warn(`[Google] Retry attempt ${attempt}/3: ${error.message}`);
        },
      }
    );
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
