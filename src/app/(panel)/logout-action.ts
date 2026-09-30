'use server';

import { redirect } from 'next/navigation';
import { clearAccessToken } from '@/lib/auth/session-cookie';

export async function logout() {
  await clearAccessToken();
  redirect('/login');
}
