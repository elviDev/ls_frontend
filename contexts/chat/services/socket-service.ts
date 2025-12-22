import { io, Socket } from "socket.io-client";
import { WS_URL } from "@/utils/config";

export interface SocketConfig {
  url?: string;
  transports?: string[];
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
  forceNew?: boolean;
}

export class SocketService {
  private socket: Socket | null = null;
  private config: SocketConfig;

  constructor(config: SocketConfig = {}) {
    this.config = {
      url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      forceNew: false,
      ...config,
    };
  }

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(this.config.url!, {
      transports: this.config.transports as any,
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      reconnectionDelayMax: this.config.reconnectionDelayMax,
      timeout: this.config.timeout,
      forceNew: true,
    });

    this.socket.connect();
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  emit(event: string, ...args: any[]): void {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }
}