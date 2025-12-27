import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type {
  ApiResponse,
  NotificationResponse,
  NotificationCountResponse,
  NotificationListResponse,
} from '@/types/api';
import { AxiosResponse } from 'axios';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: { page?: number; size?: number }) =>
    [...notificationKeys.all, 'list', params] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
  count: () => [...notificationKeys.all, 'count'] as const,
};

/**
 * Hook to fetch notifications
 * Handles both direct array response and paginated response
 */
export function useNotifications(
  params?: { page?: number; size?: number },
  options?: { enabled?: boolean; refetchInterval?: number | false }
) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.size !== undefined)
    queryParams.append('size', params.size.toString());

  const url = `/student/notifications${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  // Backend may return either:
  // 1. ApiResponse<NotificationResponse[]> - direct array
  // 2. ApiResponse<NotificationListResponse> - paginated with content field
  // Use union type to handle both
  return useApiQuery<
    ApiResponse<NotificationResponse[] | NotificationListResponse>
  >(notificationKeys.list(params), url, {
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval ?? false,
  });
}

/**
 * Hook to fetch unread notifications
 */
export function useUnreadNotifications(options?: { enabled?: boolean }) {
  return useApiQuery<ApiResponse<NotificationResponse[]>>(
    notificationKeys.unread(),
    '/student/notifications/unread',
    {
      staleTime: 10 * 1000,
      gcTime: 5 * 60 * 1000,
      enabled: options?.enabled !== false,
    }
  );
}

/**
 * Hook to fetch unread notification count (fallback for WS)
 */
export function useUnreadCount(options?: {
  refetchInterval?: number | false;
  enabled?: boolean;
}) {
  return useApiQuery<ApiResponse<NotificationCountResponse>>(
    notificationKeys.count(),
    '/student/notifications/count',
    {
      staleTime: 0,
      gcTime: 60 * 1000,
      refetchInterval: options?.refetchInterval ?? false,
      enabled: options?.enabled !== false,
    }
  );
}

/**
 * Hook to mark a single notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<void>>,
    Error,
    { notificationId: string }
  >({
    mutationFn: ({ notificationId }) => {
      return apiClient.post<ApiResponse<void>>(
        `/student/notifications/${notificationId}/read`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<void>, void>(
    '/student/notifications/read-all',
    'post',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      },
    }
  );
}
