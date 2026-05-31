"use client";

import * as React from "react";
import { io, type Socket } from "socket.io-client";

import { useAuth } from "@/lib/auth";
import { getTenantId } from "@/lib/api";
import {
  REALTIME_NAMESPACE,
  REALTIME_EVENTS,
  getRealtimeBaseUrl,
  type RealtimeEventName,
} from "./config";

export { REALTIME_EVENTS, REALTIME_NAMESPACE, getRealtimeBaseUrl };
export type { RealtimeEventName };

type RealtimeHandler = (data: unknown) => void;

interface RealtimeContextValue {
  isConnected: boolean;
  subscribe: (event: string, handler: RealtimeHandler) => () => void;
}

const RealtimeContext = React.createContext<RealtimeContextValue | null>(null);

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isConnected, setIsConnected] = React.useState(false);
  const socketRef = React.useRef<Socket | null>(null);
  const listenersRef = React.useRef<Map<string, Set<RealtimeHandler>>>(
    new Map(),
  );
  const [connectionKey, setConnectionKey] = React.useState(0);

  const subscribe = React.useCallback(
    (event: string, handler: RealtimeHandler) => {
      const listeners = listenersRef.current;
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(handler);

      return () => {
        listeners.get(event)?.delete(handler);
      };
    },
    [],
  );

  React.useEffect(() => {
    const bumpConnection = () => setConnectionKey((k) => k + 1);
    window.addEventListener("auth_user_updated", bumpConnection);
    window.addEventListener("storage", bumpConnection);
    return () => {
      window.removeEventListener("auth_user_updated", bumpConnection);
      window.removeEventListener("storage", bumpConnection);
    };
  }, []);

  React.useEffect(() => {
    if (isLoading || !isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const token = getAccessToken();
    const tenantId = getTenantId();
    if (!token || !tenantId) {
      return;
    }

    const socket = io(`${getRealtimeBaseUrl()}${REALTIME_NAMESPACE}`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const dispatch = (event: string, data: unknown) => {
      listenersRef.current.get(event)?.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Realtime handler failed for ${event}:`, error);
        }
      });
    };

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("connect_error", () => setIsConnected(false));

    const knownEvents: RealtimeEventName[] = [
      "notification:created",
      "notification:updated",
      "notifications:refresh",
      "vehicle-event:created",
      "maintenance:updated",
    ];

    for (const event of knownEvents) {
      socket.on(event, (data: unknown) => dispatch(event, data));
    }

    return () => {
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [isAuthenticated, isLoading, connectionKey]);

  const value = React.useMemo(
    () => ({ isConnected, subscribe }),
    [isConnected, subscribe],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = React.useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return context;
}

export function useRealtimeEvent<T = unknown>(
  event: string,
  handler: (data: T) => void,
  enabled = true,
) {
  const { subscribe } = useRealtime();
  const handlerRef = React.useRef(handler);
  handlerRef.current = handler;

  React.useEffect(() => {
    if (!enabled) return;
    return subscribe(event, (data) => {
      handlerRef.current(data as T);
    });
  }, [event, enabled, subscribe]);
}
