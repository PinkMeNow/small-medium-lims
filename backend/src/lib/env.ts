import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  ALERT_RECIPIENTS: z.string().optional(), // comma-separated emails
  ALERT_INTERVAL_HOURS: z.coerce.number().default(24),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Nevažeće env varijable:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
