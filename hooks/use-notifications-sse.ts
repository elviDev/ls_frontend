"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Listens for notification:new pings via SSE from the backend and
 * invalidates the notifications queries so the bell refetches. The SSE
 * channel carries no payload (it's public/unauthenticated) — this is
 * purely a "something changed, go refetch" signal.
 */
export function useNotificationsSSE() {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const BASE_RECONNECT_DELAY = 3000;

  useEffect(() => {
    const connectSSE = () => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_SSE_URL ||
          (process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL}/sse`
            : null);
        const eventSource = new EventSource(`${backendUrl}/connect`, {
          withCredentials: true,
        });

        eventSource.onopen = () => {
          reconnectAttemptsRef.current = 0;
        };

        eventSource.addEventListener("notification:new", () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        });

        eventSource.onerror = () => {
          eventSource.close();
          eventSourceRef.current = null;

          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1);
            reconnectTimeoutRef.current = setTimeout(connectSSE, delay);
          }
        };

        eventSourceRef.current = eventSource;
      } catch (error) {
        console.error("[Notifications SSE] Error creating EventSource:", error);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [queryClient]);
}
