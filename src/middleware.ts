import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './lib/i18n/config';

// Define protected student routes
const studentRoutes = [
  '/student/dashboard',
  '/student/print',
  '/student/history',
  '/student/profile',
  '/student/settings',
  '/student/printers',
  '/student/recharge',
  '/student/top-up',
  '/student/buy-pages',
];

// Define protected staff routes
const staffRoutes = [
  '/staff/dashboard',
  '/staff/manage-students',
  '/staff/manage-printers',
  '/staff/manage-print-history',
  '/staff/manage-transactions',
  '/staff/reports',
  '/staff/settings',
  '/staff/configuration',
  '/staff/page-allocation',
];

// Auth pages (should redirect if already authenticated)
const authPages = ['/login', '/forgot-password', '/reset-password'];

/**
 * Check if a path matches any of the route patterns
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    // Exact match or starts with route
    return pathname === route || pathname.startsWith(route + '/');
  });
}

/**
 * Get user info from cookies
 */
function getUserFromCookies(request: NextRequest): {
  user: { userType: 'student' | 'staff' } | null;
  token: string | null;
} {
  const token = request.cookies.get('auth-token')?.value || null;
  const userCookie = request.cookies.get('auth-user')?.value;

  if (!userCookie || !token) {
    return { user: null, token: null };
  }

  try {
    const user = JSON.parse(userCookie);
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}

/**
 * Extract locale from pathname
 */
function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  return locales.includes(firstSegment as (typeof locales)[number])
    ? firstSegment
    : 'vi';
}

/**
 * Create path with locale
 */
function createLocalizedPath(locale: string, path: string): string {
  return `/${locale}${path}`;
}

// Create the i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'vi',
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract locale from pathname
  const locale = getLocaleFromPath(pathname);

  // Remove locale from pathname for route matching
  const segments = pathname.split('/').filter(Boolean);
  const pathWithoutLocale =
    segments.length > 1 &&
    locales.includes(segments[0] as (typeof locales)[number])
      ? '/' + segments.slice(1).join('/')
      : pathname;

  // Get authentication status
  const { user, token } = getUserFromCookies(request);
  const isAuthenticated = !!user && !!token;

  // Check if current path is a student route
  const isStudentRoute = matchesRoute(pathWithoutLocale, studentRoutes);

  // Check if current path is a staff route
  const isStaffRoute = matchesRoute(pathWithoutLocale, staffRoutes);

  // Check if current path is an auth page
  const isAuthPage = matchesRoute(pathWithoutLocale, authPages);

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    const redirectPath =
      user?.userType === 'staff'
        ? createLocalizedPath(locale, '/staff/dashboard')
        : createLocalizedPath(locale, '/student/dashboard');
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Protect student routes
  if (isStudentRoute) {
    if (!isAuthenticated) {
      // Redirect to login
      const loginPath = createLocalizedPath(locale, '/login');
      const url = new URL(loginPath, request.url);
      // Add redirect parameter to return after login
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Check if user has correct role
    if (user?.userType !== 'student') {
      // Redirect to appropriate dashboard
      const redirectPath =
        user?.userType === 'staff'
          ? createLocalizedPath(locale, '/staff/dashboard')
          : createLocalizedPath(locale, '/login');
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // Protect staff routes
  if (isStaffRoute) {
    if (!isAuthenticated) {
      // Redirect to login
      const loginPath = createLocalizedPath(locale, '/login');
      const url = new URL(loginPath, request.url);
      // Add redirect parameter to return after login
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Check if user has correct role
    if (user?.userType !== 'staff') {
      // Redirect to appropriate dashboard
      const redirectPath =
        user?.userType === 'student'
          ? createLocalizedPath(locale, '/student/dashboard')
          : createLocalizedPath(locale, '/login');
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // Let i18n middleware handle the rest
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
