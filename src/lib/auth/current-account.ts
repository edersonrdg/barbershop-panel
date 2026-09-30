import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createApiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import { readAccessToken } from './session-cookie';

export type MyAccount = ApiResponse<'/me', 'get'>;

// The proxy only checks that the cookie exists; this call is the real
// verification, done by the API on every render that needs the session.
const fetchCurrentAccount = cache(
  async (): Promise<MyAccount | 'no-session' | 'expired'> => {
    const token = await readAccessToken();
    if (!token) return 'no-session';

    const { data, response } = await createApiClient(token).GET('/me');
    if (data) return data;
    if (response.status === 401) return 'expired';
    throw new Error(`GET /me failed with status ${response.status}`);
  },
);

export async function requireAccount(): Promise<MyAccount> {
  const account = await fetchCurrentAccount();
  if (account === 'no-session') redirect('/login');
  if (account === 'expired') redirect('/session-expired');
  return account;
}

// Interface comfort only: the API still answers 403 to a barber on the
// owner-only routes, so this just avoids showing a screen that cannot work.
export async function requireOwner(): Promise<MyAccount> {
  const account = await requireAccount();
  if (account.user.role !== 'owner') redirect('/agenda');
  return account;
}
