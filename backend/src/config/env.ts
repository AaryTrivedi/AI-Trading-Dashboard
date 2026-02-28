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
