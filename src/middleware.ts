import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/chat(.*)']);
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect authenticated users away from auth pages
  if (userId && isPublicRoute(req)) {
    // Check if there's a redirect URL parameter
    const redirectUrl = req.nextUrl.searchParams.get('redirect_url');
    if (redirectUrl && redirectUrl.startsWith('/chat')) {
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.redirect(new URL('/chat', req.url));
  }

  // Redirect unauthenticated users to sign-in with return URL
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users from home page to /chat
  if (userId && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/chat', req.url));
  }

  // Add pathname to headers for layout access
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', req.nextUrl.pathname);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};