/**
 * @commonscene/api — Room REST Route Handlers.
 *
 * Implements endpoints specified in AGENTS.md:
 * - POST /api/v1/rooms
 * - GET  /api/v1/rooms/:roomCode
 * - POST /api/v1/rooms/:roomCode/participants
 * - PUT  /api/v1/rooms/:roomCode/participants/:participantId/preferences
 * - POST /api/v1/rooms/:roomCode/rank
 * - GET  /api/v1/rooms/:roomCode/recommendations
 * - POST /api/v1/rooms/:roomCode/votes
 * - POST /api/v1/rooms/:roomCode/finalize
 */

import type { FastifyPluginAsync } from 'fastify';
import {
    CreateRoomRequestSchema,
    JoinRoomRequestSchema,
    SubmitPreferencesRequestSchema,
    SubmitVoteRequestSchema,
    WsEventNames,
} from '@commonscene/contracts';
import { getCatalog, getMovieById } from '@commonscene/catalog';
import { rankMovies } from '@commonscene/consensus';
import type { InMemoryRoomRepository } from '../repository.js';
import { wsHub } from '../ws/hub.js';
import { defaultBedrockService } from '../ai/bedrock.js';

export interface RoomRoutesOptions {
    repository: InMemoryRoomRepository;
}

export const roomRoutes: FastifyPluginAsync<RoomRoutesOptions> = async (
    fastify,
    opts
) => {
    await Promise.resolve();
    const { repository } = opts;

    // -------------------------------------------------------------------------
    // 1. Create Room
    // -------------------------------------------------------------------------
    fastify.post('/rooms', async (request, reply) => {
        const bodyParse = CreateRoomRequestSchema.safeParse(request.body ?? {});
        if (!bodyParse.success) {
            return reply.status(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: bodyParse.error.message,
            });
        }

        const { hostDisplayName, hostAvatarId } = bodyParse.data;
        const result = repository.createRoom(hostDisplayName, hostAvatarId);

        return reply.status(201).send(result);
    });

    // -------------------------------------------------------------------------
    // 2. Get Room Snapshot
    // -------------------------------------------------------------------------
    fastify.get<{ Params: { roomCode: string } }>(
        '/rooms/:roomCode',
        async (request, reply) => {
            const { roomCode } = request.params;
            const room = repository.getRoomByCode(roomCode);
            if (!room) {
                return reply.status(404).send({
                    statusCode: 404,
                    error: 'Not Found',
                    message: `Room with code "${roomCode}" was not found.`,
                });
            }

            const participants = repository.getParticipants(room.id);
            const recommendations = repository.getRecommendations(room.id);
            const votes = repository.getVotes(room.id);

            return reply.status(200).send({
                room,
                participants,
                recommendations: recommendations?.recommendations,
                votes,
            });
        }
    );

    // -------------------------------------------------------------------------
    // 3. Join Room
    // -------------------------------------------------------------------------
    fastify.post<{ Params: { roomCode: string } }>(
        '/rooms/:roomCode/participants',
        async (request, reply) => {
            const { roomCode } = request.params;
            const bodyParse = JoinRoomRequestSchema.safeParse(request.body);
            if (!bodyParse.success) {
                return reply.status(400).send({
                    statusCode: 400,
                    error: 'Bad Request',
                    message: bodyParse.error.message,
                });
            }

            try {
                const { displayName, avatarId } = bodyParse.data;
                const result = repository.addParticipant(
                    roomCode,
                    displayName,
                    avatarId
                );

                // Broadcast participant.joined event
                wsHub.broadcast(roomCode, {
                    type: WsEventNames.PARTICIPANT_JOINED,
                    participant: result.participant,
                });

                return reply.status(201).send(result);
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : 'Unable to join room.';
                return reply.status(400).send({
                    statusCode: 400,
                    error: 'Bad Request',
                    message,
                });
            }
        }
    );

    // -------------------------------------------------------------------------
    // 4. Submit Preferences
    // -------------------------------------------------------------------------
    fastify.put<{ Params: { roomCode: string; participantId: string } }>(
        '/rooms/:roomCode/participants/:participantId/preferences',
        async (request, reply) => {
            const { roomCode, participantId } = request.params;
            const bodyParse = SubmitPreferencesRequestSchema.safeParse(
                request.body
            );
            if (!bodyParse.success) {
                return reply.status(400).send({
                    statusCode: 400,
                    error: 'Bad Request',
                    message: bodyParse.error.message,
                });
            }

            try {
                const preferenceData = { ...bodyParse.data };

                // If user entered freeText, optionally parse soft preferences via Bedrock
                if (
                    defaultBedrockService.isAvailable() &&
                    preferenceData.freeText &&
                    preferenceData.freeText.trim().length > 0
                ) {
                    const parsed = await defaultBedrockService.parseFreeTextPreferences(
                        preferenceData.freeText
                    );
                    if (parsed) {
                        if (
                            preferenceData.preferredGenres.length === 0 &&
                            parsed.preferredGenres.length > 0
                        ) {
                            preferenceData.preferredGenres = parsed.preferredGenres;
                        }
                        if (
                            preferenceData.moods.length === 0 &&
                            parsed.moods.length > 0
                        ) {
                            preferenceData.moods = parsed.moods;
                        }
                    }
                }

                const result = repository.submitPreferences(
                    roomCode,
                    participantId,
                    preferenceData
                );

                // Broadcast preferences.submitted event
                wsHub.broadcast(roomCode, {
                    type: WsEventNames.PREFERENCES_SUBMITTED,
                    participantId,
                    submittedCount: result.submittedCount,
                    totalParticipants: result.totalParticipants,
                });

                return reply.status(200).send(result);
            } catch (err: unknown) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Unable to submit preferences.';
                return reply.status(400).send({
                    statusCode: 400,
                    error: 'Bad Request',
                    message,
                });
            }
        }
    );

    // -------------------------------------------------------------------------
    // 5. Trigger Consensus Ranking
    // -------------------------------------------------------------------------
    fastify.post<{ Params: { roomCode: string } }>(
        '/rooms/:roomCode/rank',
        async (request, reply) => {
            const { roomCode } = request.params;
            const room = repository.getRoomByCode(roomCode);
            if (!room) {
                return reply.status(404).send({
                    statusCode: 404,
                    error: 'Not Found',
                    message: `Room with code "${roomCode}" not found.`,
                });
            }

            // Broadcast ranking.started
            wsHub.broadcast(roomCode, {
                type: WsEventNames.RANKING_STARTED,
                roomId: room.id,
            });

            const catalog = getCatalog();
            const profiles = repository.getPreferences(room.id);
            const ranked = rankMovies(catalog, profiles);

            // Take top 3 candidates for voting
            const topCandidates = ranked.slice(0, 3);
            const aiEnhanced = defaultBedrockService.isAvailable();

            // Enrich top candidates with Bedrock natural explanations if available
            if (aiEnhanced && topCandidates.length > 0) {
                await Promise.all(
                    topCandidates.map(async (candidate) => {
                        const movie = getMovieById(candidate.movieId);
                        if (movie) {
                            candidate.explanation =
                                await defaultBedrockService.explainRecommendation(
                                    movie,
                                    candidate,
                                    profiles
                                );
                        }
                    })
                );
            }

            const firstCandidate = topCandidates[0];
            const topMovie =
                firstCandidate
                    ? getMovieById(firstCandidate.movieId)
                    : undefined;

            const groupSummary =
                topMovie && aiEnhanced
                    ? await defaultBedrockService.generateGroupSummary(
                          profiles,
                          topMovie
                      )
                    : topCandidates.length > 0
                    ? `Found ${topCandidates.length} fair consensus recommendations for your group.`
                    : `No movies matched all hard constraints for this group.`;

            const result = repository.setRecommendations(
                roomCode,
                topCandidates,
                groupSummary,
                aiEnhanced
            );

            // Broadcast recommendations.ready
            wsHub.broadcast(roomCode, {
                type: WsEventNames.RECOMMENDATIONS_READY,
                result,
            });

            return reply.status(200).send(result);
        }
    );

    // -------------------------------------------------------------------------
    // 6. Get Recommendations
    // -------------------------------------------------------------------------
    fastify.get<{ Params: { roomCode: string } }>(
        '/rooms/:roomCode/recommendations',
        async (request, reply) => {
            const { roomCode } = request.params;
            const room = repository.getRoomByCode(roomCode);
            if (!room) {
                return reply.status(404).send({
                    statusCode: 404,
                    error: 'Not Found',
                    message: `Room with code "${roomCode}" not found.`,
                });
            }

            const recs = repository.getRecommendations(room.id);
            if (!recs) {
                return reply.status(404).send({
                    statusCode: 404,
                    error: 'Not Found',
                    message: 'Recommendations have not been calculated yet.',
                });
            }

            return reply.status(200).send(recs);
        }
    );

    // -------------------------------------------------------------------------
    // 7. Submit Vote
    // -------------------------------------------------------------------------
    fastify.post<{
        Params: { roomCode: string };
        Headers: { 'x-participant-id'?: string };
    }>('/rooms/:roomCode/votes', async (request, reply) => {
        const { roomCode } = request.params;
        const participantId =
            request.headers['x-participant-id'] ||
            (request.body as { participantId?: string })?.participantId;

        if (!participantId) {
            return reply.status(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Participant ID is required to vote.',
            });
        }

        const bodyParse = SubmitVoteRequestSchema.safeParse(request.body);
        if (!bodyParse.success) {
            return reply.status(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: bodyParse.error.message,
            });
        }

        try {
            const { movieId, rank } = bodyParse.data;
            const result = repository.submitVote(
                roomCode,
                participantId,
                movieId,
                rank
            );

            // Broadcast vote.submitted
            wsHub.broadcast(roomCode, {
                type: WsEventNames.VOTE_SUBMITTED,
                vote: result.vote,
                votesCount: result.votesCount,
                totalParticipants: result.totalParticipants,
            });

            return reply.status(200).send(result);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Unable to submit vote.';
            return reply.status(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message,
            });
        }
    });

    // -------------------------------------------------------------------------
    // 8. Finalize Room
    // -------------------------------------------------------------------------
    fastify.post<{ Params: { roomCode: string } }>(
        '/rooms/:roomCode/finalize',
        async (request, reply) => {
            const { roomCode } = request.params;
            const winningMovieId = (request.body as { winningMovieId?: string })
                ?.winningMovieId;

            if (!winningMovieId) {
                return reply.status(400).send({
                    statusCode: 400,
                    error: 'Bad Request',
                    message: 'winningMovieId is required.',
                });
            }

            try {
                const result = repository.finalizeWinner(
                    roomCode,
                    winningMovieId
                );

                // Broadcast room.completed
                wsHub.broadcast(roomCode, {
                    type: WsEventNames.ROOM_COMPLETED,
                    roomId: result.room.id,
                    winningMovie: result.winningMovie,
                    votes: result.votes,
                });

                return reply.status(200).send(result);
            } catch (err: unknown) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Unable to finalize room.';
                return reply.status(400).send({
                    statusCode: 400,
                    error: 'Bad Request',
                    message,
                });
            }
        }
    );
};
