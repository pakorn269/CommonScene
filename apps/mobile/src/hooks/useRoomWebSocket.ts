/**
 * useRoomWebSocket — Hook managing live room events for mobile participants.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { WsServerEvent } from '@commonscene/contracts';

export interface UseRoomWebSocketOptions {
  roomCode: string | null;
  onEvent?: (event: WsServerEvent) => void;
}

export function useRoomWebSocket(options: UseRoomWebSocketOptions) {
  const { roomCode, onEvent } = options;
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!roomCode) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Connect to API host port 3001 if dev, or current host
    const host =
      window.location.port === '5173' ? `${window.location.hostname}:3001` : window.location.host;
    const url = `${protocol}//${host}/ws/rooms/${roomCode.toUpperCase()}`;

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
        console.error('Failed to parse WebSocket event', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Reconnect after 3s if still on this room
      setTimeout(() => {
        if (socketRef.current === ws) {
          connect();
        }
      }, 3000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket connection error', err);
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
