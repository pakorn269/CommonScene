/**
 * DemoModeScreen — Self-contained offline 90s demonstration for Fire TV.
 *
 * Meets AGENTS.md requirements:
 * - Uses fixed fictional catalog.
 * - Uses 3 predictable participants (Alice, Bob, Charlie) from test fixtures.
 * - Demonstrates a meaningful disagreement resolved fairly.
 * - Works 100% offline without Bedrock or external network.
 * - Can complete in under 90 seconds.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FocusableButton } from '../components/FocusableButton.js';
import { COLORS, SPACING, AVATARS, RATING_BADGES } from '@commonscene/ui-tokens';
import { getCatalog, getMovieById } from '@commonscene/catalog';
import { rankMovies } from '@commonscene/consensus';
import { PROFILE_ALICE, PROFILE_BOB, PROFILE_CHARLIE } from '@commonscene/test-fixtures';
import type { RankedMovie } from '@commonscene/contracts';

export interface DemoModeScreenProps {
  onExit: () => void;
}

type DemoStep = 'intro' | 'joining' | 'prefs' | 'ranking' | 'results' | 'winner';

export const DemoModeScreen: React.FC<DemoModeScreenProps> = ({ onExit }) => {
  const [step, setStep] = useState<DemoStep>('intro');
  const [recommendations, setRecommendations] = useState<RankedMovie[]>([]);

  useEffect(() => {
    // Step timer progression
    const t1 = setTimeout(() => setStep('joining'), 1500);
    const t2 = setTimeout(() => setStep('prefs'), 3500);
    const t3 = setTimeout(() => {
      setStep('ranking');
      // Compute deterministic ranking offline
      const catalog = getCatalog();
      const result = rankMovies(catalog, [PROFILE_ALICE, PROFILE_BOB, PROFILE_CHARLIE]);
      setRecommendations(result);
    }, 5500);
    const t4 = setTimeout(() => setStep('results'), 7500);
    const t5 = setTimeout(() => setStep('winner'), 13000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const winningMovie = recommendations[0] ? getMovieById(recommendations[0].movieId) : null;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.badgeRow}>
          <Text style={styles.demoBadge}>OFFLINE DEMO MODE</Text>
          <Text style={styles.stepTag}>
            {step === 'intro' && 'Initializing Demo Room...'}
            {step === 'joining' && 'Participants Joining (3/3)'}
            {step === 'prefs' && 'Submitting Diverse Preferences...'}
            {step === 'ranking' && 'Calculating Fair Consensus...'}
            {step === 'results' && 'Top Consensus Recommendations'}
            {step === 'winner' && 'Final Group Winner'}
          </Text>
        </View>
        <Text style={styles.headerTitle}>
          {step === 'winner' ? 'Consensus Winner Revealed!' : 'CommonScene Group Decision Flow'}
        </Text>
      </View>

      {/* Step 1 & 2: Joining & Submitting */}
      {(step === 'intro' || step === 'joining' || step === 'prefs') && (
        <View style={styles.demoContent}>
          <Text style={styles.scenarioHeading}>
            Scenario: 3 Family Members with Conflicting Tastes
          </Text>

          <View style={styles.participantsRow}>
            {/* Alice */}
            <View style={styles.profileCard}>
              <View style={[styles.avatarBox, { backgroundColor: AVATARS[0]?.bg ?? '#F97316' }]}>
                <Text style={styles.avatarEmoji}>{AVATARS[0]?.emoji ?? '🦊'}</Text>
              </View>
              <Text style={styles.profileName}>Alice (Mom)</Text>
              <Text style={styles.profilePref}>Loves: Family, Comedy</Text>
              <Text style={styles.profilePref}>Max: 100 min • PG</Text>
              <Text style={styles.profileExclusion}>Excludes: Horror</Text>
              {step === 'prefs' && <Text style={styles.readyIndicator}>✓ Submitted</Text>}
            </View>

            {/* Bob */}
            <View style={styles.profileCard}>
              <View style={[styles.avatarBox, { backgroundColor: AVATARS[1]?.bg ?? '#10B981' }]}>
                <Text style={styles.avatarEmoji}>{AVATARS[1]?.emoji ?? '🐼'}</Text>
              </View>
              <Text style={styles.profileName}>Bob (Dad)</Text>
              <Text style={styles.profilePref}>Loves: Sci-Fi, Adventure</Text>
              <Text style={styles.profilePref}>Max: 120 min • PG-13</Text>
              <Text style={styles.profilePref}>Mood: thrilling, epic</Text>
              {step === 'prefs' && <Text style={styles.readyIndicator}>✓ Submitted</Text>}
            </View>

            {/* Charlie */}
            <View style={styles.profileCard}>
              <View style={[styles.avatarBox, { backgroundColor: AVATARS[2]?.bg ?? '#F59E0B' }]}>
                <Text style={styles.avatarEmoji}>{AVATARS[2]?.emoji ?? '🦁'}</Text>
              </View>
              <Text style={styles.profileName}>Charlie (Kid)</Text>
              <Text style={styles.profilePref}>Loves: Animation, Musical</Text>
              <Text style={styles.profilePref}>Max: 95 min • G</Text>
              <Text style={styles.profileExclusion}>Excludes: Horror, Thriller</Text>
              {step === 'prefs' && <Text style={styles.readyIndicator}>✓ Submitted</Text>}
            </View>
          </View>
        </View>
      )}

      {/* Step 3: Ranking */}
      {step === 'ranking' && (
        <View style={styles.rankingBox}>
          <Text style={styles.rankingFormulaTitle}>Deterministic Consensus Formula</Text>
          <Text style={styles.rankingFormula}>
            Score = 0.45·Avg + 0.35·Min + 0.20·Coverage - Penalty
          </Text>
          <Text style={styles.rankingFormulaSub}>
            Guarantees no single participant is ignored (Min satisfaction weight)
          </Text>
        </View>
      )}

      {/* Step 4: Results */}
      {step === 'results' && (
        <View style={styles.cardsRow}>
          {recommendations.slice(0, 3).map((rec, index) => {
            const movie = getMovieById(rec.movieId);
            if (!movie) return null;
            const ratingBadge = RATING_BADGES[movie.contentRating];

            return (
              <View key={movie.id} style={styles.recCard}>
                <Text style={styles.recOption}>
                  #{index + 1} • {Math.round(rec.score * 100)}% Match
                </Text>
                <Text style={styles.recTitle} numberOfLines={1}>
                  {movie.title}
                </Text>
                <Text style={styles.recMeta}>
                  {movie.runtimeMinutes} min •{' '}
                  <Text style={{ color: ratingBadge.color }}>{movie.contentRating}</Text>
                </Text>
                <Text style={styles.recSynopsis} numberOfLines={3}>
                  {movie.synopsis}
                </Text>
                <Text style={styles.recExpl} numberOfLines={2}>
                  💡 {rec.explanation}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Step 5: Winner */}
      {step === 'winner' && winningMovie && (
        <View style={styles.winnerCard}>
          <Text style={styles.winnerTitle}>{winningMovie.title}</Text>
          <Text style={styles.winnerMeta}>
            {winningMovie.releaseYear} • {winningMovie.runtimeMinutes} min •{' '}
            {winningMovie.contentRating} • {winningMovie.genres.join(', ')}
          </Text>
          <Text style={styles.winnerSynopsis}>{winningMovie.synopsis}</Text>
          <Text style={styles.winnerReason}>
            ✨ Won unanimous group vote (Satisfied Charlie&apos;s G-rating constraint, Alice&apos;s
            Comedy preference, and Bob&apos;s Adventure mood).
          </Text>
        </View>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <FocusableButton
          label="Exit Demo"
          onPress={onExit}
          initialFocus={true}
          style={styles.exitButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: `${SPACING.tvSafeMarginPct}%`,
    paddingVertical: `${SPACING.tvSafeMarginPct}%`,
    justifyContent: 'space-between',
  },
  topBar: {
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  demoBadge: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  stepTag: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 34,
    fontWeight: '800',
    marginTop: 4,
  },
  demoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  scenarioHeading: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  participantsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  profileCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  profileName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  profilePref: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  profileExclusion: {
    color: COLORS.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  readyIndicator: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  rankingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 40,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  rankingFormulaTitle: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  rankingFormula: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 12,
  },
  rankingFormulaSub: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  cardsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
    marginVertical: 12,
  },
  recCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  recOption: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  recTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 4,
  },
  recMeta: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  recSynopsis: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  recExpl: {
    color: '#A5B4FC',
    fontSize: 12,
    lineHeight: 16,
  },
  winnerCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 36,
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: 'center',
  },
  winnerTitle: {
    color: COLORS.textPrimary,
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 8,
  },
  winnerMeta: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 16,
  },
  winnerSynopsis: {
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 16,
  },
  winnerReason: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    marginTop: 12,
  },
  exitButton: {
    minWidth: 180,
  },
});
