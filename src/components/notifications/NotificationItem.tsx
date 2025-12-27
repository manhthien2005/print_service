'use client';

import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import type { NotificationResponse, NotificationType } from '@/types/api';
import { cn } from '@/lib/utils/cn';

interface NotificationItemProps {
  notification: NotificationResponse;
  onClick?: () => void;
  isNew?: boolean; // Flag to indicate if this is a newly received notification
}

// Icon mapping for notification types
const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'DEPOSIT_SUCCESS':
      return '💰';
    case 'DEPOSIT_FAILED':
      return '❌';
    case 'DEPOSIT_EXPIRED':
      return '⏰';
    case 'DEPOSIT_CREATED':
      return '📝';
    case 'PRINT_JOB_CREATED':
      return '📄';
    case 'PRINT_JOB_QUEUED':
      return '⏳';
    case 'PRINT_JOB_PRINTING':
      return '🖨️';
    case 'PRINT_JOB_COMPLETED':
      return '✅';
    case 'PRINT_JOB_FAILED':
      return '❌';
    case 'PRINT_JOB_CANCELLED':
      return '🚫';
    case 'BALANCE_LOW':
      return '⚠️';
    case 'SYSTEM':
      return '🔔';
    default:
      return '📬';
  }
};

// Color coding for notification types
const getNotificationColors = (
  type: NotificationType,
  isUnread: boolean
): {
  border: string;
  bg: string;
  bgDark: string;
  text: string;
  textDark: string;
  iconBg: string;
  iconBgDark: string;
} => {
  const baseColors = {
    border: 'border-slate-300 dark:border-slate-600',
    bg: 'bg-white dark:bg-slate-900',
    bgDark: 'bg-slate-200 dark:bg-slate-700',
    text: 'text-slate-700 dark:text-slate-300',
    textDark: 'text-slate-600 dark:text-slate-400',
    iconBg: 'bg-slate-400 dark:bg-slate-500',
    iconBgDark: 'bg-slate-500 dark:bg-slate-600',
  };

  if (!isUnread) {
    return baseColors;
  }

  // Color coding for unread notifications by type
  switch (type) {
    case 'DEPOSIT_SUCCESS':
    case 'PRINT_JOB_COMPLETED':
      return {
        border: 'border-green-500 dark:border-green-400',
        bg: 'bg-green-50 dark:bg-green-950/30',
        bgDark: 'bg-green-100 dark:bg-green-900/50',
        text: 'text-green-900 dark:text-green-100',
        textDark: 'text-green-800 dark:text-green-200',
        iconBg: 'bg-green-500 dark:bg-green-400',
        iconBgDark: 'bg-green-600 dark:bg-green-500',
      };
    case 'DEPOSIT_FAILED':
    case 'PRINT_JOB_FAILED':
      return {
        border: 'border-red-500 dark:border-red-400',
        bg: 'bg-red-50 dark:bg-red-950/30',
        bgDark: 'bg-red-100 dark:bg-red-900/50',
        text: 'text-red-900 dark:text-red-100',
        textDark: 'text-red-800 dark:text-red-200',
        iconBg: 'bg-red-500 dark:bg-red-400',
        iconBgDark: 'bg-red-600 dark:bg-red-500',
      };
    case 'DEPOSIT_EXPIRED':
    case 'BALANCE_LOW':
      return {
        border: 'border-amber-500 dark:border-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        bgDark: 'bg-amber-100 dark:bg-amber-900/50',
        text: 'text-amber-900 dark:text-amber-100',
        textDark: 'text-amber-800 dark:text-amber-200',
        iconBg: 'bg-amber-500 dark:bg-amber-400',
        iconBgDark: 'bg-amber-600 dark:bg-amber-500',
      };
    case 'PRINT_JOB_PRINTING':
    case 'PRINT_JOB_QUEUED':
      return {
        border: 'border-blue-500 dark:border-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        bgDark: 'bg-blue-100 dark:bg-blue-900/50',
        text: 'text-blue-900 dark:text-blue-100',
        textDark: 'text-blue-800 dark:text-blue-200',
        iconBg: 'bg-blue-500 dark:bg-blue-400',
        iconBgDark: 'bg-blue-600 dark:bg-blue-500',
      };
    default:
      return {
        border: 'border-blue-500 dark:border-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        bgDark: 'bg-blue-100 dark:bg-blue-900/50',
        text: 'text-blue-900 dark:text-blue-100',
        textDark: 'text-blue-800 dark:text-blue-200',
        iconBg: 'bg-blue-500 dark:bg-blue-400',
        iconBgDark: 'bg-blue-600 dark:bg-blue-500',
      };
  }
};

export function NotificationItem({
  notification,
  onClick,
  isNew = false,
}: NotificationItemProps) {
  const createdAt = new Date(notification.createdAt);
  const timeAgo = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: vi,
  });

  const isUnread = !notification.isRead;
  const [isHighlighted, setIsHighlighted] = useState(isNew);
  const icon = getNotificationIcon(notification.notificationType);
  const colors = getNotificationColors(notification.notificationType, isUnread);

  // Remove highlight after animation
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setIsHighlighted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full cursor-pointer items-start gap-3 rounded-lg px-4 py-3.5 text-left text-sm transition-all duration-200',
        'border-l-4',
        'hover:scale-[1.01] hover:shadow-md',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        colors.border,
        isUnread ? colors.bg : 'bg-white dark:bg-slate-900',
        isHighlighted && colors.bgDark,
        isHighlighted && 'animate-pulse'
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-base',
            isUnread ? colors.iconBg : colors.iconBgDark,
            'ring-2 ring-white/50 dark:ring-slate-900/50'
          )}
        >
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <p
            className={cn(
              'line-clamp-1 flex-1 font-semibold',
              isUnread ? colors.text : 'text-slate-700 dark:text-slate-300'
            )}
          >
            {notification.title}
          </p>
          <span
            className={cn(
              'mt-0.5 flex-shrink-0 whitespace-nowrap text-[11px]',
              isUnread ? colors.textDark : 'text-slate-500 dark:text-slate-500'
            )}
          >
            {timeAgo}
          </span>
        </div>
        <p
          className={cn(
            'line-clamp-2 text-xs leading-relaxed',
            isUnread ? colors.textDark : 'text-slate-600 dark:text-slate-400'
          )}
        >
          {notification.message}
        </p>
      </div>
    </button>
  );
}
