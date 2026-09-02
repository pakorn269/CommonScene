import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from './server.js';
import { InMemoryRoomRepository } from './repository.js';
import type {
    CreateRoomResponse,
    JoinRoomResponse,
    RecommendationResult,
} from '@commonscene/contracts';

describe('Room API Integration Tests', () => {
    let server: FastifyInstance;
    let repository: InMemoryRoomRepository;

    beforeEach(async () => {
        repository = new InMemoryRoomRepository();
        server = await buildServer({ repository });
        await server.ready();
    });

    afterEach(async () => {
        await server.close();
    });

    it('creates a new room with a host participant and 4-letter code', async () => {
        const res = await server.inject({
            method: 'POST',
            url: '/api/v1/rooms',
            payload: {
                hostDisplayName: 'Alice',
                hostAvatarId: 'avatar-1',
            },
        });

        expect(res.statusCode).toBe(201);
        const data = res.json<CreateRoomResponse>();
        expect(data.room.code).toMatch(/^[A-Z0-9]{4}$/);
        expect(data.room.status).toBe('lobby');
        expect(data.hostParticipant.displayName).toBe('Alice');
        expect(data.hostParticipant.isHost).toBe(true);
    });

    it('allows participants to join and prevents duplicate nicknames', async () => {
        const createRes = await server.inject({
            method: 'POST',
            url: '/api/v1/rooms',
            payload: { hostDisplayName: 'Alice' },
        });
        const { room } = createRes.json<CreateRoomResponse>();

        // Join Bob
        const joinRes = await server.inject({
            method: 'POST',
            url: `/api/v1/rooms/${room.code}/participants`,
            payload: { displayName: 'Bob', avatarId: 'avatar-2' },
        });
        expect(joinRes.statusCode).toBe(201);
        const joinData = joinRes.json<JoinRoomResponse>();
        expect(joinData.participants.length).toBe(2);

        // Attempt duplicate nickname "bob" (case-insensitive)
        const dupRes = await server.inject({
            method: 'POST',
            url: `/api/v1/rooms/${room.code}/participants`,
            payload: { displayName: 'bob', avatarId: 'avatar-3' },
        });
        expect(dupRes.statusCode).toBe(400);
        expect(dupRes.json<{ message: string }>().message).toContain(
            'already in this room'
        );
    });

    it('completes full flow: preferences -> ranking -> voting -> finalize', async () => {
        // 1. Create Room
        const createRes = await server.inject({
            method: 'POST',
            url: '/api/v1/rooms',
            payload: { hostDisplayName: 'Alice' },
        });
        const { room, hostParticipant } = createRes.json<CreateRoomResponse>();

        // 2. Join Bob
        const joinRes = await server.inject({
            method: 'POST',
            url: `/api/v1/rooms/${room.code}/participants`,
            payload: { displayName: 'Bob' },
        });
        const bob = joinRes.json<JoinRoomResponse>().participant;

        // 3. Alice submits preferences
        const alicePrefRes = await server.inject({
            method: 'PUT',
            url: `/api/v1/rooms/${room.code}/participants/${hostParticipant.id}/preferences`,
            payload: {
                preferredGenres: ['Family', 'Comedy'],
                excludedGenres: ['Horror'],
                moods: ['lighthearted'],
                maximumRuntimeMinutes: 100,
                maximumContentRating: 'PG',
                avoidContentTags: [],
                freeText: 'Fun for family',
            },
        });
        expect(alicePrefRes.statusCode).toBe(200);

        // 4. Bob submits preferences
        const bobPrefRes = await server.inject({
            method: 'PUT',
            url: `/api/v1/rooms/${room.code}/participants/${bob.id}/preferences`,
            payload: {
                preferredGenres: ['Family', 'Adventure'],
                excludedGenres: [],
                moods: ['heartwarming', 'whimsical'],
                maximumRuntimeMinutes: 120,
                maximumContentRating: 'PG',
                avoidContentTags: [],
                freeText: null,
            },
        });
        expect(bobPrefRes.statusCode).toBe(200);

        // 5. Trigger Ranking
        const rankRes = await server.inject({
            method: 'POST',
            url: `/api/v1/rooms/${room.code}/rank`,
        });
        expect(rankRes.statusCode).toBe(200);
        const rankData = rankRes.json<RecommendationResult>();
        expect(rankData.recommendations.length).toBeGreaterThan(0);
        expect(rankData.recommendations.length).toBeLessThanOrEqual(3);

        const winnerCandidateId = rankData.recommendations[0]!.movieId;

        // 6. Alice & Bob vote
        const aliceVoteRes = await server.inject({
            method: 'POST',
            url: `/api/v1/rooms/${room.code}/votes`,
            headers: { 'x-participant-id': hostParticipant.id },
            payload: { movieId: winnerCandidateId, rank: 1 },
        });
        expect(aliceVoteRes.statusCode).toBe(200);

        // 7. Finalize winner
        const finalizeRes = await server.inject({
            method: 'POST',
            url: `/api/v1/rooms/${room.code}/finalize`,
            payload: { winningMovieId: winnerCandidateId },
        });
        expect(finalizeRes.statusCode).toBe(200);
        const finalized = finalizeRes.json<{
            room: { status: string; winningMovieId: string };
            winningMovie: { id: string };
        }>();
        expect(finalized.room.status).toBe('complete');
        expect(finalized.room.winningMovieId).toBe(winnerCandidateId);
        expect(finalized.winningMovie.id).toBe(winnerCandidateId);
    });
});
