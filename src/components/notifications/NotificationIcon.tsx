'use client';

import { BellIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/cn';
import { Tooltip } from '@/components/ui/Tooltip';

interface NotificationIconProps {
  unreadCount?: number;
  onClick?: () => void;
}

export function NotificationIcon({
  unreadCount = 0,
  onClick,
}: NotificationIconProps) {
  const hasUnread = (unreadCount ?? 0) > 0;
  const displayCount =
    unreadCount && unreadCount > 99 ? '99+' : unreadCount?.toString();

  const tooltipText = hasUnread
    ? `${unreadCount} thông báo chưa đọc`
    : 'Không có thông báo mới';

  return (
    <Tooltip content={tooltipText} side="bottom">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'relative inline-flex h-10 w-10 items-center justify-center rounded-full',
          'border border-slate-300 dark:border-slate-600',
          'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200',
          'shadow-sm transition-all duration-200 hover:shadow-md',
          'hover:bg-slate-50 dark:hover:bg-slate-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          // Pulse animation when there are unread notifications
          hasUnread && 'animate-pulse'
        )}
        aria-label={tooltipText}
      >
        <BellIcon className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
        {hasUnread && (
          <span
            className={cn(
              'absolute -right-0.5 -top-0.5 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full',
              'bg-red-500 px-1.5 text-[11px] font-bold text-white dark:bg-red-600',
              'shadow-lg ring-2 ring-white dark:ring-slate-900',
              // Bounce animation for badge
              'animate-bounce'
            )}
            aria-label={`${unreadCount} thông báo chưa đọc`}
          >
            {displayCount}
          </span>
        )}
      </button>
    </Tooltip>
  );
}
