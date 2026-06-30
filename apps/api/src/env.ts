import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Load the monorepo-root .env so the API and Prisma client see DATABASE_URL etc.
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') });

export const env = {
  port: Number(process.env.API_PORT ?? 4000),
  host: process.env.API_HOST ?? '0.0.0.0',
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-insecure-secret',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  flintModel: process.env.FLINT_MODEL ?? 'claude-sonnet-4-6',
};
