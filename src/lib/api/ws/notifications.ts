import { useEffect, useState } from 'react';
import { subscribeStomp } from './index';
import type { NotificationResponse } from '@/types/api';

type WebSocketMessageType = 'snapshot' | 'notification' | 'count' | 'error';

interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  data: T;
  timestamp: string;
}

interface SnapshotData {
  notifications: NotificationResponse[];
  unreadCount: number;
}

interface NotificationEventData {
  notification: NotificationResponse;
  unreadCount: number;
}

interface CountEventData {
  unreadCount: number;
}

export type NotificationConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'error';

export interface UseNotificationWebSocketResult {
  notifications: NotificationResponse[];
  unreadCount: number;
  connectionState: NotificationConnectionState;
  onNewNotification?: () => void; // Callback when new notification arrives
}

export function useNotificationWebSocket(
  studentId: string | null | undefined,
  options?: {
    onNewNotification?: () => void;
  }
): UseNotificationWebSocketResult {
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionState, setConnectionState] =
    useState<NotificationConnectionState>('idle');

  useEffect(() => {
    if (!studentId) {
      setConnectionState('idle');
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[NotificationWebSocket] Subscribing for studentId:',
        studentId
      );
    }

    const cleanup = subscribeStomp<WebSocketMessage>({
      topic: `/topic/students/${studentId}/notifications`,
      sendDestination: `/app/students/${studentId}/notifications/subscribe`,
      sendBody: null,
      debugLabel: 'notifications',
      onMessage: message => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[NotificationWebSocket] Received message:', message);
        }

        switch (message.type) {
          case 'snapshot': {
            const data = message.data as SnapshotData;
            const notifications = data.notifications ?? [];
            const count = data.unreadCount ?? 0;
            if (process.env.NODE_ENV === 'development') {
              console.log('[NotificationWebSocket] Snapshot:', {
                notificationsCount: notifications.length,
                unreadCount: count,
              });
            }
            setNotifications(notifications);
            setUnreadCount(count);
            break;
          }
          case 'notification': {
            const data = message.data as NotificationEventData;
            if (process.env.NODE_ENV === 'development') {
              console.log('[NotificationWebSocket] New notification:', {
                notification: data.notification,
                unreadCount: data.unreadCount,
              });
            }
            if (data.notification) {
              setNotifications(prev => {
                const filtered = prev.filter(
                  n => n.notificationId !== data.notification.notificationId
                );
                return [data.notification, ...filtered];
              });
              // Trigger callback for new notification
              if (options?.onNewNotification) {
                options.onNewNotification();
              }
            }
            if (typeof data.unreadCount === 'number') {
              setUnreadCount(data.unreadCount);
            }
            break;
          }
          case 'count': {
            const data = message.data as CountEventData;
            if (process.env.NODE_ENV === 'development') {
              console.log(
                '[NotificationWebSocket] Count update:',
                data.unreadCount
              );
            }
            if (typeof data.unreadCount === 'number') {
              setUnreadCount(data.unreadCount);
            }
            break;
          }
          case 'error':
          default:
            if (process.env.NODE_ENV === 'development') {
              console.error('[NotificationWebSocket] Error:', message);
            }
            setConnectionState('error');
            break;
        }
      },
      onStateChange: state => {
        if (state === 'connecting') {
          setConnectionState('connecting');
          if (process.env.NODE_ENV === 'development') {
            console.log('[NotificationWebSocket] Connecting...');
          }
        }
        if (state === 'connected') {
          setConnectionState('connected');
          if (process.env.NODE_ENV === 'development') {
            console.log('[NotificationWebSocket] Connected successfully');
          }
        }
        if (state === 'error') {
          setConnectionState('error');
          if (process.env.NODE_ENV === 'development') {
            console.error('[NotificationWebSocket] Connection error');
          }
        }
      },
      onError: err => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[NotificationWebSocket] Error:', err);
        }
        setConnectionState('error');
      },
    });

    return () => {
      cleanup();
      // Inform backend we want to unsubscribe explicitly
      subscribeStomp({
        topic: `/topic/students/${studentId}/notifications`,
        sendDestination: `/app/students/${studentId}/notifications/unsubscribe`,
        sendBody: null,
        debugLabel: 'notifications-unsubscribe',
        onMessage: () => {},
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  return { notifications, unreadCount, connectionState };
}
