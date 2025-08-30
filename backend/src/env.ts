import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.string().optional().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REGISTRATION_TOKEN: z.string().min(1).default(''),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

export function loadEnv() {
  // Load environment variables from .env files in the parent directory
  if (process.env.NODE_ENV === 'test') {
    // For tests, load from parent .env.test
    require('dotenv').config({ path: '../.env.test' });
  } else {
    // For development, load from parent .env
    require('dotenv').config({ path: '../.env' });
  }
}

// Load environment variables
loadEnv();

export const env = envSchema.parse(process.env);
