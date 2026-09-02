/**
 * @commonscene/api — In-Memory Room Repository.
 *
 * Implements the session store, automatic code generation, participant management,
 * and state transitions governed by AGENTS.md.
 */

import { randomUUID } from 'node:crypto';
import type {
    Room,
    RoomStatus,
    Participant,
    PreferenceProfile,
    RecommendationResult,
    RankedMovie,
    Vote,
    Movie,
} from '@commonscene/contracts';
import { getMovieById } from '@commonscene/catalog';

// Unambiguous alphabet for 4-character room codes (excludes O, 0, I, 1)
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(): string {
    let code = '';
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * ROOM_CODE_ALPHABET.length);
        code += ROOM_CODE_ALPHABET[randomIndex];
    }
    return code;
}

export class InMemoryRoomRepository {
    private roomsByCode = new Map<string, Room>();
    private roomsById = new Map<string, Room>();
    private participantsByRoomId = new Map<string, Participant[]>();
    private preferencesByParticipantId = new Map<string, PreferenceProfile>();
    private recommendationsByRoomId = new Map<string, RecommendationResult>();
    private votesByRoomId = new Map<string, Vote[]>();

    /**
     * Creates a new room with host participant and returns both.
     */
    createRoom(
        hostDisplayName = 'Host',
        hostAvatarId = 'avatar-1'
    ): { room: Room; hostParticipant: Participant } {
        let code = generateRoomCode();
        while (this.roomsByCode.has(code)) {
            code = generateRoomCode();
        }

        const roomId = randomUUID();
        const hostId = randomUUID();
        const now = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours TTL

        const room: Room = {
            id: roomId,
            code,
            status: 'lobby',
            hostParticipantId: hostId,
            participantIds: [hostId],
            candidateMovieIds: [],
            winningMovieId: null,
            createdAt: now,
            expiresAt,
        };

        const hostParticipant: Participant = {
            id: hostId,
            roomId,
            displayName: hostDisplayName.trim(),
            avatarId: hostAvatarId,
            isHost: true,
            hasSubmittedPreferences: false,
            joinedAt: now,
        };

        this.roomsByCode.set(code, room);
        this.roomsById.set(roomId, room);
        this.participantsByRoomId.set(roomId, [hostParticipant]);
        this.votesByRoomId.set(roomId, []);

        return { room, hostParticipant };
    }

    /**
     * Retrieves a room by its normalized 4-character code.
     */
    getRoomByCode(code: string): Room | undefined {
        const normalized = code.trim().toUpperCase();
        return this.roomsByCode.get(normalized);
    }

    /**
     * Retrieves a room by its UUID.
     */
    getRoomById(id: string): Room | undefined {
        return this.roomsById.get(id);
    }

    /**
     * Retrieves all participants in a room.
     */
    getParticipants(roomId: string): Participant[] {
        return this.participantsByRoomId.get(roomId) ?? [];
    }

    /**
     * Retrieves a single participant in a room.
     */
    getParticipant(
        roomId: string,
        participantId: string
    ): Participant | undefined {
        const list = this.getParticipants(roomId);
        return list.find((p) => p.id === participantId);
    }

    /**
     * Adds a participant to an existing room in lobby or collecting_preferences status.
     */
    addParticipant(
        roomCode: string,
        displayName: string,
        avatarId = 'avatar-2'
    ): { room: Room; participant: Participant; participants: Participant[] } {
        const room = this.getRoomByCode(roomCode);
        if (!room) {
            throw new Error(`Room with code "${roomCode}" not found.`);
        }

        if (room.status === 'complete' || room.status === 'expired') {
            throw new Error(`Cannot join room in status "${room.status}".`);
        }

        const trimmedName = displayName.trim();
        const existingParticipants = this.getParticipants(room.id);

        // Disallow duplicate display names
        const nameCollision = existingParticipants.some(
            (p) => p.displayName.toLowerCase() === trimmedName.toLowerCase()
        );
        if (nameCollision) {
            throw new Error(
                `A participant named "${trimmedName}" is already in this room.`
            );
        }

        const participantId = randomUUID();
        const now = new Date().toISOString();

        const participant: Participant = {
            id: participantId,
            roomId: room.id,
            displayName: trimmedName,
            avatarId,
            isHost: false,
            hasSubmittedPreferences: false,
            joinedAt: now,
        };

        const updatedParticipants = [...existingParticipants, participant];
        this.participantsByRoomId.set(room.id, updatedParticipants);

        const updatedRoom: Room = {
            ...room,
            participantIds: updatedParticipants.map((p) => p.id),
        };
        this.roomsByCode.set(room.code, updatedRoom);
        this.roomsById.set(room.id, updatedRoom);

        return {
            room: updatedRoom,
            participant,
            participants: updatedParticipants,
        };
    }

    /**
     * Submits or updates a participant's preferences.
     */
    submitPreferences(
        roomCode: string,
        participantId: string,
        preferences: Omit<PreferenceProfile, 'participantId'>
    ): {
        profile: PreferenceProfile;
        room: Room;
        submittedCount: number;
        totalParticipants: number;
    } {
        const room = this.getRoomByCode(roomCode);
        if (!room) {
            throw new Error(`Room with code "${roomCode}" not found.`);
        }

        const participants = this.getParticipants(room.id);
        const participant = participants.find((p) => p.id === participantId);
        if (!participant) {
            throw new Error(`Participant "${participantId}" not found in room.`);
        }

        const profile: PreferenceProfile = {
            ...preferences,
            participantId,
        };
        this.preferencesByParticipantId.set(participantId, profile);

        // Mark participant submitted
        const updatedParticipants = participants.map((p) =>
            p.id === participantId ? { ...p, hasSubmittedPreferences: true } : p
        );
        this.participantsByRoomId.set(room.id, updatedParticipants);

        // Advance status from lobby to collecting_preferences if needed
        let updatedStatus: RoomStatus = room.status;
        if (room.status === 'lobby') {
            updatedStatus = 'collecting_preferences';
        }

        const updatedRoom: Room = {
            ...room,
            status: updatedStatus,
        };
        this.roomsByCode.set(room.code, updatedRoom);
        this.roomsById.set(room.id, updatedRoom);

        const submittedCount = updatedParticipants.filter(
            (p) => p.hasSubmittedPreferences
        ).length;

        return {
            profile,
            room: updatedRoom,
            submittedCount,
            totalParticipants: updatedParticipants.length,
        };
    }

    /**
     * Retrieves all submitted preference profiles for a room.
     */
    getPreferences(roomId: string): PreferenceProfile[] {
        const participants = this.getParticipants(roomId);
        const profiles: PreferenceProfile[] = [];
        for (const p of participants) {
            const prof = this.preferencesByParticipantId.get(p.id);
            if (prof) {
                profiles.push(prof);
            }
        }
        return profiles;
    }

    /**
     * Stores recommendations and transitions room to voting status.
     */
    setRecommendations(
        roomCode: string,
        recommendations: RankedMovie[],
        groupSummary: string,
        usedBedrock = false
    ): RecommendationResult {
        const room = this.getRoomByCode(roomCode);
        if (!room) {
            throw new Error(`Room with code "${roomCode}" not found.`);
        }

        const result: RecommendationResult = {
            roomId: room.id,
            recommendations,
            groupSummary,
            calculatedAt: new Date().toISOString(),
            usedBedrock,
        };

        this.recommendationsByRoomId.set(room.id, result);

        const updatedRoom: Room = {
            ...room,
            status: 'voting',
            candidateMovieIds: recommendations.map((r) => r.movieId),
        };
        this.roomsByCode.set(room.code, updatedRoom);
        this.roomsById.set(room.id, updatedRoom);

        return result;
    }

    /**
     * Retrieves recommendations for a room.
     */
    getRecommendations(roomId: string): RecommendationResult | undefined {
        return this.recommendationsByRoomId.get(roomId);
    }

    /**
     * Records a participant's vote on candidate movies.
     */
    submitVote(
        roomCode: string,
        participantId: string,
        movieId: string,
        rank = 1
    ): { vote: Vote; votesCount: number; totalParticipants: number } {
        const room = this.getRoomByCode(roomCode);
        if (!room) {
            throw new Error(`Room with code "${roomCode}" not found.`);
        }

        const participants = this.getParticipants(room.id);
        const participant = participants.find((p) => p.id === participantId);
        if (!participant) {
            throw new Error(`Participant "${participantId}" not found.`);
        }

        const vote: Vote = {
            participantId,
            movieId,
            rank,
            votedAt: new Date().toISOString(),
        };

        const existingVotes = this.votesByRoomId.get(room.id) ?? [];
        // Replace existing vote for this participant
        const updatedVotes = [
            ...existingVotes.filter((v) => v.participantId !== participantId),
            vote,
        ];
        this.votesByRoomId.set(room.id, updatedVotes);

        return {
            vote,
            votesCount: updatedVotes.length,
            totalParticipants: participants.length,
        };
    }

    /**
     * Retrieves all recorded votes for a room.
     */
    getVotes(roomId: string): Vote[] {
        return this.votesByRoomId.get(roomId) ?? [];
    }

    /**
     * Finalizes the winning movie and marks room as complete.
     */
    finalizeWinner(
        roomCode: string,
        winningMovieId: string
    ): { room: Room; winningMovie: Movie; votes: Vote[] } {
        const room = this.getRoomByCode(roomCode);
        if (!room) {
            throw new Error(`Room with code "${roomCode}" not found.`);
        }

        const winningMovie = getMovieById(winningMovieId);
        if (!winningMovie) {
            throw new Error(`Movie with ID "${winningMovieId}" not found in catalog.`);
        }

        const updatedRoom: Room = {
            ...room,
            status: 'complete',
            winningMovieId,
        };
        this.roomsByCode.set(room.code, updatedRoom);
        this.roomsById.set(room.id, updatedRoom);

        const votes = this.getVotes(room.id);

        return { room: updatedRoom, winningMovie, votes };
    }
}
