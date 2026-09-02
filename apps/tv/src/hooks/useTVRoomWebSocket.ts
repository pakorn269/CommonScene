/**
 * useTVRoomWebSocket — TV WebSocket connection hook.
 *
 * Connects the TV app to the backend event hub at ws://10.0.2.2:3001/ws/rooms/:roomCode
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { WsServerEvent } from '@commonscene/contracts';

interface TVWebSocket {
  send(data: string): void;
  close(): void;
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onclose: (() => void) | null;
  onerror: ((err: unknown) => void) | null;
}

declare const WebSocket: {
  new (url: string): TVWebSocket;
};

export interface UseTVRoomWebSocketOptions {
  roomCode: string | null;
  onEvent?: (event: WsServerEvent) => void;
}

export function useTVRoomWebSocket(options: UseTVRoomWebSocketOptions) {
  const { roomCode, onEvent } = options;
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<TVWebSocket | null>(null);

  const connect = useCallback(() => {
    if (!roomCode) return;

    const url = `ws://10.0.2.2:3001/ws/rooms/${roomCode.toUpperCase()}`;
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const parsed: WsServerEvent = JSON.parse(event.data);
        onEvent?.(parsed);
      } catch (err) {
        console.warn('[TV WS] Failed to parse event', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setTimeout(() => {
        if (socketRef.current === ws) {
          connect();
        }
      }, 3000);
    };

    ws.onerror = (err) => {
      console.warn('[TV WS] Connection error', err);
    };
  }, [roomCode, onEvent]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [connect]);

  return { isConnected };
}
