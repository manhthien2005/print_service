'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'staff';
  redirectTo?: string;
}

/**
 * Client-side route protection component
 * This provides an additional layer of security on top of middleware
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Check authentication
    if (!isAuthenticated || !user) {
      // Extract locale from pathname
      const locale = pathname.split('/').filter(Boolean)[0] || 'vi';
      const loginPath = redirectTo || `/${locale}/login`;
      router.push(loginPath);
      return;
    }

    // Check role if required
    if (requiredRole && user.userType !== requiredRole) {
      // Redirect to appropriate dashboard
      const locale = pathname.split('/').filter(Boolean)[0] || 'vi';
      const redirectPath =
        user.userType === 'staff'
          ? `/${locale}/staff/dashboard`
          : `/${locale}/student/dashboard`;
      router.push(redirectPath);
      return;
    }
  }, [isAuthenticated, user, requiredRole, router, pathname, redirectTo]);

  // Show loading state while checking
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  // Check role if required
  if (requiredRole && user.userType !== requiredRole) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
