"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { io } from "socket.io-client";

export function ConnectionTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [wsStatus, setWsStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `${timestamp}: ${message}`]);
    console.log(message);
  };

  const testWebSocket = async () => {
    log("🔗 Testing WebSocket connection...");
    setWsStatus("connecting");

    try {
      const socket = io(
        process.env.NEXT_PUBLIC_WS_URL ||
          "http://radiostation-backend-ruuhuz-3d7a30-109-123-240-242.traefik.me",
        {
          transports: ["websocket", "polling"],
          timeout: 5000,
          forceNew: true,
        }
      );

      socket.on("connect", () => {
        log("✅ WebSocket connected successfully");
        setWsStatus("connected");

        // Test broadcaster join
        socket.emit("join-as-broadcaster", "test-broadcast-123", {
          username: "Test Host",
          stationName: "Test Station",
        });
      });

      socket.on("broadcaster-ready", (data) => {
        log("✅ Broadcaster ready: " + JSON.stringify(data));
      });

      socket.on("connect_error", (error) => {
        log("❌ WebSocket connection error: " + error.message);
        setWsStatus("error");
      });

      socket.on("disconnect", (reason) => {
        log("⚠️ WebSocket disconnected: " + reason);
        setWsStatus("disconnected");
      });

      // Auto-disconnect after 10 seconds
      setTimeout(() => {
        socket.disconnect();
        log("🔌 WebSocket test completed");
      }, 10000);
    } catch (error) {
      log(
        "❌ WebSocket test failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      setWsStatus("error");
    }
  };

  const testHLSStream = async () => {
    log("🎵 Testing HLS stream...");

    try {
      const streamUrl = `${process.env.NEXT_PUBLIC_SRS_URL || 'http://localhost:1985'}/live/test-broadcast-123.m3u8`;
      
      // Test if stream URL is accessible
      const response = await fetch(streamUrl, { method: 'HEAD' });
      if (response.ok) {
        log("✅ HLS stream URL is accessible");
      } else {
        log(`⚠️ HLS stream URL returned status: ${response.status}`);
      }
    } catch (error) {
      log(
        "❌ HLS stream test failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const testMicrophone = async () => {
    log("🎤 Testing microphone access...");

    try {
      // Test AudioContext
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      log("✅ AudioContext created, state: " + audioContext.state);

      if (audioContext.state === "suspended") {
        await audioContext.resume();
        log("✅ AudioContext resumed, state: " + audioContext.state);
      }

      // Test microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      log("✅ Microphone access granted");
      log(`📊 Audio tracks: ${stream.getAudioTracks().length}`);

      // Test audio processing
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      log("✅ Audio processing chain created");

      // Stop after 3 seconds
      setTimeout(() => {
        stream.getTracks().forEach((track) => track.stop());
        audioContext.close();
        log("🎤 Microphone test completed");
      }, 3000);
    } catch (error) {
      log(
        "❌ Microphone test failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          log("❌ Microphone permission denied");
        } else if (error.name === "NotFoundError") {
          log("❌ No microphone found");
        }
      }
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "ready":
        return "bg-green-500";
      case "connecting":
      case "initializing":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connection & Audio Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Badge className={getStatusColor(wsStatus)}>
                WebSocket: {wsStatus}
              </Badge>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={testWebSocket}
                disabled={wsStatus === "connecting"}
              >
                Test WebSocket
              </Button>
              <Button onClick={testMicrophone}>Test Microphone</Button>
              <Button onClick={testHLSStream}>
                Test HLS Stream
              </Button>
              <Button onClick={clearLogs} variant="outline">
                Clear Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">
                Click test buttons to see logs...
              </div>
            ) : (
              logs.map((log, index) => <div key={index}>{log}</div>)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
