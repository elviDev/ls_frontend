"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { RoomContext } from "@livekit/components-react";
import { Room } from "livekit-client";
import { audioContextManager } from "@/utils/audio-context-manager";

interface GlobalLiveKitContextType {
  currentRoom: Room | null;
  activeBroadcast: string | null;
  joinRoom: (
    broadcastId: string,
    userId: string,
    userName?: string,
    role?: "broadcaster" | "listener"
  ) => Promise<Room>;
  leaveRoom: () => void;
  onBroadcastStarted?: (broadcastId: string) => void;
  onBroadcastEnded?: (broadcastId: string) => void;
}

const GlobalLiveKitContext = createContext<GlobalLiveKitContextType | null>(
  null
);

export function useGlobalLiveKit() {
  const context = useContext(GlobalLiveKitContext);
  if (!context) {
    throw new Error(
      "useGlobalLiveKit must be used within GlobalLiveKitProvider"
    );
  }
  return context;
}

interface GlobalLiveKitProviderProps {
  children: React.ReactNode;
}

export function GlobalLiveKitProvider({
  children,
}: GlobalLiveKitProviderProps) {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);
  // Refs to hold latest values for stable callbacks
  const currentRoomRef = useRef<Room | null>(null);
  const activeBroadcastRef = useRef<string | null>(null);
  // Map to dedupe concurrent connection attempts
  const pendingConnectionsRef = useRef<Map<string, Promise<Room>>>(new Map());
  // token cache to avoid refetching tokens repeatedly for same identity
  const tokenCacheRef = useRef<Map<string, { token: string; expiry: number }>>(
    new Map()
  );

  // keep refs in sync with state
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useEffect(() => {
    activeBroadcastRef.current = activeBroadcast;
  }, [activeBroadcast]);

  // Listen for broadcast events (use refs inside handlers to avoid re-registering)
  useEffect(() => {
    const handleBroadcastLive = (event: CustomEvent) => {
      const broadcast = event.detail;
      setActiveBroadcast(broadcast.id);
    };

    const handleBroadcastEnded = (event: CustomEvent) => {
      setActiveBroadcast(null);
      // Disconnect room when broadcast ends using ref
      const room = currentRoomRef.current;
      if (room) {
        try {
          room.disconnect();
        } catch (err) {
          console.warn(
            "[LiveKit] error disconnecting room on broadcast-ended",
            err
          );
        }
        setCurrentRoom(null);
      }
    };

    window.addEventListener(
      "broadcast-live",
      handleBroadcastLive as EventListener
    );
    window.addEventListener(
      "broadcast-ended",
      handleBroadcastEnded as EventListener
    );

    return () => {
      window.removeEventListener(
        "broadcast-live",
        handleBroadcastLive as EventListener
      );
      window.removeEventListener(
        "broadcast-ended",
        handleBroadcastEnded as EventListener
      );
    };
  }, []);

  console.log("LOGGING THE CURRENT ROOM", currentRoom);

  const joinRoom = useCallback(
    async (
      broadcastId: string,
      userId: string,
      userName?: string,
      role: "broadcaster" | "listener" = "listener"
    ): Promise<Room> => {
      const connectionKey = `${broadcastId}-${userId}-${role}`;

      console.log("🔵 [LiveKit] Joining room:", {
        broadcastId,
        userId,
        userName,
        role,
        timestamp: new Date().toISOString(),
      });

      // If already connected (use refs) return existing
      const existingRoom = currentRoomRef.current;
      if (
        existingRoom &&
        existingRoom.state === "connected" &&
        activeBroadcastRef.current === broadcastId &&
        existingRoom.localParticipant.identity === userId
      ) {
        console.log("✅ [LiveKit] Already connected to broadcast:", {
          broadcastId,
          participants: existingRoom.numParticipants,
        });
        return existingRoom;
      }

      // Create the connection promise and store it so concurrent callers reuse it
      // Wrap the actual connection flow with a timeout to avoid stuck pending entries.
      const TIMEOUT_MS = 20000; // 20s
      const connectionStart = Date.now();
      const timedOutFlag = { value: false };

      // If there's a pending connection for the same key, return it
      const pending = pendingConnectionsRef.current.get(connectionKey);
      if (pending) {
        console.log(
          "[LiveKit] Found pending connection for",
          connectionKey,
          "- checking if still valid"
        );
        // Check if this pending connection is stuck (older than 30s)
        const pendingAge = Date.now() - connectionStart;
        if (pendingAge > 30000) {
          console.warn(
            "[LiveKit] Clearing stuck pending connection for",
            connectionKey
          );
          pendingConnectionsRef.current.delete(connectionKey);
        } else {
          console.log(
            "[LiveKit] Reusing pending connection promise for",
            connectionKey
          );
          return pending;
        }
      }

      // We'll create an AbortController reference in the outer scope so the
      // timeout handler can abort the token fetch immediately if needed.
      let outerTokenAbort: AbortController | null = null;

      const innerPromise = (async () => {
        console.log("🔵 [LiveKit] Creating connection promise:", {
          broadcastId,
          userId,
          userName,
          role,
          timestamp: new Date().toISOString(),
        });
        let room: Room | null = null;
        let tokenAbort: AbortController | null = null;
        try {
          // Disconnect from any existing room first (use ref)
          const existing = currentRoomRef.current;
          if (existing) {
            try {
              console.log("🧹 [LiveKit] Disconnecting from previous room");
              // remove all listeners if available
              try {
                (existing as any).removeAllListeners?.();
              } catch (e) {
                // ignore
              }
              existing.disconnect();
            } catch (err) {
              console.warn(
                "[LiveKit] error when disconnecting existing room",
                err
              );
            }
            setCurrentRoom(null);
          }

          // Initialize AudioContext
          try {
            await audioContextManager.initialize();
          } catch (error) {
            console.warn(
              "⚠️ [LiveKit] AudioContext not ready yet (will initialize on user interaction)"
            );
          }

          // Create new room
          const room = new Room({
            adaptiveStream: true,
            dynacast: false,
            reconnectPolicy: {
              nextRetryDelayInMs: (context) => {
                console.log(
                  `🔄 [LiveKit] Reconnecting (attempt ${context.retryCount + 1})...`
                );
                return Math.min(1000 * Math.pow(2, context.retryCount), 8000);
              },
            },
            disconnectOnPageLeave: true,
            publishDefaults: {
              simulcast: false,
              stopMicTrackOnMute: false,
              audioPreset: {
                maxBitrate: 128000, // 128 kbps for high quality
                priority: "high",
              },
            },
            // Audio processing settings for continuous speech
            audioCaptureDefaults: {
              autoGainControl: true,
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 48000,
              channelCount: 1,
            },
          });

          const cacheKey = `${connectionKey}-token`;
          // reuse token from cache when fresh
          const cached = tokenCacheRef.current.get(cacheKey);
          let data: any;
          if (cached && cached.expiry > Date.now()) {
            data = { token: cached.token };
            console.log("[LiveKit] Reusing cached token for", cacheKey);
          } else {
            console.log(
              "🔑 [LiveKit] Requesting token for broadcast:",
              broadcastId
            );
            // make the token request abortable so we can cancel it on timeout
            tokenAbort = new AbortController();
            // keep a reference visible to the timeout handler
            outerTokenAbort = tokenAbort;
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livekit/token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                roomName: "radio-station", // Single shared room for all users
                userName: userName || userId,
                role,
              }),
              signal: tokenAbort.signal,
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(
                `Token request failed: ${response.status} - ${errorText}`
              );
            }

            data = await response.json();
            console.log("🔑 [LiveKit] Token response data:", data);

            // cache token for short period to avoid rapid refetches
            try {
              const ttl = 15 * 1000; // 15s
              tokenCacheRef.current.set(cacheKey, {
                token: data.token,
                expiry: Date.now() + ttl,
              });
            } catch (e) {
              // ignore cache failures
            }
          }

          const serverUrl =
            process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL || "ws://localhost:7880";

          console.log("🌐 [LiveKit] Connecting to server:", {
            serverUrl,
            broadcastId,
            role,
            hasToken: !!data.token,
            tokenLength: data.token?.length,
          });

          await room.connect(serverUrl, data.token);

          // If the timeout already fired, disconnect this late room and throw
          if (timedOutFlag.value) {
            try {
              console.warn(
                "[LiveKit] Connection completed after timeout; disconnecting late room"
              );
              room.disconnect();
            } catch (e) {
              // ignore
            }
            throw new Error("Connection timed out");
          }

          console.log("✅ [LiveKit] Successfully connected to broadcast:", {
            broadcastId,
            participants: room.numParticipants,
            state: room.state,
            localParticipant: room.localParticipant.identity,
            roomName: room.name,
            isConnected: room.state === "connected",
          });

          // Store room and mark active broadcast
          setCurrentRoom(room);
          setActiveBroadcast(broadcastId);
          console.log(
            "💾 [LiveKit] Room stored in state and activeBroadcast set",
            { broadcastId }
          );
          console.log("💾 [LiveKit] Room stored in state:", {
            roomStored: !!room,
            roomState: room.state,
            roomId: room.name,
            localParticipant: room.localParticipant?.identity,
          });

          // Register handlers and keep references for cleanup
          const handleDisconnected = () => {
            console.log("⚠️ [LiveKit] Room disconnected:", { broadcastId });
            // remove listeners
            try {
              room.off("disconnected", handleDisconnected);
              room.off("participantConnected", handleParticipantConnected);
              room.off(
                "participantDisconnected",
                handleParticipantDisconnected
              );
            } catch (err) {
              // ignore
            }
            setCurrentRoom(null);
            setActiveBroadcast(null);
          };

          const handleParticipantConnected = (participant: any) => {
            console.log("👤 [LiveKit] Participant joined:", {
              broadcastId,
              participant: participant.identity,
              totalParticipants: room.numParticipants,
            });
          };

          const handleParticipantDisconnected = (participant: any) => {
            console.log("👋 [LiveKit] Participant left:", {
              broadcastId,
              participant: participant.identity,
              totalParticipants: room.numParticipants,
            });
          };

          room.on("disconnected", handleDisconnected);
          room.on("participantConnected", handleParticipantConnected);
          room.on("participantDisconnected", handleParticipantDisconnected);

          return room;
        } finally {
          // ensure any token fetch abort controller is cleaned up and
          // clear outer reference so timeout handler doesn't hold stale refs
          tokenAbort = null;
          outerTokenAbort = null;
        }
      })();

      // Create a timeout promise that marks the connection as timed out and rejects
      const timeoutPromise = new Promise<Room>((_res, rej) => {
        const id = setTimeout(() => {
          timedOutFlag.value = true;
          // attempt to abort token fetch if running by using the outer reference
          try {
            if (outerTokenAbort) {
              outerTokenAbort.abort();
              console.warn("[LiveKit] Aborted token fetch due to join timeout");
            }
          } catch (e) {
            // ignore
          }
          rej(new Error(`LiveKit join timed out after ${TIMEOUT_MS}ms`));
        }, TIMEOUT_MS);
        // If innerPromise resolves/rejects first, clear the timer
        innerPromise.finally(() => clearTimeout(id));
      });

      const connectionPromise = Promise.race([innerPromise, timeoutPromise]);

      // store pending and ensure cleanup
      pendingConnectionsRef.current.set(connectionKey, connectionPromise);
      connectionPromise.finally(() => {
        pendingConnectionsRef.current.delete(connectionKey);
      });

      try {
        return await connectionPromise;
      } catch (error) {
        console.error("❌ [LiveKit] Failed to connect to room:", error);
        throw error;
      }
    },
    []
  );

  const leaveRoom = useCallback(() => {
    const room = currentRoomRef.current;
    if (room) {
      console.log("👋 [LiveKit] Leaving room");
      try {
        try {
          (room as any).removeAllListeners?.();
        } catch (e) {
          // ignore
        }
        room.disconnect();
      } catch (err) {
        console.warn("[LiveKit] error while leaving room", err);
      }
      setCurrentRoom(null);
    }
  }, []);

  return (
    <GlobalLiveKitContext.Provider
      value={{
        currentRoom,
        activeBroadcast,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </GlobalLiveKitContext.Provider>
  );
}

// Simplified room provider for components that need room context
interface RoomProviderProps {
  children: React.ReactNode;
  broadcastId: string;
  userId: string;
  userName?: string;
  role?: "broadcaster" | "listener";
}

export function RoomProvider({
  children,
  broadcastId,
  userId,
  userName,
  role,
}: RoomProviderProps) {
  const { joinRoom, currentRoom } = useGlobalLiveKit();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomReady, setRoomReady] = useState(false);
  const [localRoom, setLocalRoom] = useState<Room | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initRoom = async () => {
      try {
        console.log("🔌 [RoomProvider] Initializing room connection...", {
          broadcastId,
          userId,
        });

        const room = await joinRoom(broadcastId, userId, userName, role);
        console.log("🔌 [RoomProvider] joinRoom returned:", {
          room: !!room,
          roomState: room?.state,
          roomName: room?.name,
          isConnected: room?.state === "connected",
          participants: room?.numParticipants,
        });

        if (isMounted && room) {
          // Use the returned room directly to avoid race with global currentRoom state
          setLocalRoom(room);
          setRoomReady(true);
          setLoading(false);
          console.log("✅ [RoomProvider] Local room ready, state:", room.state);
        }
      } catch (err) {
        console.error("❌ [RoomProvider] Failed to initialize room:", err);
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to connect";
          setError(errorMessage);
          setLoading(false);
        }
      }
    };

    initRoom();

    return () => {
      isMounted = false;
    };
  }, [joinRoom, broadcastId, userId, userName, role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p>Connecting to LiveKit...</p>
        </div>
      </div>
    );
  }

  if (error || !roomReady || !localRoom) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-medium">Connection Error</p>
          <p className="text-sm text-gray-600">
            {error || "Failed to connect to room"}
          </p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              setRoomReady(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <RoomContext.Provider value={localRoom}>{children}</RoomContext.Provider>
  );
}
