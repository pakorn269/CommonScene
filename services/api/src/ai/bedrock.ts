/**
 * Amazon Bedrock AI Integration Layer.
 *
 * Provides AI-enhanced free-text preference parsing and natural language
 * consensus explanations while adhering strictly to AGENTS.md rules:
 *
 * 1. Hard constraints are NEVER overridden by AI.
 * 2. Bedrock never calculates authoritative ranking scores or invents catalog movies.
 * 3. All model responses are strictly validated with Zod.
 * 4. Automatic zero-error fallback to deterministic templates when AWS/Bedrock is offline.
 * 5. Bedrock calls remain strictly server-side.
 */

import {
    BedrockRuntimeClient,
    ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';
import {
    type Movie,
    type PreferenceProfile,
    type RankedMovie,
} from '@commonscene/contracts';
import { generateDeterministicExplanation } from '@commonscene/consensus';
import {
    BedrockExplanationSchema,
    BedrockGroupSummarySchema,
    BedrockPreferenceParseSchema,
    type BedrockParsedPreferences,
} from './types.js';

export interface BedrockServiceOptions {
    client?: BedrockRuntimeClient;
    modelId?: string;
    region?: string;
    enabled?: boolean;
}

export class BedrockService {
    private client: BedrockRuntimeClient | null = null;
    private modelId: string;
    private enabled: boolean;

    constructor(options: BedrockServiceOptions = {}) {
        this.modelId =
            options.modelId ||
            process.env['BEDROCK_MODEL_ID'] ||
            'anthropic.claude-3-5-sonnet-20241022-v2:0';

        const envEnabled =
            process.env['BEDROCK_ENABLED'] === 'true' ||
            (process.env['ENABLE_BEDROCK'] !== undefined &&
                process.env['ENABLE_BEDROCK'] !== 'false');

        this.enabled = options.enabled ?? envEnabled;

        if (this.enabled) {
            if (options.client) {
                this.client = options.client;
            } else {
                try {
                    const region =
                        options.region || process.env['AWS_REGION'] || 'us-east-1';
                    this.client = new BedrockRuntimeClient({ region });
                } catch {
                    this.client = null;
                }
            }
        }
    }

    /**
     * Checks if Bedrock service is initialized and enabled.
     */
    public isAvailable(): boolean {
        return this.enabled && this.client !== null;
    }

    /**
     * Parses free-text user preferences into structured candidate values using Amazon Bedrock.
     * Returns null if Bedrock is unavailable, unconfigured, or output fails Zod validation.
     */
    public async parseFreeTextPreferences(
        freeText: string
    ): Promise<BedrockParsedPreferences | null> {
        if (!this.isAvailable() || !this.client || !freeText || freeText.trim().length === 0) {
            return null;
        }

        try {
            const prompt = `You are a movie recommendation assistant. Convert the following natural language user movie preference into structured JSON.

User input: "${freeText}"

Extract preferences adhering strictly to this JSON format:
{
  "preferredGenres": ["genre1", "genre2"],
  "excludedGenres": ["genre3"],
  "moods": ["mood1"],
  "maximumRuntimeMinutes": 120,
  "maximumContentRating": "PG-13",
  "avoidContentTags": ["tag1"]
}

Rules:
- Standard genres: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, Horror, Mystery, Romance, Sci-Fi, Thriller.
- Standard ratings: G, PG, PG-13, R.
- Output ONLY raw JSON without markdown fences, explanation, or commentary.`;

            const command = new ConverseCommand({
                modelId: this.modelId,
                messages: [
                    {
                        role: 'user',
                        content: [{ text: prompt }],
                    },
                ],
                inferenceConfig: {
                    maxTokens: 500,
                    temperature: 0.1,
                },
            });

            const response = await this.client.send(command);
            const rawText =
                response.output?.message?.content?.[0]?.text?.trim();

            if (!rawText) {
                return null;
            }

            const jsonStr = rawText
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();

            const parsedJson: unknown = JSON.parse(jsonStr);
            const validationResult =
                BedrockPreferenceParseSchema.safeParse(parsedJson);

            if (validationResult.success) {
                return validationResult.data;
            } else {
                return null;
            }
        } catch {
            // Graceful fallback per AGENTS.md: log non-sensitive error and ignore AI interpretation
            return null;
        }
    }

    /**
     * Generates a natural English consensus explanation from verified score data using Bedrock.
     * Automatically falls back to deterministic template explanation if Bedrock fails or is unavailable.
     */
    public async explainRecommendation(
        movie: Movie,
        score: RankedMovie,
        profiles: PreferenceProfile[]
    ): Promise<string> {
        const fallbackExplanation = generateDeterministicExplanation(
            movie,
            {
                averageSatisfaction: score.averageSatisfaction,
                minimumSatisfaction: score.minimumSatisfaction,
                preferenceCoverage: score.preferenceCoverage,
                penalty: score.penalty,
            },
            score.matchedPreferenceKeys,
            profiles.length
        );

        if (!this.isAvailable() || !this.client) {
            return fallbackExplanation;
        }

        try {
            const prompt = `You are an AI assistant for CommonScene, a Fire TV group movie recommendation app.
Generate a friendly, 1-2 sentence group consensus explanation for why the movie "${movie.title}" was recommended.

Verified Score Data:
- Title: "${movie.title}"
- Synopsis: "${movie.synopsis}"
- Rating: ${movie.contentRating}
- Runtime: ${movie.runtimeMinutes} minutes
- Genres: ${movie.genres.join(', ')}
- Moods: ${movie.moods.join(', ')}
- Overall Match Score: ${Math.round(score.score * 100)}%
- Preference Coverage: ${Math.round(score.preferenceCoverage * 100)}%
- Average Satisfaction: ${Math.round(score.averageSatisfaction * 100)}%
- Lowest Satisfaction (Fairness): ${Math.round(score.minimumSatisfaction * 100)}%
- Matched Elements: ${score.matchedPreferenceKeys.join(', ') || 'Fits runtime & rating limits'}
- Tradeoffs: ${score.tradeoffs.join(', ') || 'None'}
- Group Size: ${profiles.length} viewers

Output strictly in JSON format:
{
  "explanation": "Friendly, conversational 1-2 sentence explanation explaining why the group will enjoy this film.",
  "groupHighlight": "Short 1-sentence highlight of how it balances different tastes."
}

Rules:
- Ground your explanation strictly in the verified score data above.
- Do NOT make up unsupported movie facts or claim streaming platform availability.
- Output ONLY raw JSON without markdown fences.`;

            const command = new ConverseCommand({
                modelId: this.modelId,
                messages: [
                    {
                        role: 'user',
                        content: [{ text: prompt }],
                    },
                ],
                inferenceConfig: {
                    maxTokens: 300,
                    temperature: 0.3,
                },
            });

            const response = await this.client.send(command);
            const rawText =
                response.output?.message?.content?.[0]?.text?.trim();

            if (!rawText) {
                return fallbackExplanation;
            }

            const jsonStr = rawText
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();

            const parsedJson: unknown = JSON.parse(jsonStr);
            const validationResult =
                BedrockExplanationSchema.safeParse(parsedJson);

            if (
                validationResult.success &&
                validationResult.data.explanation.trim().length > 0
            ) {
                return validationResult.data.explanation.trim();
            }

            return fallbackExplanation;
        } catch {
            return fallbackExplanation;
        }
    }

    /**
     * Generates a group summary describing overall consensus.
     */
    public async generateGroupSummary(
        profiles: PreferenceProfile[],
        topMovie: Movie
    ): Promise<string> {
        const fallbackSummary = `Group consensus reached for ${profiles.length} viewer${profiles.length === 1 ? '' : 's'} with ${topMovie.title} (${topMovie.genres.join(', ')}).`;

        if (!this.isAvailable() || !this.client) {
            return fallbackSummary;
        }

        try {
            const prompt = `Summarize in 1 sentence how a group of ${profiles.length} viewers found common ground with the movie "${topMovie.title}" (${topMovie.genres.join(', ')}).

Output strictly in JSON:
{
  "summary": "1 sentence summarizing group consensus."
}
Output ONLY raw JSON.`;

            const command = new ConverseCommand({
                modelId: this.modelId,
                messages: [
                    {
                        role: 'user',
                        content: [{ text: prompt }],
                    },
                ],
                inferenceConfig: {
                    maxTokens: 200,
                    temperature: 0.3,
                },
            });

            const response = await this.client.send(command);
            const rawText =
                response.output?.message?.content?.[0]?.text?.trim();

            if (!rawText) return fallbackSummary;

            const jsonStr = rawText
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();

            const parsedJson: unknown = JSON.parse(jsonStr);
            const validation = BedrockGroupSummarySchema.safeParse(parsedJson);

            if (validation.success && validation.data.summary.trim().length > 0) {
                return validation.data.summary.trim();
            }

            return fallbackSummary;
        } catch {
            return fallbackSummary;
        }
    }
}

export const defaultBedrockService = new BedrockService();
