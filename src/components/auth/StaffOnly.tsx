'use client';

import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';

interface StaffOnlyProps {
  children: React.ReactNode;
}

/**
 * Component that only renders children for authenticated staff
 * Redirects to login or student dashboard if not staff
 */
export function StaffOnly({ children }: StaffOnlyProps) {
  return <ProtectedRoute requiredRole="staff">{children}</ProtectedRoute>;
}
