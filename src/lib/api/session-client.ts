import 'server-only';
import { redirect } from 'next/navigation';
import { readAccessToken } from '@/lib/auth/session-cookie';
import { createApiClient } from './client';

// API client for the logged-in area. A 401 means the token expired (or the
// user was removed) after the page started, so the session is dropped the same
// way `requireAccount()` does it.
export async function createSessionApiClient() {
  const token = await readAccessToken();
  if (!token) redirect('/login');

  const client = createApiClient(token);
  client.use({
    onResponse({ response }) {
      if (response.status === 401) redirect('/session-expired');
    },
  });
  return client;
}
