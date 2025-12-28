/**
 * Cookie utilities for client-side cookie management
 */

/**
 * Set a cookie with the given name, value, and options
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    days?: number;
    path?: string;
    sameSite?: 'strict' | 'lax' | 'none';
    secure?: boolean;
  } = {}
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const {
    days = 7, // Default 7 days
    path = '/',
    sameSite = 'lax',
    secure = process.env.NODE_ENV === 'production',
  } = options;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  let cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=${path}; SameSite=${sameSite}`;

  if (secure) {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }

  return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof window === 'undefined') {
    return;
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}

/**
 * Set authentication cookies (token and user info)
 */
export function setAuthCookies(
  token: string,
  user: {
    userId: string;
    email: string;
    fullName: string;
    userType: 'student' | 'staff';
    phoneNumber?: string;
    isActive?: boolean;
  },
  rememberMe: boolean = false
): void {
  // Set token cookie
  setCookie('auth-token', token, {
    days: rememberMe ? 30 : 7, // 30 days if remember me, 7 days otherwise
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // Set user info cookie
  setCookie('auth-user', JSON.stringify(user), {
    days: rememberMe ? 30 : 7,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(): void {
  deleteCookie('auth-token');
  deleteCookie('auth-user');
}
