import { describe, it, expect } from 'vitest';
import {
  rankMovies,
  calculateParticipantSatisfaction,
  calculateGroupPreferenceCoverage,
  calculateMovieScoreBreakdown,
  generateDeterministicExplanation,
  CONSENSUS_VERSION,
} from './index.js';
import { getCatalog } from '@commonscene/catalog';
import {
  PROFILE_ALICE,
  PROFILE_BOB,
  SAMPLE_PROFILES,
  EMPTY_PROFILE,
  IMPOSSIBLE_RUNTIME_PROFILE,
  PARTICIPANT_ALICE_ID,
  PARTICIPANT_BOB_ID,
} from '@commonscene/test-fixtures';
import type { Movie, PreferenceProfile } from '@commonscene/contracts';

describe('Consensus Engine (@commonscene/consensus)', () => {
  const catalog = getCatalog();

  it('exports CONSENSUS_VERSION', () => {
    expect(CONSENSUS_VERSION).toBe('1.0.0');
  });

  // -------------------------------------------------------------------------
  // 1. Hard Constraints Tests
  // -------------------------------------------------------------------------

  describe('Hard Constraints Enforcement', () => {
    it('excludes movies exceeding maximum runtime constraint', () => {
      const shortProfile: PreferenceProfile = {
        ...EMPTY_PROFILE,
        maximumRuntimeMinutes: 90,
      };

      const results = rankMovies(catalog, [shortProfile]);
      // Only movies <= 90 min should be present
      expect(results.length).toBeGreaterThan(0);
      for (const ranked of results) {
        const movie = catalog.find((m) => m.id === ranked.movieId)!;
        expect(movie.runtimeMinutes).toBeLessThanOrEqual(90);
      }
    });

    it('excludes movies exceeding maximum content rating constraint', () => {
      const gOnlyProfile: PreferenceProfile = {
        ...EMPTY_PROFILE,
        maximumContentRating: 'G',
      };

      const results = rankMovies(catalog, [gOnlyProfile]);
      expect(results.length).toBeGreaterThan(0);
      for (const ranked of results) {
        const movie = catalog.find((m) => m.id === ranked.movieId)!;
        expect(movie.contentRating).toBe('G');
      }
    });

    it('excludes movies containing explicitly excluded genres', () => {
      const noHorrorProfile: PreferenceProfile = {
        ...EMPTY_PROFILE,
        excludedGenres: ['Horror'],
      };

      const results = rankMovies(catalog, [noHorrorProfile]);
      const horrorMovieIds = catalog.filter((m) => m.genres.includes('Horror')).map((m) => m.id);

      expect(horrorMovieIds.length).toBeGreaterThan(0);
      for (const ranked of results) {
        expect(horrorMovieIds).not.toContain(ranked.movieId);
      }
    });

    it('excludes movies containing avoided content tags', () => {
      const noGoreProfile: PreferenceProfile = {
        ...EMPTY_PROFILE,
        avoidContentTags: ['gore', 'jump scares'],
      };

      const results = rankMovies(catalog, [noGoreProfile]);
      for (const ranked of results) {
        const movie = catalog.find((m) => m.id === ranked.movieId)!;
        expect(movie.contentTags).not.toContain('gore');
        expect(movie.contentTags).not.toContain('jump scares');
      }
    });

    it('returns empty array when no movies meet hard constraints', () => {
      const results = rankMovies(catalog, [IMPOSSIBLE_RUNTIME_PROFILE]);
      expect(results).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Scoring & Component Calculations
  // -------------------------------------------------------------------------

  describe('Scoring & Component Calculations', () => {
    it('calculates participant satisfaction accurately', () => {
      const movie: Movie = {
        id: 'test-1',
        title: 'Test Comedy',
        synopsis: 'Funny story',
        runtimeMinutes: 90,
        releaseYear: 2024,
        genres: ['Comedy', 'Family'],
        moods: ['lighthearted'],
        contentRating: 'G',
        contentTags: [],
        artworkKey: 'art_test',
      };

      // 2 requested genres + 1 mood = 3 total. Matches 2 genres + 1 mood = 3 matches.
      const profile: PreferenceProfile = {
        participantId: PARTICIPANT_ALICE_ID,
        preferredGenres: ['Comedy', 'Family'],
        excludedGenres: [],
        moods: ['lighthearted'],
        maximumRuntimeMinutes: null,
        maximumContentRating: null,
        avoidContentTags: [],
        freeText: null,
      };

      const satisfaction = calculateParticipantSatisfaction(movie, profile);
      expect(satisfaction.satisfaction).toBe(1.0);
      expect(satisfaction.matchedKeys).toEqual([
        'genre:Comedy',
        'genre:Family',
        'mood:lighthearted',
      ]);
    });

    it('calculates group preference coverage accurately', () => {
      const movie: Movie = {
        id: 'test-2',
        title: 'Test Sci-Fi',
        synopsis: 'Space story',
        runtimeMinutes: 100,
        releaseYear: 2024,
        genres: ['Sci-Fi'],
        moods: ['epic'],
        contentRating: 'PG',
        contentTags: [],
        artworkKey: 'art_test',
      };

      // Alice wants Comedy; Bob wants Sci-Fi. Total distinct requested genres = 2.
      const coverage = calculateGroupPreferenceCoverage(movie, [PROFILE_ALICE, PROFILE_BOB]);
      expect(coverage.coverage).toBeGreaterThan(0);
      expect(coverage.coverage).toBeLessThan(1.0);
    });

    it('favors fair consensus over polarizing majority (minimum satisfaction weight)', () => {
      // Movie A: 1.0 for Alice, 0.0 for Bob (Avg = 0.50, Min = 0.0) -> Score = 0.45(0.5)+0.35(0)+0.2(0.5) = 0.325
      // Movie B: 0.5 for Alice, 0.5 for Bob (Avg = 0.50, Min = 0.5) -> Score = 0.45(0.5)+0.35(0.5)+0.2(0.5) = 0.500
      const movieA: Movie = {
        id: 'movie-a',
        title: 'Polarizing Movie',
        synopsis: 'Only Alice likes it',
        runtimeMinutes: 90,
        releaseYear: 2024,
        genres: ['Family'],
        moods: [],
        contentRating: 'G',
        contentTags: [],
        artworkKey: 'art_a',
      };

      const movieB: Movie = {
        id: 'movie-b',
        title: 'Compromise Movie',
        synopsis: 'Both somewhat like it',
        runtimeMinutes: 90,
        releaseYear: 2024,
        genres: ['Adventure'],
        moods: ['whimsical'],
        contentRating: 'G',
        contentTags: [],
        artworkKey: 'art_b',
      };

      const profiles: PreferenceProfile[] = [
        {
          participantId: PARTICIPANT_ALICE_ID,
          preferredGenres: ['Family', 'Adventure'],
          excludedGenres: [],
          moods: [],
          maximumRuntimeMinutes: null,
          maximumContentRating: null,
          avoidContentTags: [],
          freeText: null,
        },
        {
          participantId: PARTICIPANT_BOB_ID,
          preferredGenres: ['Sci-Fi', 'Adventure'],
          excludedGenres: [],
          moods: ['whimsical'],
          maximumRuntimeMinutes: null,
          maximumContentRating: null,
          avoidContentTags: [],
          freeText: null,
        },
      ];

      const ranked = rankMovies([movieA, movieB], profiles);
      expect(ranked[0]!.movieId).toBe('movie-b');
      expect(ranked[0]!.minimumSatisfaction).toBeGreaterThan(ranked[1]!.minimumSatisfaction);
    });

    it('breaks ties deterministically by catalog ID', () => {
      // Two identical movies with identical scores must be sorted by movieId ascending
      const baseMovie = catalog[0]!;
      const movie1: Movie = {
        ...baseMovie,
        id: 'cs-mov-aaa',
      };
      const movie2: Movie = {
        ...baseMovie,
        id: 'cs-mov-bbb',
      };

      const ranked = rankMovies([movie2, movie1], [EMPTY_PROFILE]);
      expect(ranked[0]!.movieId).toBe('cs-mov-aaa');
      expect(ranked[1]!.movieId).toBe('cs-mov-bbb');
    });
  });

  // -------------------------------------------------------------------------
  // 3. Multi-Participant Group Dynamics (Demo Suite)
  // -------------------------------------------------------------------------

  describe('Multi-Participant Group Consensus', () => {
    it('ranks Alice, Bob, and Charlie to find the ideal family recommendation', () => {
      const results = rankMovies(catalog, SAMPLE_PROFILES);

      expect(results.length).toBeGreaterThan(0);
      const topMovie = catalog.find((m) => m.id === results[0]!.movieId)!;

      // Top movie must satisfy Alice's max runtime <= 100m and rating <= PG
      expect(topMovie.runtimeMinutes).toBeLessThanOrEqual(100);
      expect(['G', 'PG']).toContain(topMovie.contentRating);

      // Must have generated a deterministic explanation
      expect(results[0]!.explanation).toBeDefined();
      expect(results[0]!.explanation.length).toBeGreaterThan(10);
    });

    it('handles single participant with empty profile gracefully', () => {
      const results = rankMovies(catalog, [EMPTY_PROFILE]);
      expect(results.length).toBe(catalog.length);
      expect(results[0]!.score).toBe(1.0);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Deterministic Explanations
  // -------------------------------------------------------------------------

  describe('Deterministic Explanation Generator', () => {
    it('generates group consensus explanations with percentage breakdown', () => {
      const movie = catalog[1]!; // The Clockwork Bakery
      const scoreData = calculateMovieScoreBreakdown(movie, SAMPLE_PROFILES);
      const explanation = generateDeterministicExplanation(
        movie,
        scoreData.breakdown,
        scoreData.matchedPreferenceKeys,
        3,
      );

      expect(explanation).toContain('Fair group consensus');
      expect(explanation).toContain('preference coverage');
      expect(explanation).toContain('average satisfaction');
    });
  });
});
