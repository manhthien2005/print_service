export * from './routes';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
} as const;

export const QUERY_KEYS = {
  AUTH: {
    PROFILE: ['auth', 'profile'] as const,
  },
  USERS: {
    LIST: ['users', 'list'] as const,
    DETAIL: (id: string) => ['users', 'detail', id] as const,
  },
} as const;
