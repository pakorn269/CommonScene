import { describe, expect, it, vi } from 'vitest';
import type { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { type Movie, type PreferenceProfile, type RankedMovie } from '@commonscene/contracts';
import { BedrockService } from './bedrock.js';
import {
    BedrockExplanationSchema,
    BedrockGroupSummarySchema,
    BedrockPreferenceParseSchema,
} from './types.js';

const mockMovie: Movie = {
    id: 'fictional-001',
    title: 'The Clockwork Bakery',
    synopsis: 'A quirky inventor opens a bakery run by mechanical mice.',
    runtimeMinutes: 98,
    releaseYear: 2024,
    genres: ['Comedy', 'Family', 'Fantasy'],
    moods: ['Lighthearted', 'Heartwarming', 'Feel-Good'],
    contentRating: 'PG',
    contentTags: ['Mild Slapstick'],
    artworkKey: 'art/clockwork-bakery.webp',
};

const mockScore: RankedMovie = {
    movieId: 'fictional-001',
    score: 0.88,
    averageSatisfaction: 0.85,
    minimumSatisfaction: 0.75,
    preferenceCoverage: 0.9,
    penalty: 0,
    matchedPreferenceKeys: ['genre:Comedy', 'mood:Lighthearted'],
    tradeoffs: [],
    explanation: 'Deterministic base explanation',
};

const mockProfiles: PreferenceProfile[] = [
    {
        participantId: 'user-1',
        preferredGenres: ['Comedy', 'Family'],
        excludedGenres: ['Horror'],
        moods: ['Lighthearted'],
        maximumRuntimeMinutes: 110,
        maximumContentRating: 'PG-13',
        avoidContentTags: [],
        freeText: 'Looking for a funny family movie',
    },
    {
        participantId: 'user-2',
        preferredGenres: ['Fantasy', 'Adventure'],
        excludedGenres: [],
        moods: ['Feel-Good'],
        maximumRuntimeMinutes: 120,
        maximumContentRating: 'PG',
        avoidContentTags: [],
        freeText: null,
    },
];

describe('Bedrock AI Zod Schemas', () => {
    it('validates structured preference JSON with defaults', () => {
        const raw = {
            preferredGenres: ['Comedy', 'Adventure'],
            excludedGenres: ['Horror'],
            moods: ['Lighthearted'],
            maximumRuntimeMinutes: 105,
            avoidContentTags: ['violence'],
        };
        const res = BedrockPreferenceParseSchema.safeParse(raw);
        expect(res.success).toBe(true);
        if (res.success) {
            expect(res.data.preferredGenres).toEqual(['Comedy', 'Adventure']);
            expect(res.data.maximumRuntimeMinutes).toBe(105);
            expect(res.data.maximumContentRating).toBeNull();
        }
    });

    it('rejects invalid preference parse data', () => {
        const invalid = {
            preferredGenres: 'not-an-array',
        };
        const res = BedrockPreferenceParseSchema.safeParse(invalid);
        expect(res.success).toBe(false);
    });

    it('validates explanation schema', () => {
        const valid = {
            explanation: 'A delightful consensus pick that pleases everyone in the room.',
            groupHighlight: 'Balances humor and whimsical adventure.',
        };
        const res = BedrockExplanationSchema.safeParse(valid);
        expect(res.success).toBe(true);
    });

    it('validates group summary schema', () => {
        const valid = {
            summary: 'Everyone found common ground with this lighthearted comedy.',
        };
        const res = BedrockGroupSummarySchema.safeParse(valid);
        expect(res.success).toBe(true);
    });
});

describe('BedrockService Offline & Fallback Behavior', () => {
    it('returns null for free-text parsing when Bedrock is disabled', async () => {
        const service = new BedrockService({ enabled: false });
        expect(service.isAvailable()).toBe(false);

        const result = await service.parseFreeTextPreferences('I want a funny movie');
        expect(result).toBeNull();
    });

    it('falls back to deterministic explanation when Bedrock is disabled', async () => {
        const service = new BedrockService({ enabled: false });
        const explanation = await service.explainRecommendation(
            mockMovie,
            mockScore,
            mockProfiles
        );
        expect(explanation).toBeDefined();
        expect(explanation).toContain('Fair group consensus');
        expect(explanation).toContain('genres (Comedy)');
    });

    it('falls back to template group summary when Bedrock is disabled', async () => {
        const service = new BedrockService({ enabled: false });
        const summary = await service.generateGroupSummary(mockProfiles, mockMovie);
        expect(summary).toContain('The Clockwork Bakery');
        expect(summary).toContain('2 viewers');
    });
});

describe('BedrockService with Mocked Bedrock Client', () => {
    it('successfully parses free text when Bedrock returns valid JSON', async () => {
        const mockClient = {
            send: vi.fn().mockResolvedValue({
                output: {
                    message: {
                        content: [
                            {
                                text: JSON.stringify({
                                    preferredGenres: ['Comedy', 'Family'],
                                    excludedGenres: ['Horror'],
                                    moods: ['Lighthearted'],
                                    maximumRuntimeMinutes: 100,
                                    maximumContentRating: 'PG',
                                    avoidContentTags: ['scary'],
                                }),
                            },
                        ],
                    },
                },
            }),
        } as unknown as BedrockRuntimeClient;

        const service = new BedrockService({ client: mockClient, enabled: true });
        const result = await service.parseFreeTextPreferences(
            'We want a fun family comedy under 100 mins with no horror'
        );

        expect(result).not.toBeNull();
        expect(result?.preferredGenres).toContain('Comedy');
        expect(result?.maximumRuntimeMinutes).toBe(100);
        expect(result?.excludedGenres).toContain('Horror');
    });

    it('gracefully handles markdown code fences in Bedrock response', async () => {
        const mockClient = {
            send: vi.fn().mockResolvedValue({
                output: {
                    message: {
                        content: [
                            {
                                text: '```json\n{\n  "preferredGenres": ["Animation"],\n  "excludedGenres": [],\n  "moods": ["Inspiring"],\n  "maximumRuntimeMinutes": null,\n  "maximumContentRating": null,\n  "avoidContentTags": []\n}\n```',
                            },
                        ],
                    },
                },
            }),
        } as unknown as BedrockRuntimeClient;

        const service = new BedrockService({ client: mockClient, enabled: true });
        const result = await service.parseFreeTextPreferences('Inspiring animated film');

        expect(result).not.toBeNull();
        expect(result?.preferredGenres).toEqual(['Animation']);
        expect(result?.moods).toEqual(['Inspiring']);
    });

    it('falls back to null when Bedrock returns unparseable JSON', async () => {
        const mockClient = {
            send: vi.fn().mockResolvedValue({
                output: {
                    message: {
                        content: [{ text: 'Sorry, I cannot process this request.' }],
                    },
                },
            }),
        } as unknown as BedrockRuntimeClient;

        const service = new BedrockService({ client: mockClient, enabled: true });
        const result = await service.parseFreeTextPreferences('gibberish text');
        expect(result).toBeNull();
    });

    it('falls back to deterministic explanation when Bedrock client throws error', async () => {
        const mockClient = {
            send: vi.fn().mockRejectedValue(new Error('ThrottlingException: Rate limit exceeded')),
        } as unknown as BedrockRuntimeClient;

        const service = new BedrockService({ client: mockClient, enabled: true });
        const explanation = await service.explainRecommendation(
            mockMovie,
            mockScore,
            mockProfiles
        );

        expect(explanation).toBeDefined();
        expect(explanation).toContain('Fair group consensus');
    });

    it('returns natural AI explanation when Bedrock responds successfully', async () => {
        const aiExplanation =
            'The Clockwork Bakery strikes the perfect balance between lighthearted family humor and charming fantasy whimsy for your movie night.';

        const mockClient = {
            send: vi.fn().mockResolvedValue({
                output: {
                    message: {
                        content: [
                            {
                                text: JSON.stringify({
                                    explanation: aiExplanation,
                                    groupHighlight: 'Satisfies comedy and fantasy preferences equally.',
                                }),
                            },
                        ],
                    },
                },
            }),
        } as unknown as BedrockRuntimeClient;

        const service = new BedrockService({ client: mockClient, enabled: true });
        const explanation = await service.explainRecommendation(
            mockMovie,
            mockScore,
            mockProfiles
        );

        expect(explanation).toBe(aiExplanation);
    });
});
