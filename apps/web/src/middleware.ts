import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/courses',
  '/exam',
  '/profile',
  '/profiles',
  '/qa',
  '/resources',
  '/settings',
  '/tutor',
  '/chat',
  '/study-together',
  '/launch',
  '/admin',
];

// Routes that should redirect to dashboard if already authenticated (disabled)
// const authRoutes = ['/login', '/register', '/forgot-password'];

// Public routes that don't require authentication (reference)
// const publicRoutes = ['/', '/about', '/contact'];

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('eduai_token')?.value;
    const isAuthenticated = Boolean(token);

    // Check if the current path requires authentication
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    // const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    // const isPublicRoute = publicRoutes.includes(pathname);

    // If trying to access protected route without authentication
    if (isProtectedRoute && !isAuthenticated) {
      // Let /dashboard render in demo mode without hard-blocking to avoid server errors
      if (pathname === '/dashboard') return NextResponse.next();
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If trying to access auth routes while already authenticated
    // Allow access to login/register pages even if authenticated
    // (users might want to logout and login as different user)
    // if (isAuthRoute && isAuthenticated) {
    //   return NextResponse.redirect(new URL('/dashboard', request.url));
    // }

    // Allow access to public routes and authenticated users to protected routes
    return NextResponse.next();
  } catch (err) {
    // Never crash middleware; allow request to proceed
    console.error('middleware error', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.webmanifest (PWA manifest)
     * - icons (icon files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons).*)',
  ],
};
