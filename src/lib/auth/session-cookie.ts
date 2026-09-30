import 'server-only';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'session';

export async function readAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

// The API token lives only in an httpOnly cookie, so client-side JavaScript
// (and any injected script) can never read it.
export async function storeAccessToken(
  token: string,
  expiresInSeconds: number,
) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresInSeconds,
  });
}

export async function clearAccessToken() {
  (await cookies()).delete(SESSION_COOKIE);
}
