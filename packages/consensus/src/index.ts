/**
 * @commonscene/consensus — Deterministic Group Recommendation Engine.
 *
 * Implements the consensus scoring formula and hard-constraint verification
 * mandated by AGENTS.md:
 *
 *   Score(m) = 0.45 * Avg(m) + 0.35 * Min(m) + 0.20 * Coverage(m) - Penalty(m)
 *
 * Rules:
 * 1. Hard constraints strictly filter out ineligible movies before scoring.
 * 2. Component scores are normalized to [0, 1].
 * 3. Ties are broken deterministically by catalog ID.
 * 4. Never calls an external LLM for authoritative ranking.
 */

import {
    type Movie,
    type PreferenceProfile,
    type RankedMovie,
    type ScoredComponentBreakdown,
    isRatingAllowed,
} from '@commonscene/contracts';

export const CONSENSUS_VERSION = '1.0.0';

/**
 * Weights for the deterministic consensus scoring formula.
 */
export const SCORING_WEIGHTS = {
    AVERAGE_SATISFACTION: 0.45,
    MINIMUM_SATISFACTION: 0.35,
    PREFERENCE_COVERAGE: 0.2,
} as const;

/**
 * Checks whether a single participant's hard constraints are violated by a movie.
 * Returns true if eligible, false if violated.
 */
export function isParticipantHardConstraintSatisfied(
    movie: Movie,
    profile: PreferenceProfile
): { eligible: boolean; reason?: string } {
    // 1. Runtime constraint
    if (
        profile.maximumRuntimeMinutes !== null &&
        profile.maximumRuntimeMinutes !== undefined
    ) {
        if (movie.runtimeMinutes > profile.maximumRuntimeMinutes) {
            return {
                eligible: false,
                reason: `Runtime (${movie.runtimeMinutes}m) exceeds participant limit (${profile.maximumRuntimeMinutes}m)`,
            };
        }
    }

    // 2. Content rating constraint
    if (profile.maximumContentRating) {
        if (!isRatingAllowed(movie.contentRating, profile.maximumContentRating)) {
            return {
                eligible: false,
                reason: `Content rating (${movie.contentRating}) exceeds maximum allowed (${profile.maximumContentRating})`,
            };
        }
    }

    // 3. Excluded genres constraint (case-insensitive)
    if (profile.excludedGenres.length > 0) {
        const movieGenresLower = movie.genres.map((g) => g.toLowerCase());
        for (const excluded of profile.excludedGenres) {
            if (movieGenresLower.includes(excluded.toLowerCase())) {
                return {
                    eligible: false,
                    reason: `Movie contains excluded genre: "${excluded}"`,
                };
            }
        }
    }

    // 4. Avoided content tags constraint (case-insensitive)
    if (profile.avoidContentTags.length > 0) {
        const movieTagsLower = movie.contentTags.map((t) => t.toLowerCase());
        for (const avoidTag of profile.avoidContentTags) {
            if (movieTagsLower.includes(avoidTag.toLowerCase())) {
                return {
                    eligible: false,
                    reason: `Movie contains avoided content tag: "${avoidTag}"`,
                };
            }
        }
    }

    return { eligible: true };
}

/**
 * Checks whether a movie is eligible across ALL participants in the room.
 */
export function isMovieEligible(
    movie: Movie,
    profiles: PreferenceProfile[]
): { eligible: boolean; reasons: string[] } {
    const reasons: string[] = [];
    for (const profile of profiles) {
        const check = isParticipantHardConstraintSatisfied(movie, profile);
        if (!check.eligible && check.reason) {
            reasons.push(`Participant ${profile.participantId}: ${check.reason}`);
        }
    }
    return { eligible: reasons.length === 0, reasons };
}

/**
 * Calculates a single participant's soft satisfaction score in range [0, 1].
 */
export function calculateParticipantSatisfaction(
    movie: Movie,
    profile: PreferenceProfile
): { satisfaction: number; matchedKeys: string[]; tradeoffs: string[] } {
    const matchedKeys: string[] = [];
    const tradeoffs: string[] = [];

    const totalPreferencesCount =
        profile.preferredGenres.length + profile.moods.length;

    // Neutral profile with no soft preferences gets 1.0 satisfaction
    if (totalPreferencesCount === 0) {
        return { satisfaction: 1.0, matchedKeys, tradeoffs };
    }

    const movieGenresLower = new Set(movie.genres.map((g) => g.toLowerCase()));
    const movieMoodsLower = new Set(movie.moods.map((m) => m.toLowerCase()));

    let matches = 0;

    for (const genre of profile.preferredGenres) {
        if (movieGenresLower.has(genre.toLowerCase())) {
            matches++;
            matchedKeys.push(`genre:${genre}`);
        } else {
            tradeoffs.push(`missing genre:${genre}`);
        }
    }

    for (const mood of profile.moods) {
        if (movieMoodsLower.has(mood.toLowerCase())) {
            matches++;
            matchedKeys.push(`mood:${mood}`);
        } else {
            tradeoffs.push(`missing mood:${mood}`);
        }
    }

    const rawSatisfaction = matches / totalPreferencesCount;
    const satisfaction = Math.max(0, Math.min(1, rawSatisfaction));

    return { satisfaction, matchedKeys, tradeoffs };
}

/**
 * Calculates preference coverage across the entire group in range [0, 1].
 */
export function calculateGroupPreferenceCoverage(
    movie: Movie,
    profiles: PreferenceProfile[]
): { coverage: number; allMatchedKeys: string[] } {
    const distinctRequestedGenres = new Set<string>();
    const distinctRequestedMoods = new Set<string>();

    for (const p of profiles) {
        for (const g of p.preferredGenres)
            distinctRequestedGenres.add(g.toLowerCase());
        for (const m of p.moods) distinctRequestedMoods.add(m.toLowerCase());
    }

    const totalDistinct =
        distinctRequestedGenres.size + distinctRequestedMoods.size;
    if (totalDistinct === 0) {
        return { coverage: 1.0, allMatchedKeys: [] };
    }

    const movieGenresLower = new Set(movie.genres.map((g) => g.toLowerCase()));
    const movieMoodsLower = new Set(movie.moods.map((m) => m.toLowerCase()));

    const matchedKeys: string[] = [];
    let matchedDistinct = 0;

    for (const genre of distinctRequestedGenres) {
        if (movieGenresLower.has(genre)) {
            matchedDistinct++;
            matchedKeys.push(`genre:${genre}`);
        }
    }

    for (const mood of distinctRequestedMoods) {
        if (movieMoodsLower.has(mood)) {
            matchedDistinct++;
            matchedKeys.push(`mood:${mood}`);
        }
    }

    const coverage = Math.max(0, Math.min(1, matchedDistinct / totalDistinct));
    return { coverage, allMatchedKeys: matchedKeys };
}

/**
 * Calculates non-fatal conflict penalties in range [0, 1].
 */
export function calculatePenalty(
    _movie: Movie,
    _profiles: PreferenceProfile[]
): number {
    return 0; // Baseline penalty is 0 unless soft penalties apply
}

/**
 * Computes deterministic score breakdown for an eligible movie.
 */
export function calculateMovieScoreBreakdown(
    movie: Movie,
    profiles: PreferenceProfile[]
): {
    score: number;
    breakdown: ScoredComponentBreakdown;
    matchedPreferenceKeys: string[];
    tradeoffs: string[];
} {
    if (profiles.length === 0) {
        return {
            score: 1.0,
            breakdown: {
                averageSatisfaction: 1.0,
                minimumSatisfaction: 1.0,
                preferenceCoverage: 1.0,
                penalty: 0,
            },
            matchedPreferenceKeys: [],
            tradeoffs: [],
        };
    }

    const satisfactions: number[] = [];
    const allMatchedKeys = new Set<string>();
    const allTradeoffs = new Set<string>();

    for (const p of profiles) {
        const res = calculateParticipantSatisfaction(movie, p);
        satisfactions.push(res.satisfaction);
        res.matchedKeys.forEach((k) => allMatchedKeys.add(k));
        res.tradeoffs.forEach((t) => allTradeoffs.add(t));
    }

    const avgSatisfaction =
        satisfactions.reduce((sum, s) => sum + s, 0) / satisfactions.length;
    const minSatisfaction = Math.min(...satisfactions);
    const { coverage } = calculateGroupPreferenceCoverage(movie, profiles);
    const penalty = calculatePenalty(movie, profiles);

    const rawScore =
        SCORING_WEIGHTS.AVERAGE_SATISFACTION * avgSatisfaction +
        SCORING_WEIGHTS.MINIMUM_SATISFACTION * minSatisfaction +
        SCORING_WEIGHTS.PREFERENCE_COVERAGE * coverage -
        penalty;

    const score = Math.max(0, Math.min(1, Number(rawScore.toFixed(4))));

    return {
        score,
        breakdown: {
            averageSatisfaction: Number(avgSatisfaction.toFixed(4)),
            minimumSatisfaction: Number(minSatisfaction.toFixed(4)),
            preferenceCoverage: Number(coverage.toFixed(4)),
            penalty,
        },
        matchedPreferenceKeys: Array.from(allMatchedKeys),
        tradeoffs: Array.from(allTradeoffs),
    };
}

/**
 * Generates a deterministic, natural English explanation from score data.
 */
export function generateDeterministicExplanation(
    movie: Movie,
    breakdown: ScoredComponentBreakdown,
    matchedKeys: string[],
    profilesCount: number
): string {
    const coveragePct = Math.round(breakdown.preferenceCoverage * 100);
    const avgPct = Math.round(breakdown.averageSatisfaction * 100);
    const minPct = Math.round(breakdown.minimumSatisfaction * 100);

    const genreMatches = matchedKeys
        .filter((k) => k.startsWith('genre:'))
        .map((k) => k.replace('genre:', ''));
    const moodMatches = matchedKeys
        .filter((k) => k.startsWith('mood:'))
        .map((k) => k.replace('mood:', ''));

    const highlights: string[] = [];
    if (genreMatches.length > 0) {
        highlights.push(`genres (${genreMatches.join(', ')})`);
    }
    if (moodMatches.length > 0) {
        highlights.push(`moods (${moodMatches.join(', ')})`);
    }

    const matchText =
        highlights.length > 0
            ? `Matches requested ${highlights.join(' and ')}.`
            : `Fits all group runtime and rating limits.`;

    if (profilesCount <= 1) {
        return `${matchText} Rated ${movie.contentRating} with a runtime of ${movie.runtimeMinutes} minutes.`;
    }

    return `Fair group consensus (${coveragePct}% preference coverage, ${avgPct}% average satisfaction, ${minPct}% minimum satisfaction). ${matchText}`;
}

/**
 * Authoritative ranking function.
 * Filters ineligible movies, scores eligible candidates, and breaks ties by catalog ID.
 */
export function rankMovies(
    catalog: Movie[],
    profiles: PreferenceProfile[]
): RankedMovie[] {
    const eligibleRanked: RankedMovie[] = [];

    for (const movie of catalog) {
        const eligibility = isMovieEligible(movie, profiles);
        if (!eligibility.eligible) {
            continue; // Excluded by hard constraint
        }

        const scored = calculateMovieScoreBreakdown(movie, profiles);
        const explanation = generateDeterministicExplanation(
            movie,
            scored.breakdown,
            scored.matchedPreferenceKeys,
            profiles.length
        );

        eligibleRanked.push({
            movieId: movie.id,
            score: scored.score,
            averageSatisfaction: scored.breakdown.averageSatisfaction,
            minimumSatisfaction: scored.breakdown.minimumSatisfaction,
            preferenceCoverage: scored.breakdown.preferenceCoverage,
            penalty: scored.breakdown.penalty,
            matchedPreferenceKeys: scored.matchedPreferenceKeys,
            tradeoffs: scored.tradeoffs,
            explanation,
        });
    }

    // Sort descending by score; break ties stably by movieId ascending
    eligibleRanked.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.movieId.localeCompare(b.movieId);
    });

    return eligibleRanked;
}
