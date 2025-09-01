import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/favicon.ico',
  '/manifest.json',
]);

const PUBLIC_FILE = /\.(ico|png|jpg|jpeg|svg|css|js|map|json)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow _next and API and static assets through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Allow explicitly public routes
  if (PUBLIC_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  // Check for a session cookie named 'eduai_token'
  const token = req.cookies.get('eduai_token')?.value;
  if (!token) {
    // Redirect to login with a `from` query so app can redirect back after login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists we allow the request. Token validation can be added later (server-side).
  return NextResponse.next();
}

export const config = {
  // Run middleware for all routes (we whitelist inside middleware)
  matcher: ['/:path*'],
};
