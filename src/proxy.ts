import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'session';
// Pages for someone without a session; a logged-in user goes to the panel.
const GUEST_PATHS = ['/login', '/cadastro', '/esqueci-senha'];
// E-mail links (API `APP_WEB_URL`): open with or without a session, since the
// token in the link belongs to whoever received the e-mail.
const TOKEN_LINK_PATHS = ['/redefinir-senha', '/aceitar-convite'];

// Optimistic check only: it reads the cookie without calling the API, so it
// stays fast on every navigation. The real check is `requireAccount()`.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (TOKEN_LINK_PATHS.includes(pathname)) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isGuestPage = GUEST_PATHS.includes(pathname);

  if (!hasSession && !isGuestPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (hasSession && isGuestPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|webp)$).*)',
  ],
};
