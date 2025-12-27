'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useNotificationWebSocket } from '@/lib/api/ws/notifications';
import {
  useUnreadCount,
  useUnreadNotifications,
  useNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
  notificationKeys,
} from '@/lib/api/services/notifications';
import { useStudentProfile } from '@/lib/api/services/student';
import { useClickOutside } from '@/lib/hooks';
import type { NotificationResponse } from '@/types/api';
import { NotificationIcon } from './NotificationIcon';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationContainer() {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  // Check if should show - but call all hooks first
  const shouldShow = isAuthenticated && user?.userType === 'student';

  // Get studentId from profile
  // profileData is AxiosResponse<ApiResponse<StudentProfileResponse>>
  // So we need: profileData.data.data.studentId
  const { data: profileData, isLoading: profileLoading } = useStudentProfile();
  const studentId = shouldShow
    ? (profileData?.data?.data?.studentId ?? null)
    : null;

  // Fetch all notifications (not just unread) to show complete list
  // Always enable if authenticated, not just when shouldShow (to ensure API is called)
  // Use polling fallback when WebSocket is not connected (every 30s)
  const {
    data: allNotificationsData,
    isLoading: allNotificationsLoading,
    refetch: refetchAllNotifications,
  } = useNotifications(
    { page: 0, size: 50 },
    {
      enabled: isAuthenticated,
      refetchInterval: false, // Will be set dynamically based on WebSocket state
    }
  );

  const {
    notifications: wsNotifications,
    unreadCount: wsUnreadCount,
    connectionState,
  } = useNotificationWebSocket(
    shouldShow && !profileLoading ? studentId : null,
    {
      onNewNotification: () => {
        // When new notification arrives via WebSocket, refetch REST API to ensure consistency
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[NotificationContainer] New notification via WS, refetching REST API'
          );
        }
        refetchAllNotifications();
        refetchCount();
      },
    }
  );

  // Determine if WebSocket is connected and should be used
  const isWebSocketConnected = connectionState === 'connected';

  // Also fetch unread for count badge
  const {
    data: unreadNotificationsData,
    isLoading: unreadLoading,
    refetch: refetchUnreadNotifications,
  } = useUnreadNotifications({ enabled: isAuthenticated });

  // Use polling fallback when WebSocket is not connected (every 30s)
  // When WebSocket is connected, rely on real-time updates
  const { data: countData, refetch: refetchCount } = useUnreadCount({
    refetchInterval: isWebSocketConnected ? false : 30000, // 30s polling when WS disconnected
    enabled: isAuthenticated,
  });

  // Refetch when dropdown opens to ensure fresh data
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refetchAllNotifications();
      refetchUnreadNotifications();
      refetchCount();
    }
  }, [
    isOpen,
    isAuthenticated,
    refetchAllNotifications,
    refetchUnreadNotifications,
    refetchCount,
  ]);

  // Monitor WebSocket connection state and enable polling fallback when disconnected
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[NotificationContainer] WebSocket connection state:',
        connectionState
      );
    }

    // When WebSocket is disconnected or in error state, enable polling for notifications
    // Only poll if not connected (idle, connecting, or error states)
    if (
      !isWebSocketConnected &&
      isAuthenticated &&
      connectionState !== 'idle'
    ) {
      // Poll immediately on disconnect, then every 30s
      refetchAllNotifications();
      refetchUnreadNotifications();
      refetchCount();

      const interval = setInterval(() => {
        refetchAllNotifications();
        refetchUnreadNotifications();
        refetchCount();
      }, 30000); // Poll every 30s when WS disconnected

      return () => clearInterval(interval);
    }
  }, [
    connectionState,
    isWebSocketConnected,
    isAuthenticated,
    refetchAllNotifications,
    refetchUnreadNotifications,
    refetchCount,
  ]);

  // Optimistic update state for notifications
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<string, Partial<NotificationResponse>>
  >(new Map());

  const markAllAsReadMutation = useMarkAllAsRead();
  const markAsReadMutation = useMarkAsRead();

  // Helper function to extract notifications from API response
  // Handles both direct array and paginated response formats
  const extractNotificationsFromResponse = (
    apiResponse: any
  ): NotificationResponse[] => {
    if (!apiResponse?.data) return [];

    const data = apiResponse.data;

    // Check if it's a direct array (ApiResponse<NotificationResponse[]>)
    if (Array.isArray(data)) {
      return data;
    }

    // Check if it's paginated (ApiResponse<NotificationListResponse>)
    if (data.content && Array.isArray(data.content)) {
      return data.content;
    }

    return [];
  };

  // Merge WebSocket and REST notifications, prefer WS if available
  // Use all notifications from REST API (not just unread)
  // Apply optimistic updates
  const notifications = useMemo(() => {
    const wsList =
      wsNotifications && Array.isArray(wsNotifications) ? wsNotifications : [];

    // Extract notifications from allNotificationsData
    // Handles both direct array and paginated response
    const allApiResponse = allNotificationsData?.data;
    const allRestData = extractNotificationsFromResponse(allApiResponse);

    // Also get unread from unreadNotificationsData as fallback
    const unreadApiResponse = unreadNotificationsData?.data;
    const unreadRestData = extractNotificationsFromResponse(unreadApiResponse);

    // Merge both sources, deduplicate by notificationId, prefer WS data
    const merged = new Map<string, NotificationResponse>();

    // Add all REST data first (prefer allNotificationsData if available)
    const restDataToUse = allRestData.length > 0 ? allRestData : unreadRestData;
    restDataToUse.forEach(notif => {
      merged.set(notif.notificationId, notif);
    });

    // Override with WS data (more up-to-date)
    wsList.forEach(notif => {
      merged.set(notif.notificationId, notif);
    });

    // Apply optimistic updates
    optimisticUpdates.forEach((update, notificationId) => {
      const existing = merged.get(notificationId);
      if (existing) {
        merged.set(notificationId, { ...existing, ...update });
      }
    });

    // Sort by createdAt descending (newest first)
    return Array.from(merged.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    wsNotifications,
    allNotificationsData,
    unreadNotificationsData,
    optimisticUpdates,
  ]);

  // Early return after all hooks are called
  if (!shouldShow) {
    return null;
  }

  // countData is AxiosResponse<ApiResponse<NotificationCountResponse>>
  // So we need: countData.data.data.unreadCount
  const restUnreadCount = countData?.data?.data?.unreadCount;
  const unreadCount = wsUnreadCount ?? restUnreadCount ?? 0;

  const isLoading = profileLoading || allNotificationsLoading || unreadLoading;

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleMarkAllAsRead = () => {
    // Optimistic update: mark all as read immediately
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      notifications.forEach(notif => {
        if (!notif.isRead) {
          newMap.set(notif.notificationId, { isRead: true });
        }
      });
      return newMap;
    });

    markAllAsReadMutation.mutate(undefined, {
      onSuccess: () => {
        // Clear optimistic updates after successful API call
        setOptimisticUpdates(new Map());
        // Invalidate queries to refetch notifications
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        refetchCount();
        // WebSocket will also send count update
      },
      onError: () => {
        // Revert optimistic update on error
        setOptimisticUpdates(new Map());
      },
    });
  };

  const handleItemClick = (notification: NotificationResponse) => {
    if (!notification) return;

    // Only mark as read if currently unread
    if (!notification.isRead) {
      // Optimistic update: mark as read immediately
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.set(notification.notificationId, { isRead: true });
        return newMap;
      });

      markAsReadMutation.mutate(
        { notificationId: notification.notificationId },
        {
          onSuccess: () => {
            // Clear optimistic update after successful API call
            setOptimisticUpdates(prev => {
              const newMap = new Map(prev);
              newMap.delete(notification.notificationId);
              return newMap;
            });
            // Invalidate queries to refetch notifications
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            refetchCount();
            // WebSocket will also send count update
          },
          onError: () => {
            // Revert optimistic update on error
            setOptimisticUpdates(prev => {
              const newMap = new Map(prev);
              newMap.delete(notification.notificationId);
              return newMap;
            });
          },
        }
      );
    }
  };

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    const allApiResponse = allNotificationsData?.data;
    const allRestNotifications =
      extractNotificationsFromResponse(allApiResponse);
    const unreadApiResponse = unreadNotificationsData?.data;
    const unreadRestNotifications =
      extractNotificationsFromResponse(unreadApiResponse);
    console.log('[NotificationContainer]', {
      studentId,
      connectionState,
      wsNotificationsCount: wsNotifications?.length ?? 0,
      allRestNotificationsCount: allRestNotifications.length,
      unreadRestNotificationsCount: unreadRestNotifications.length,
      unreadCount,
      isOpen,
      notificationsCount: notifications.length,
      allNotificationsDataRaw: allNotificationsData?.data,
      notifications,
    });
  }

  return (
    <div ref={ref} className="relative">
      <NotificationIcon unreadCount={unreadCount} onClick={handleToggle} />
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          connectionState={connectionState}
          onMarkAllAsRead={handleMarkAllAsRead}
          onItemClick={handleItemClick}
          onRefresh={() => {
            refetchAllNotifications();
            refetchUnreadNotifications();
            refetchCount();
          }}
        />
      )}
    </div>
  );
}
