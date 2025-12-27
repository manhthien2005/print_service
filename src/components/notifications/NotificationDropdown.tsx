'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import type { NotificationResponse } from '@/types/api';
import type { NotificationConnectionState } from '@/lib/api/ws/notifications';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Skeleton } from '@/components/common/Skeleton';
import { cn } from '@/lib/utils/cn';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  notifications: NotificationResponse[];
  isLoading?: boolean;
  connectionState?: NotificationConnectionState;
  onMarkAllAsRead?: () => void;
  onItemClick?: (notification: NotificationResponse) => void;
  onRefresh?: () => void;
}

export function NotificationDropdown({
  notifications,
  isLoading,
  connectionState,
  onMarkAllAsRead,
  onItemClick,
  onRefresh,
}: NotificationDropdownProps) {
  const t = useTranslations('common.notifications');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';
  const hasError = connectionState === 'error';

  // Track which notifications are new (for animation)
  const [newNotificationIds, setNewNotificationIds] = useState<Set<string>>(
    new Set()
  );
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());

  // Update new notification tracking when notifications change
  useEffect(() => {
    const currentIds = new Set(notifications.map(n => n.notificationId));
    const previousIds = previousNotificationIdsRef.current;

    // Find newly added notifications (only on initial mount or when IDs actually change)
    const newlyAdded = notifications.filter(
      n =>
        !previousIds.has(n.notificationId) && currentIds.has(n.notificationId)
    );

    // Only update if there are actually new notifications
    if (newlyAdded.length > 0) {
      setNewNotificationIds(prev => {
        const updated = new Set(prev);
        newlyAdded.forEach(n => updated.add(n.notificationId));
        return updated;
      });

      // Clear the "new" flag after animation
      const timeoutId = setTimeout(() => {
        setNewNotificationIds(prev => {
          const updated = new Set(prev);
          newlyAdded.forEach(n => updated.delete(n.notificationId));
          return updated;
        });
      }, 3000);

      // Update ref for next comparison
      previousNotificationIdsRef.current = currentIds;

      return () => clearTimeout(timeoutId);
    } else {
      // Update ref even if no new notifications (to track removals)
      previousNotificationIdsRef.current = currentIds;
    }
  }, [notifications]);

  return (
    <div
      className={cn(
        'absolute right-0 mt-2 w-[380px] max-w-[90vw] rounded-lg border border-border',
        'bg-white shadow-2xl backdrop-blur-sm dark:bg-slate-900',
        'z-50'
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-slate-50/50 px-4 py-3 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            {t ? t('title') : 'Thông báo'}
          </p>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {unreadCount} chưa đọc
            </span>
          )}
          {readCount > 0 && unreadCount === 0 && (
            <span className="text-[10px] text-muted-foreground">
              {readCount} đã đọc
            </span>
          )}
          {/* Connection status indicator */}
          {isConnecting && (
            <Tooltip content="Đang kết nối WebSocket..." side="bottom">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                <span className="text-[10px] text-blue-600 dark:text-blue-400">
                  Đang kết nối...
                </span>
              </div>
            </Tooltip>
          )}
          {hasError && (
            <Tooltip
              content="Lỗi kết nối WebSocket. Đang dùng polling..."
              side="bottom"
            >
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-[10px] text-red-600 dark:text-red-400">
                  Lỗi kết nối
                </span>
              </div>
            </Tooltip>
          )}
          {isConnected && (
            <Tooltip
              content="Đã kết nối WebSocket. Cập nhật real-time"
              side="bottom"
            >
              <div className="h-2 w-2 rounded-full bg-green-500 ring-2 ring-green-200 dark:ring-green-800" />
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={onRefresh}
              title="Làm mới"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </Button>
          )}
          {notifications.length > 0 && onMarkAllAsRead && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={onMarkAllAsRead}
            >
              {t ? t('markAllRead') : 'Đánh dấu tất cả đã đọc'}
            </Button>
          )}
        </div>
      </div>
      <div className="scrollbar-thin max-h-[420px] overflow-y-auto bg-white px-3 py-3 dark:bg-slate-900">
        {isLoading ? (
          <div className="space-y-3 px-1 py-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <Skeleton className="h-8 w-8 rounded-full" variant="shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-4 w-3/4" variant="shimmer" />
                    <Skeleton className="h-3 w-16" variant="shimmer" />
                  </div>
                  <Skeleton className="h-3 w-full" variant="shimmer" />
                  <Skeleton className="h-3 w-2/3" variant="shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : !Array.isArray(notifications) || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12">
            <div className="mb-4 text-5xl opacity-50">🔔</div>
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              {t ? t('empty') : 'Bạn chưa có thông báo nào'}
            </p>
            <p className="text-muted-foreground/70 text-xs">
              Thông báo mới sẽ xuất hiện ở đây
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notifications.map(notification => (
              <li key={notification.notificationId}>
                <NotificationItem
                  notification={notification}
                  onClick={() => onItemClick?.(notification)}
                  isNew={newNotificationIds.has(notification.notificationId)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
