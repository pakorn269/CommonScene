/**
 * @commonscene/test-fixtures — Standardized Test Rooms, Participants, and Preference Profiles.
 *
 * Used across consensus unit tests, API tests, and UI demo modes to ensure deterministic verification.
 */

import type {
    Room,
    Participant,
    PreferenceProfile,
} from '@commonscene/contracts';

export const SAMPLE_ROOM_ID = '11111111-1111-4111-8111-111111111111';
export const SAMPLE_ROOM_CODE = 'ROOM';

export const PARTICIPANT_ALICE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export const PARTICIPANT_BOB_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
export const PARTICIPANT_CHARLIE_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

export const SAMPLE_PARTICIPANT_ALICE: Participant = {
    id: PARTICIPANT_ALICE_ID,
    roomId: SAMPLE_ROOM_ID,
    displayName: 'Alice',
    avatarId: 'avatar-1',
    isHost: true,
    hasSubmittedPreferences: true,
    joinedAt: '2026-09-02T12:00:00.000Z',
};

export const SAMPLE_PARTICIPANT_BOB: Participant = {
    id: PARTICIPANT_BOB_ID,
    roomId: SAMPLE_ROOM_ID,
    displayName: 'Bob',
    avatarId: 'avatar-2',
    isHost: false,
    hasSubmittedPreferences: true,
    joinedAt: '2026-09-02T12:01:00.000Z',
};

export const SAMPLE_PARTICIPANT_CHARLIE: Participant = {
    id: PARTICIPANT_CHARLIE_ID,
    roomId: SAMPLE_ROOM_ID,
    displayName: 'Charlie',
    avatarId: 'avatar-3',
    isHost: false,
    hasSubmittedPreferences: true,
    joinedAt: '2026-09-02T12:02:00.000Z',
};

export const SAMPLE_PARTICIPANTS: Participant[] = [
    SAMPLE_PARTICIPANT_ALICE,
    SAMPLE_PARTICIPANT_BOB,
    SAMPLE_PARTICIPANT_CHARLIE,
];

/** Alice: Wants lighthearted family/comedy, runtime under 100m, max PG rating. */
export const PROFILE_ALICE: PreferenceProfile = {
    participantId: PARTICIPANT_ALICE_ID,
    preferredGenres: ['Family', 'Comedy'],
    excludedGenres: ['Horror'],
    moods: ['lighthearted', 'heartwarming'],
    maximumRuntimeMinutes: 100,
    maximumContentRating: 'PG',
    avoidContentTags: ['jump scares', 'gore'],
    freeText: 'Something fun we can all smile at under 100 minutes',
};

/** Bob: Wants thrilling Sci-Fi/Adventure/Fantasy, up to 135m, max PG-13. */
export const PROFILE_BOB: PreferenceProfile = {
    participantId: PARTICIPANT_BOB_ID,
    preferredGenres: ['Sci-Fi', 'Adventure', 'Fantasy'],
    excludedGenres: [],
    moods: ['thrilling', 'epic', 'whimsical'],
    maximumRuntimeMinutes: 135,
    maximumContentRating: 'PG-13',
    avoidContentTags: [],
    freeText: 'Epic sci-fi or fantasy adventure',
};

/** Charlie: Wants Animation/Family/Musical, relaxed & whimsical, max PG rating. */
export const PROFILE_CHARLIE: PreferenceProfile = {
    participantId: PARTICIPANT_CHARLIE_ID,
    preferredGenres: ['Animation', 'Family', 'Musical', 'Comedy'],
    excludedGenres: ['Horror', 'Thriller'],
    moods: ['joyful', 'whimsical', 'uplifting'],
    maximumRuntimeMinutes: 120,
    maximumContentRating: 'PG',
    avoidContentTags: ['scary scenes', 'dark secrets'],
    freeText: 'Cheerful animation or musical story',
};

export const SAMPLE_PROFILES: PreferenceProfile[] = [
    PROFILE_ALICE,
    PROFILE_BOB,
    PROFILE_CHARLIE,
];

/** Edge Case: Single participant with empty preferences */
export const EMPTY_PROFILE: PreferenceProfile = {
    participantId: PARTICIPANT_ALICE_ID,
    preferredGenres: [],
    excludedGenres: [],
    moods: [],
    maximumRuntimeMinutes: null,
    maximumContentRating: null,
    avoidContentTags: [],
    freeText: null,
};

/** Edge Case: Impossible runtime (no movie in catalog is under 60 minutes) */
export const IMPOSSIBLE_RUNTIME_PROFILE: PreferenceProfile = {
    participantId: PARTICIPANT_ALICE_ID,
    preferredGenres: ['Family'],
    excludedGenres: [],
    moods: [],
    maximumRuntimeMinutes: 45,
    maximumContentRating: null,
    avoidContentTags: [],
    freeText: 'Under 45 mins',
};

/** Standard Room in Lobby stage */
export const SAMPLE_ROOM_LOBBY: Room = {
    id: SAMPLE_ROOM_ID,
    code: SAMPLE_ROOM_CODE,
    status: 'lobby',
    hostParticipantId: PARTICIPANT_ALICE_ID,
    participantIds: [PARTICIPANT_ALICE_ID],
    candidateMovieIds: [],
    winningMovieId: null,
    createdAt: '2026-09-02T12:00:00.000Z',
    expiresAt: '2026-09-02T14:00:00.000Z',
};

/** Standard Room in Collecting Preferences stage */
export const SAMPLE_ROOM_COLLECTING: Room = {
    ...SAMPLE_ROOM_LOBBY,
    status: 'collecting_preferences',
    participantIds: [
        PARTICIPANT_ALICE_ID,
        PARTICIPANT_BOB_ID,
        PARTICIPANT_CHARLIE_ID,
    ],
};
