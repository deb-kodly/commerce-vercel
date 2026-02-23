import { IS_GUEST_USER_COOKIE_NAME, SFDC_PORTAL_USER_ID_COOKIE_NAME } from 'lib/constants';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // A user is authenticated if they have a portal user ID cookie set at login
  const portalUserId = request.cookies.get(SFDC_PORTAL_USER_ID_COOKIE_NAME)?.value;
  const isAuthenticated = !!portalUserId;

  // Redirect unauthenticated users to /login for all protected routes
  if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from /login to the home page
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Forward x-pathname as a request header so server layouts can detect the current route
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  res.cookies.set(IS_GUEST_USER_COOKIE_NAME, JSON.stringify(!isAuthenticated), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.headers.set('x-guest-user', JSON.stringify(!isAuthenticated));

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
