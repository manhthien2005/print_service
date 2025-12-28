'use client';

import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';

interface StudentOnlyProps {
  children: React.ReactNode;
}

/**
 * Component that only renders children for authenticated students
 * Redirects to login or staff dashboard if not a student
 */
export function StudentOnly({ children }: StudentOnlyProps) {
  return <ProtectedRoute requiredRole="student">{children}</ProtectedRoute>;
}
