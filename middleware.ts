import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Define paths that require authentication
  // const protectedPaths = ['/', '/dashboard'];
  
  // Define paths that are for guests only (redirect to dashboard if logged in)
  const authPaths = ['/login', '/register'];

  // Check if the current path requires authentication
  // We check if the pathname IS exactly one of the protected paths, 
  // OR if it starts with one of them (for nested routes, if we had any like /dashboard/settings)
  // For now, let's just check if it matches or starts with /dashboard.
  // Actually, '/' matches everything so we need be careful.
  
  // Let's refine the logic:
  // 1. If user is on an auth path (login/register) AND has a token -> Redirect to /
  if (authPaths.some(path => pathname.startsWith(path)) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 1.5 If user is at root '/' AND has a token -> Redirect to /dashboard
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. If user is on a protected path AND DOES NOT have a token -> Redirect to /login
  // Since '/' is the home/dashboard, we treat it as protected.
  // However, we need to allow static assets, api routes etc.
  // Best approach: Define explicit protected routes or protecting everything EXCEPT auth routes + public assets.
  
  // Detailed Logic:
  // If it's an auth path, we already handled the "logged in" case above.
  
  // If it's NOT an auth path, we assume it's protected, UNLESS it's a public asset.
  // But wait, what if we have a landing page? The prompt says "When the user is authenticated, do not allow to visit the login and register page."
  // It also implies we should probably protect the main app.
  // "Let's implement logout feature. When the user is authenticated, do not allow to visit the login and register page."
  // The user didn't explicitly say "Protect /dashboard" but usually that's implied in such apps. 
  // Given the previous task was "Setting Up Main Layout" and it seems / is the main dashboard.
  
  // Let's protect / and /dashboard.
  
  // Let's protect /dashboard and other private routes.
  // / is public (Landing Page).
  
  const isProtectedPath = pathname.startsWith('/dashboard');

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
