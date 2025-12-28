import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  userType: 'student' | 'staff';
  phoneNumber?: string;
  isActive?: boolean;
}

export interface AuthResult {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
}

/**
 * Get authentication token from cookies
 */
export async function getTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    return token || null;
  } catch {
    return null;
  }
}

/**
 * Get user info from cookies (stored after login)
 */
export async function getUserFromCookies(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('auth-user');
    if (!userCookie?.value) {
      return null;
    }
    return JSON.parse(userCookie.value) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Validate token with API and get user info
 */
export async function validateToken(
  token: string
): Promise<{ valid: boolean; user: AuthUser | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Don't cache this request
      cache: 'no-store',
    });

    if (!response.ok) {
      return { valid: false, user: null };
    }

    const data = await response.json();
    if (data.user) {
      return { valid: true, user: data.user as AuthUser };
    }

    return { valid: false, user: null };
  } catch {
    // If API is not available or validate endpoint doesn't exist,
    // we'll fall back to checking cookies
    return { valid: false, user: null };
  }
}

/**
 * Get current authentication status
 * Checks cookies first, then validates token if available
 */
export async function getAuthStatus(): Promise<AuthResult> {
  try {
    // Try to get user from cookies (fastest)
    const user = await getUserFromCookies();
    const token = await getTokenFromCookies();

    if (user && token) {
      // Optionally validate token (can be expensive, so we might skip it)
      // For now, we trust the cookie if it exists
      return {
        isAuthenticated: true,
        user,
        token,
      };
    }

    return {
      isAuthenticated: false,
      user: null,
      token: null,
    };
  } catch {
    return {
      isAuthenticated: false,
      user: null,
      token: null,
    };
  }
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(
  user: AuthUser | null,
  requiredRole: 'student' | 'staff'
): boolean {
  if (!user) {
    return false;
  }
  return user.userType === requiredRole;
}
