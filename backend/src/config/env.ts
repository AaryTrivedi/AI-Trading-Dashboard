import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  MONGODB_URI: z.string().url().or(z.literal('')),
  CORS_ORIGINS: z.string().default('*'),
  // Auth0 (for express-oauth2-jwt-bearer)
  AUTH0_AUDIENCE: z.string().min(1, 'AUTH0_AUDIENCE is required'),
  AUTH0_ISSUER_BASE_URL: z.string().url('AUTH0_ISSUER_BASE_URL must be a valid URL'),
  AUTH0_TOKEN_SIGNING_ALG: z.enum(['RS256', 'HS256']).default('RS256'),
  // Massive.com (formerly Polygon) - required when NEWS_PROVIDER or STOCK_DATA_PROVIDER is 'massive'
  MASSIVE_API_KEY: z.string().min(1).optional(),
  NEWS_PROVIDER: z.enum(['massive']).default('massive'),
  STOCK_DATA_PROVIDER: z.enum(['massive']).default('massive'),
  OPENAI_API_KEY: z.string().min(1).optional(),
  PIPELINE_CRON_SCHEDULE: z.string().default('0 * * * *'),
  PIPELINE_CRON_ENABLED: z.coerce.boolean().default(true),
  PIPELINE_EXTRACT_CONCURRENCY: z.coerce.number().int().min(1).max(32).default(4),
  PIPELINE_AI_CONCURRENCY: z.coerce.number().int().min(1).max(32).default(4),
  PIPELINE_EXTRACT_TIMEOUT_MS: z.coerce.number().int().min(1000).max(5000).default(5000),
  PIPELINE_MIN_WORD_COUNT: z.coerce.number().int().min(50).default(200),
  PIPELINE_AI_MAX_CHARS: z.coerce.number().int().min(1000).default(12000),
  PIPELINE_RETRY_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
  PIPELINE_RETRY_BASE_DELAY_MS: z.coerce.number().int().min(50).default(300),
  PIPELINE_RETRY_MAX_DELAY_MS: z.coerce.number().int().min(100).default(3000),
  PIPELINE_PROMPT_VERSION: z.string().min(1).default('v1'),
  PIPELINE_AI_MODEL: z.string().min(1).default('gpt-4o-mini'),
  PIPELINE_INITIAL_LOOKBACK_HOURS: z.coerce.number().int().min(1).max(168).default(24),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Environment validation failed');
  }
  return parsed.data;
}

export const env = loadEnv();
