import OpenAI from 'openai';
import { z } from 'zod';
import { env } from '../config/env.js';
import { IMPACT_AI_CATEGORIES, IMPACT_DIRECTIONS } from '../models/NewsImpactResult.js';
import type { AiImpactResult } from './types.js';
import { retryWithBackoff } from './utils/retry.js';
import { truncateText } from './utils/text.js';

const impactSchema = z.object({
  impact: z.number().int().min(1).max(10),
  direction: z.enum(IMPACT_DIRECTIONS),
  category: z.enum(IMPACT_AI_CATEGORIES),
  points: z.array(z.string().min(1)).min(3).max(6),
  confidence: z.number().min(0).max(1),
}).strict();

const systemPrompt = [
  'You are a financial-news impact classifier.',
  'Always respond by calling the provided function.',
  'Do not return free-form text.',
  'impact must be an integer 1-10.',
  'direction must be one of positive|negative|mixed|unclear.',
  `category must be one of ${IMPACT_AI_CATEGORIES.join('|')}.`,
  'points must contain 3-6 concise strings.',
  'confidence must be a number between 0 and 1.',
].join(' ');

const IMPACT_TOOL_NAME = 'set_news_impact';

const impactTool = {
  type: 'function',
  function: {
    name: IMPACT_TOOL_NAME,
    description: 'Classify market impact for a news article',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        impact: { type: 'integer', minimum: 1, maximum: 10 },
        direction: { type: 'string', enum: [...IMPACT_DIRECTIONS] },
        category: { type: 'string', enum: [...IMPACT_AI_CATEGORIES] },
        points: {
          type: 'array',
          minItems: 3,
          maxItems: 6,
          items: { type: 'string' },
        },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
      },
      required: ['impact', 'direction', 'category', 'points', 'confidence'],
    },
  },
} as const;

function isRetryableOpenAiError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes('429')
    || message.includes('rate limit')
    || message.includes('timeout')
    || message.includes('temporarily unavailable')
    || message.includes('5');
}

export class ImpactAiClassifier {
  private readonly client: OpenAI;

  constructor() {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for pipeline AI categorization');
    }
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async classify(headline: string, content: string): Promise<AiImpactResult> {
    const boundedContent = truncateText(content, env.PIPELINE_AI_MAX_CHARS);
    const userPrompt = JSON.stringify(
      {
        headline,
        content: boundedContent,
        required_output: {
          impact: 'integer 1-10',
          direction: 'positive|negative|mixed|unclear',
          category: IMPACT_AI_CATEGORIES,
          points: 'array of 3-6 short bullet strings',
          confidence: 'number 0-1',
        },
      },
      null,
      2
    );

    const rawArgs = await retryWithBackoff(
      async () => {
        const completion = await this.client.chat.completions.create({
          model: env.PIPELINE_AI_MODEL,
          temperature: 0.1,
          tools: [impactTool],
          tool_choice: {
            type: 'function',
            function: { name: IMPACT_TOOL_NAME },
          },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        });

        const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
        if (toolCall?.type !== 'function') {
          throw new Error('OpenAI response missing function tool call');
        }
        if (toolCall.function.name !== IMPACT_TOOL_NAME) {
          throw new Error(`OpenAI called unexpected function: ${toolCall.function.name}`);
        }
        return toolCall.function.arguments;
      },
      {
        attempts: env.PIPELINE_RETRY_ATTEMPTS,
        baseDelayMs: env.PIPELINE_RETRY_BASE_DELAY_MS,
        maxDelayMs: env.PIPELINE_RETRY_MAX_DELAY_MS,
        shouldRetry: isRetryableOpenAiError,
      }
    );

    const parsed = JSON.parse(rawArgs) as unknown;
    return impactSchema.parse(parsed);
  }
}
