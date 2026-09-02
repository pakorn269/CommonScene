/**
 * @commonscene/api — Fastify Application Server.
 *
 * Configures HTTP REST routes (/api/v1/...) and WebSocket connections (/ws/rooms/:roomCode).
 */

import type { WebSocket } from 'ws';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import fastifyWebsocket from '@fastify/websocket';
import { HealthResponseSchema, WsEventNames, type HealthResponse } from '@commonscene/contracts';
import { InMemoryRoomRepository } from './repository.js';
import { wsHub } from './ws/hub.js';
import { roomRoutes } from './routes/rooms.js';

export interface BuildServerOptions {
  repository?: InMemoryRoomRepository;
}

export async function buildServer(opts: BuildServerOptions = {}): Promise<FastifyInstance> {
  const server = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] || 'info',
    },
  });

  const repository = opts.repository ?? new InMemoryRoomRepository();

  // Register plugins
  await server.register(cors, {
    origin: (_origin, cb) => {
      cb(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
  });

  await server.register(sensible);
  await server.register(fastifyWebsocket);

  // Health Check Endpoint
  server.get('/health', async (_request, reply) => {
    const response: HealthResponse = {
      status: 'ok',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };

    const validated = HealthResponseSchema.parse(response);
    return reply
      .header('Content-Type', 'application/json; charset=utf-8')
      .status(200)
      .send(validated);
  });

  // REST API Routes under /api/v1
  await server.register(roomRoutes, {
    prefix: '/api/v1',
    repository,
  });

  // WebSocket Endpoint: /ws/rooms/:roomCode
  server.get<{ Params: { roomCode: string } }>(
    '/ws/rooms/:roomCode',
    { websocket: true },
    (socket: WebSocket, request) => {
      const { roomCode } = request.params;

      const room = repository.getRoomByCode(roomCode);
      if (!room) {
        wsHub.sendToSocket(socket, {
          type: WsEventNames.ROOM_ERROR,
          message: `Room "${roomCode}" not found.`,
          code: 'ROOM_NOT_FOUND',
        });
        socket.close(1008, 'Room not found');
        return;
      }

      // Register connection with hub
      wsHub.addClient(roomCode, socket);

      // Send initial snapshot immediately on connect
      const participants = repository.getParticipants(room.id);
      const recommendations = repository.getRecommendations(room.id);
      const votes = repository.getVotes(room.id);

      wsHub.sendToSocket(socket, {
        type: WsEventNames.ROOM_SNAPSHOT,
        room,
        participants,
        recommendations: recommendations?.recommendations,
        votes,
      });
    },
  );

  return server;
}
