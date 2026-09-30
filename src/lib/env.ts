import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  API_URL: z.url(),
});

export const env = envSchema.parse(process.env);
