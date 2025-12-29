"use client";

import { useEffect, useRef } from "react";
import { useBroadcastStore } from "@/stores/broadcast-store";

/**
 * Hook to listen for broadcast events via SSE from the backend.
 * Connects to the backend SSE endpoint and updates the Zustand store
 * when broadcast status changes.
 */
export function useBroadcastSSE() {
  const { setBroadcast, setCurrentShow, setStreamUrl } = useBroadcastStore();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const BASE_RECONNECT_DELAY = 3000; // 3 seconds base delay

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

        console.log("[SSE] Connecting to broadcast events...");

        eventSource.onopen = () => {
          console.log("✅ [SSE] Connected to broadcast events");
          reconnectAttemptsRef.current = 0;
        };

        eventSource.addEventListener("broadcast:started", (event) => {
          try {
            console.log(
              "📢 [SSE] Raw broadcast:started event received:",
              event
            );
            console.log("📢 [SSE] Event data:", event.data);

            const data = JSON.parse(event.data);
            console.log("📢 [SSE] Parsed broadcast:started event:", data);

            // Handle both direct data and nested data formats
            const broadcastData = data.data || data;
            if (broadcastData && broadcastData.id) {
              setBroadcast(broadcastData);
              setCurrentShow(broadcastData.title || "Live Broadcast");
              setStreamUrl(broadcastData.streamUrl || null);
              console.log("✅ [SSE] Broadcast state updated:", broadcastData);
            } else {
              console.warn("[SSE] Invalid broadcast data received:", data);
            }
          } catch (error) {
            console.error(
              "[SSE] Error parsing broadcast:started event:",
              error
            );
          }
        });

        eventSource.addEventListener("broadcast:ended", (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("📢 [SSE] Received broadcast:ended event:", data);

            setBroadcast(null);
            setCurrentShow("No live broadcasts");
            setStreamUrl(null);
          } catch (error) {
            console.error("[SSE] Error parsing broadcast:ended event:", error);
          }
        });

        eventSource.onerror = (error) => {
          console.error("❌ [SSE] Connection error:", error);
          eventSource.close();
          eventSourceRef.current = null;

          // Attempt to reconnect with exponential backoff
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1);
            console.log(
              `[SSE] Reconnecting... (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms`
            );
            reconnectTimeoutRef.current = setTimeout(
              connectSSE,
              delay
            );
          } else {
            console.error(
              "[SSE] Max reconnection attempts reached. Giving up on SSE."
            );
          }
        };

        eventSourceRef.current = eventSource;
      } catch (error) {
        console.error("[SSE] Error creating EventSource:", error);
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
  }, [setBroadcast, setCurrentShow, setStreamUrl]);
}
