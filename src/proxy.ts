import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export type UserRole = "ADMIN" | "USER";

export type RouteConfig = {
  exact: string[];
  patterns: RegExp[];
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/terms',
  '/privacy',
];

// Auth routes that logged-in users shouldn't access
export const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];

// Common protected routes (accessible by all authenticated users)
export const commonProtectedRoutes: RouteConfig = {
  exact: ['/my-profile', '/settings'],
  patterns: [],
}

// Admin protected routes
export const adminProtectedRoutes: RouteConfig = {
  patterns: [/^\/admin/], // Routes starting with /admin/*
  exact: [],
}

// User protected routes
export const userProtectedRoutes: RouteConfig = {
  patterns: [/^\/dashboard/], // Routes starting with /dashboard/*
  exact: [],
}

// Check if pathname is an auth route
export const isAuthRoute = (pathname: string): boolean => {
  return authRoutes.some((route: string) => route === pathname);
}

// Check if pathname matches a route configuration
export const isRouteMatches = (pathname: string, routes: RouteConfig): boolean => {
  if (routes.exact.includes(pathname)) {
    return true;
  }
  return routes.patterns.some((pattern: RegExp) => pattern.test(pathname));
}

// Get the owner/role required for a specific route
export const getRouteOwner = (pathname: string): "ADMIN" | "USER" | "COMMON" | null => {
  if (isRouteMatches(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  }
  if (isRouteMatches(pathname, userProtectedRoutes)) {
    return "USER";
  }
  if (isRouteMatches(pathname, commonProtectedRoutes)) {
    return "COMMON";
  }
  return null;
}

// Get default dashboard route based on user role
export const getDefaultDashboardRoute = (role: UserRole): string => {
  if (role === "ADMIN") {
    return "/admin/dashboard";
  }
  if (role === "USER") {
    return "/dashboard";
  }
  return "/";
}

// Check if a redirect path is valid for a specific role
export const isValidRedirectForRole = (redirectPath: string, role: UserRole): boolean => {
  const routeOwner = getRouteOwner(redirectPath);

  if (routeOwner === null || routeOwner === "COMMON") {
    return true;
  }

  if (routeOwner === role) {
    return true;
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get access token from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!accessToken;

  // Check if it's a public route
  const isPublic = publicRoutes.includes(pathname);
  
  // Check if it's an auth route
  const isAuth = isAuthRoute(pathname);

  // Get route owner
  const routeOwner = getRouteOwner(pathname);

  // Rule 1: Allow public routes
  if (isPublic && !routeOwner) {
    return NextResponse.next();
  }

  // Rule 2: Redirect unauthenticated users to login
  if (!isAuthenticated && routeOwner) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rule 3: Redirect authenticated users away from auth pages
  // Note: Can't check role in middleware without decoding JWT
  // Default redirect to /dashboard, client-side will handle role-based redirect
  if (isAuthenticated && isAuth) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    if (redirectParam) {
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Rule 4: Protected routes - let through for now
  // AdminGuard and other client-side guards will handle role validation
  if (isAuthenticated && routeOwner) {
    return NextResponse.next();
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
