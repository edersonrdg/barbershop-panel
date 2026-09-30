import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/session-cookie';

// Server components cannot delete cookies, so an expired token is cleared
// here; otherwise the proxy would bounce the user between /login and /.
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
