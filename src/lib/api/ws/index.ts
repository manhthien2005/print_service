import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/lib/stores/useAuthStore';

type ConnectionStateListener = (
  state: 'connecting' | 'connected' | 'error'
) => void;

export interface StompSubscribeConfig<T = unknown> {
  topic: string;
  sendDestination?: string;
  sendBody?: Record<string, unknown> | null;
  debugLabel?: string;
  onMessage: (payload: T, raw: IMessage) => void;
  onError?: (err: string) => void;
  onStateChange?: ConnectionStateListener;
}

const getWsUrl = (): string => {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  const normalized = apiBase.replace(/\/+$/, '');

  try {
    const url = new URL(normalized);

    // Remove /api from pathname if present, then add /ws
    // Backend endpoint is /ws (not /api/ws)
    url.pathname = url.pathname.replace(/\/api\/?$/, '') + '/ws';

    // For SockJS, we use HTTP/HTTPS protocol, not ws/wss
    const httpUrl = url.toString();

    if (process.env.NODE_ENV === 'development') {
      console.log('[WebSocket] Connecting to (SockJS):', httpUrl);
    }

    return httpUrl;
  } catch (error) {
    console.error('[WebSocket] Error constructing WebSocket URL:', error);
    // Fallback URL - use HTTP/HTTPS for SockJS
    const fallback = normalized.replace(/\/api\/?$/, '') + '/ws';
    return fallback;
  }
};

const parseBody = (message: IMessage) => {
  try {
    return JSON.parse(message.body);
  } catch {
    return message.body as unknown;
  }
};

/**
 * Subscribe to a STOMP topic with optional initial send to @MessageMapping endpoint.
 * Returns a cleanup function that unsubscribes and deactivates the client.
 */
export function subscribeStomp<T = unknown>(
  config: StompSubscribeConfig<T>
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const token = useAuthStore.getState().token;
  const wsUrl = getWsUrl();

  if (!token) {
    console.warn('[WebSocket] No authentication token available');
    config.onStateChange?.('error');
    config.onError?.('No authentication token');
    return () => {};
  }

  // Use SockJS for WebSocket connection (backend has SockJS enabled)
  const client = new Client({
    webSocketFactory: () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new SockJS(wsUrl) as any;
    },
    reconnectDelay: 5000,
    connectHeaders: { Authorization: `Bearer ${token}` },
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    connectionTimeout: 10000,
    debug: msg => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[stomp:${config.debugLabel ?? 'ws'}]`, msg);
      }
    },
    // Add beforeConnect callback to log connection attempts
    beforeConnect: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[stomp:${config.debugLabel ?? 'ws'}] Attempting to connect to ${wsUrl} (SockJS)`
        );
      }
    },
  });

  let subscription: StompSubscription | null = null;

  client.onConnect = () => {
    config.onStateChange?.('connected');
    subscription = client.subscribe(config.topic, message => {
      const parsed = parseBody(message) as T;
      config.onMessage(parsed, message);
    });

    if (config.sendDestination) {
      client.publish({
        destination: config.sendDestination,
        body: config.sendBody ? JSON.stringify(config.sendBody) : '',
      });
    }
  };

  client.onStompError = frame => {
    const reason = frame.headers.message || 'Unknown STOMP error';
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `[stomp:${config.debugLabel ?? 'ws'}] STOMP error:`,
        reason,
        frame
      );
    }
    config.onStateChange?.('error');
    config.onError?.(reason);
  };

  client.onWebSocketError = event => {
    const errorMessage =
      (event as { message?: string }).message || 'WebSocket connection error';
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `[stomp:${config.debugLabel ?? 'ws'}] WebSocket error:`,
        errorMessage,
        event
      );
    }
    config.onStateChange?.('error');
    config.onError?.(errorMessage);
  };

  // Handle disconnection
  client.onDisconnect = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[stomp:${config.debugLabel ?? 'ws'}] Disconnected`);
    }
  };

  config.onStateChange?.('connecting');
  client.activate();

  return () => {
    try {
      subscription?.unsubscribe();
    } catch {
      /* ignore */
    }
    client.deactivate();
  };
}
