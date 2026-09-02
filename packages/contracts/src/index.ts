/**
 * @commonscene/contracts — Shared Domain Models, Request/Response Schemas, and Realtime Events.
 *
 * All models are validated using Zod at runtime and export strict TypeScript interfaces.
 * Governed by specifications in AGENTS.md.
 */

import { z } from 'zod';

// ============================================================================
// 1. Content Ratings & Utilities
// ============================================================================

export const ContentRatingSchema = z.enum(['G', 'PG', 'PG-13', 'R', 'NC-17']);
export type ContentRating = z.infer<typeof ContentRatingSchema>;

export const CONTENT_RATING_HIERARCHY: Record<ContentRating, number> = {
    G: 1,
    PG: 2,
    'PG-13': 3,
    R: 4,
    'NC-17': 5,
};

/**
 * Checks if a movie's rating is allowed under a given maximum content rating constraint.
 */
export function isRatingAllowed(
    movieRating: string,
    maxRating: string | null | undefined
): boolean {
    if (!maxRating) return true;
    const movieLevel =
        CONTENT_RATING_HIERARCHY[movieRating as ContentRating] ?? 99;
    const maxLevel = CONTENT_RATING_HIERARCHY[maxRating as ContentRating] ?? 99;
    return movieLevel <= maxLevel;
}

// ============================================================================
// 2. Catalog & Movie Schemas
// ============================================================================

export const MovieSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    synopsis: z.string().min(1),
    runtimeMinutes: z.number().int().positive(),
    releaseYear: z.number().int().min(1888).max(2100),
    genres: z.array(z.string().min(1)),
    moods: z.array(z.string().min(1)),
    contentRating: ContentRatingSchema,
    contentTags: z.array(z.string().min(1)),
    artworkKey: z.string().min(1),
});
export type Movie = z.infer<typeof MovieSchema>;

// ============================================================================
// 3. Room & Session Schemas
// ============================================================================

export const RoomStatusSchema = z.enum([
    'lobby',
    'collecting_preferences',
    'ranking',
    'voting',
    'complete',
    'expired',
]);
export type RoomStatus = z.infer<typeof RoomStatusSchema>;

export const RoomSchema = z.object({
    id: z.string().uuid(),
    code: z
        .string()
        .length(4)
        .regex(/^[A-Z0-9]+$/),
    status: RoomStatusSchema,
    hostParticipantId: z.string().min(1),
    participantIds: z.array(z.string().min(1)),
    candidateMovieIds: z.array(z.string().min(1)),
    winningMovieId: z.string().nullable().default(null),
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
});
export type Room = z.infer<typeof RoomSchema>;

// ============================================================================
// 4. Participant Schemas
// ============================================================================

export const ParticipantSchema = z.object({
    id: z.string().uuid(),
    roomId: z.string().uuid(),
    displayName: z.string().min(1).max(30),
    avatarId: z.string().min(1).max(20),
    isHost: z.boolean(),
    hasSubmittedPreferences: z.boolean().default(false),
    joinedAt: z.string().datetime(),
});
export type Participant = z.infer<typeof ParticipantSchema>;

// ============================================================================
// 5. Preference Profile Schemas
// ============================================================================

export const PreferenceProfileSchema = z.object({
    participantId: z.string().uuid(),
    preferredGenres: z.array(z.string()),
    excludedGenres: z.array(z.string()),
    moods: z.array(z.string()),
    maximumRuntimeMinutes: z.number().int().positive().nullable(),
    maximumContentRating: ContentRatingSchema.nullable(),
    avoidContentTags: z.array(z.string()),
    freeText: z.string().max(280).nullable().default(null),
});
export type PreferenceProfile = z.infer<typeof PreferenceProfileSchema>;

// AI-extracted structured candidate values
export const StructuredCandidatePreferencesSchema = z.object({
    moods: z.array(z.string()).default([]),
    preferredGenres: z.array(z.string()).default([]),
    excludedGenres: z.array(z.string()).default([]),
    maximumRuntimeMinutes: z.number().int().positive().nullable().default(null),
    avoidContentTags: z.array(z.string()).default([]),
});
export type StructuredCandidatePreferences = z.infer<
    typeof StructuredCandidatePreferencesSchema
>;

// ============================================================================
// 6. Recommendation & Consensus Ranking Schemas
// ============================================================================

export const ScoredComponentBreakdownSchema = z.object({
    averageSatisfaction: z.number().min(0).max(1),
    minimumSatisfaction: z.number().min(0).max(1),
    preferenceCoverage: z.number().min(0).max(1),
    penalty: z.number().min(0),
});
export type ScoredComponentBreakdown = z.infer<
    typeof ScoredComponentBreakdownSchema
>;

export const RankedMovieSchema = z.object({
    movieId: z.string(),
    score: z.number().min(0).max(1),
    averageSatisfaction: z.number().min(0).max(1),
    minimumSatisfaction: z.number().min(0).max(1),
    preferenceCoverage: z.number().min(0).max(1),
    penalty: z.number().min(0),
    matchedPreferenceKeys: z.array(z.string()),
    tradeoffs: z.array(z.string()),
    explanation: z.string(),
});
export type RankedMovie = z.infer<typeof RankedMovieSchema>;

export const RecommendationResultSchema = z.object({
    roomId: z.string().uuid(),
    recommendations: z.array(RankedMovieSchema),
    groupSummary: z.string(),
    calculatedAt: z.string().datetime(),
    usedBedrock: z.boolean(),
});
export type RecommendationResult = z.infer<typeof RecommendationResultSchema>;

// ============================================================================
// 7. Voting Schemas
// ============================================================================

export const VoteSchema = z.object({
    participantId: z.string().uuid(),
    movieId: z.string(),
    rank: z.number().int().min(1).max(3),
    votedAt: z.string().datetime(),
});
export type Vote = z.infer<typeof VoteSchema>;

// ============================================================================
// 8. HTTP API Requests & Responses
// ============================================================================

export const CreateRoomRequestSchema = z.object({
    hostDisplayName: z.string().min(1).max(30).default('Host'),
    hostAvatarId: z.string().min(1).default('avatar-1'),
});
export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;

export const CreateRoomResponseSchema = z.object({
    room: RoomSchema,
    hostParticipant: ParticipantSchema,
});
export type CreateRoomResponse = z.infer<typeof CreateRoomResponseSchema>;

export const JoinRoomRequestSchema = z.object({
    displayName: z.string().min(1).max(30),
    avatarId: z.string().min(1).default('avatar-2'),
});
export type JoinRoomRequest = z.infer<typeof JoinRoomRequestSchema>;

export const JoinRoomResponseSchema = z.object({
    room: RoomSchema,
    participant: ParticipantSchema,
    participants: z.array(ParticipantSchema),
});
export type JoinRoomResponse = z.infer<typeof JoinRoomResponseSchema>;

export const SubmitPreferencesRequestSchema = PreferenceProfileSchema.omit({
    participantId: true,
});
export type SubmitPreferencesRequest = z.infer<
    typeof SubmitPreferencesRequestSchema
>;

export const SubmitVoteRequestSchema = z.object({
    movieId: z.string(),
    rank: z.number().int().min(1).max(3).default(1),
});
export type SubmitVoteRequest = z.infer<typeof SubmitVoteRequestSchema>;

export const HealthResponseSchema = z.object({
    status: z.literal('ok'),
    version: z.string(),
    timestamp: z.string().datetime(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ApiErrorSchema = z.object({
    statusCode: z.number().int(),
    error: z.string(),
    message: z.string(),
    code: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

// ============================================================================
// 9. Realtime WebSocket Events
// ============================================================================

export const WsEventNames = {
    ROOM_SNAPSHOT: 'room.snapshot',
    PARTICIPANT_JOINED: 'participant.joined',
    PARTICIPANT_UPDATED: 'participant.updated',
    PREFERENCES_SUBMITTED: 'preferences.submitted',
    RANKING_STARTED: 'ranking.started',
    RECOMMENDATIONS_READY: 'recommendations.ready',
    VOTE_SUBMITTED: 'vote.submitted',
    ROOM_COMPLETED: 'room.completed',
    ROOM_ERROR: 'room.error',
} as const;

export const RoomSnapshotEventSchema = z.object({
    type: z.literal(WsEventNames.ROOM_SNAPSHOT),
    room: RoomSchema,
    participants: z.array(ParticipantSchema),
    recommendations: z.array(RankedMovieSchema).optional(),
    votes: z.array(VoteSchema).optional(),
});
export type RoomSnapshotEvent = z.infer<typeof RoomSnapshotEventSchema>;

export const ParticipantJoinedEventSchema = z.object({
    type: z.literal(WsEventNames.PARTICIPANT_JOINED),
    participant: ParticipantSchema,
});
export type ParticipantJoinedEvent = z.infer<
    typeof ParticipantJoinedEventSchema
>;

export const ParticipantUpdatedEventSchema = z.object({
    type: z.literal(WsEventNames.PARTICIPANT_UPDATED),
    participant: ParticipantSchema,
});
export type ParticipantUpdatedEvent = z.infer<
    typeof ParticipantUpdatedEventSchema
>;

export const PreferencesSubmittedEventSchema = z.object({
    type: z.literal(WsEventNames.PREFERENCES_SUBMITTED),
    participantId: z.string().uuid(),
    submittedCount: z.number().int(),
    totalParticipants: z.number().int(),
});
export type PreferencesSubmittedEvent = z.infer<
    typeof PreferencesSubmittedEventSchema
>;

export const RankingStartedEventSchema = z.object({
    type: z.literal(WsEventNames.RANKING_STARTED),
    roomId: z.string().uuid(),
});
export type RankingStartedEvent = z.infer<typeof RankingStartedEventSchema>;

export const RecommendationsReadyEventSchema = z.object({
    type: z.literal(WsEventNames.RECOMMENDATIONS_READY),
    result: RecommendationResultSchema,
});
export type RecommendationsReadyEvent = z.infer<
    typeof RecommendationsReadyEventSchema
>;

export const VoteSubmittedEventSchema = z.object({
    type: z.literal(WsEventNames.VOTE_SUBMITTED),
    vote: VoteSchema,
    votesCount: z.number().int(),
    totalParticipants: z.number().int(),
});
export type VoteSubmittedEvent = z.infer<typeof VoteSubmittedEventSchema>;

export const RoomCompletedEventSchema = z.object({
    type: z.literal(WsEventNames.ROOM_COMPLETED),
    roomId: z.string().uuid(),
    winningMovie: MovieSchema,
    votes: z.array(VoteSchema),
});
export type RoomCompletedEvent = z.infer<typeof RoomCompletedEventSchema>;

export const RoomErrorEventSchema = z.object({
    type: z.literal(WsEventNames.ROOM_ERROR),
    message: z.string(),
    code: z.string().optional(),
});
export type RoomErrorEvent = z.infer<typeof RoomErrorEventSchema>;

export const WsServerEventSchema = z.discriminatedUnion('type', [
    RoomSnapshotEventSchema,
    ParticipantJoinedEventSchema,
    ParticipantUpdatedEventSchema,
    PreferencesSubmittedEventSchema,
    RankingStartedEventSchema,
    RecommendationsReadyEventSchema,
    VoteSubmittedEventSchema,
    RoomCompletedEventSchema,
    RoomErrorEventSchema,
]);
export type WsServerEvent = z.infer<typeof WsServerEventSchema>;
