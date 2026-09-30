import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'session';
const PUBLIC_PATHS = ['/login'];

// Optimistic check only: it reads the cookie without calling the API, so it
// stays fast on every navigation. The real check is `requireAccount()`.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|webp)$).*)',
  ],
};
