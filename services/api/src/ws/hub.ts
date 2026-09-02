/**
 * @commonscene/api — WebSocket Event Hub.
 *
 * Manages active WebSocket connections per room and broadcasts typed events
 * in accordance with AGENTS.md contract schemas.
 */

import type { WebSocket } from 'ws';
import type { WsServerEvent } from '@commonscene/contracts';

export class RoomWebSocketHub {
    private roomClients = new Map<string, Set<WebSocket>>();

    /**
     * Registers a new WebSocket connection for a given room code.
     */
    addClient(roomCode: string, socket: WebSocket): void {
        const normalized = roomCode.trim().toUpperCase();
        let set = this.roomClients.get(normalized);
        if (!set) {
            set = new Set();
            this.roomClients.set(normalized, set);
        }
        set.add(socket);

        socket.on('close', () => {
            this.removeClient(normalized, socket);
        });
    }

    /**
     * Removes a closed socket from a room.
     */
    removeClient(roomCode: string, socket: WebSocket): void {
        const normalized = roomCode.trim().toUpperCase();
        const set = this.roomClients.get(normalized);
        if (set) {
            set.delete(socket);
            if (set.size === 0) {
                this.roomClients.delete(normalized);
            }
        }
    }

    /**
     * Broadcasts a typed server event to all connected clients in a room.
     */
    broadcast(roomCode: string, event: WsServerEvent): void {
        const normalized = roomCode.trim().toUpperCase();
        const set = this.roomClients.get(normalized);
        if (!set || set.size === 0) return;

        const payload = JSON.stringify(event);
        for (const client of set) {
            if (client.readyState === client.OPEN) {
                client.send(payload);
            }
        }
    }

    /**
     * Sends a direct event to a single socket.
     */
    sendToSocket(socket: WebSocket, event: WsServerEvent): void {
        if (socket.readyState === socket.OPEN) {
            socket.send(JSON.stringify(event));
        }
    }

    /**
     * Returns the count of active connections for a room.
     */
    getClientCount(roomCode: string): number {
        const normalized = roomCode.trim().toUpperCase();
        return this.roomClients.get(normalized)?.size ?? 0;
    }
}

export const wsHub = new RoomWebSocketHub();
