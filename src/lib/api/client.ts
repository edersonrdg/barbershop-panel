import 'server-only';
import createClient from 'openapi-fetch';
import { env } from '@/lib/env';
import type { paths } from './schema';

export function createApiClient(accessToken?: string) {
  return createClient<paths>({
    baseUrl: env.API_URL,
    cache: 'no-store',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
}
