import 'dotenv/config';
import { z } from 'zod';

const booleanish = z.enum(['true', 'false']).transform((v) => v === 'true');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']),
  PORT: z.coerce.number().int().positive(),
  TZ: z.string().min(1),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),

  MONGODB_URI: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().min(1),
  JWT_REFRESH_TTL: z.string().min(1),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15),

  CORS_ORIGIN: z
    .string()
    .min(1)
    .transform((v) =>
      v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    ),

  HDM_API_KEY: z.string().startsWith('hdm_'),
  HDM_API_URL: z.string().url(),
  HDM_FROM_EMAIL: z.string().email(),
  HDM_FROM_NAME: z.string().min(1),
  HDM_SMS_SENDER: z.string().min(1).max(11),

  EMAIL_ENABLED: booleanish,
  SMS_ENABLED: booleanish,

  NOTIFY_RETRY_MAX: z.coerce.number().int().min(0).max(10),
  NOTIFY_RETRY_BACKOFF_MS: z.string().min(1).transform((v) =>
    v
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n >= 0)
  ),

  DEFAULT_RATE_PER_KG: z.coerce.number().min(0),

  // Added for Keep-Alive
  API_URL: z.string().url().optional().or(z.literal('')),
  KEEP_ALIVE_ENABLED: booleanish.optional().default('false'),
  KEEP_ALIVE_VERBOSE: booleanish.optional().default('false'),

  SENTRY_DSN: z.string().optional().default('')
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

const env = Object.freeze(parsed.data);

export default env;