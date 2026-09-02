/**
 * RecommendationResultsScreen — TV screen displaying the top 3 consensus finalists.
 *
 * Adheres to AGENTS.md rule:
 * - Avoid placing more than three recommendation cards on one screen.
 * - Shows component scores, runtime, rating, and deterministic explanation.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FocusableButton } from '../components/FocusableButton.js';
import { COLORS, SPACING, RATING_BADGES } from '@commonscene/ui-tokens';
import type { RankedMovie } from '@commonscene/contracts';
import { getMovieById } from '@commonscene/catalog';

export interface RecommendationResultsScreenProps {
  recommendations: RankedMovie[];
  onStartVoting: () => void;
  onBack: () => void;
}

export const RecommendationResultsScreen: React.FC<RecommendationResultsScreenProps> = ({
  recommendations,
  onStartVoting,
  onBack,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.headerSubtitle}>STEP 3 OF 4: CONSENSUS FINALISTS</Text>
        <Text style={styles.headerTitle}>Top 3 Recommendations for Your Group</Text>
      </View>

      {/* 3 Horizontal Cards */}
      <View style={styles.cardsRow}>
        {recommendations.slice(0, 3).map((rec, index) => {
          const movie = getMovieById(rec.movieId);
          if (!movie) return null;

          const ratingBadge = RATING_BADGES[movie.contentRating];
          const matchPct = Math.round(rec.score * 100);

          return (
            <View key={movie.id} style={styles.card}>
              {/* Card Top Tag */}
              <View style={styles.cardHeader}>
                <Text style={styles.optionTag}>OPTION {index + 1}</Text>
                <View style={styles.matchScoreBadge}>
                  <Text style={styles.matchScoreText}>{matchPct}% Match</Text>
                </View>
              </View>

              {/* Title & Metadata */}
              <Text style={styles.movieTitle} numberOfLines={1}>
                {movie.title}
              </Text>

              <View style={styles.metadataRow}>
                <View style={[styles.ratingBadge, { borderColor: ratingBadge.color }]}>
                  <Text style={[styles.ratingBadgeText, { color: ratingBadge.color }]}>
                    {movie.contentRating}
                  </Text>
                </View>
                <Text style={styles.metadataText}>
                  {movie.runtimeMinutes} min • {movie.genres.join(', ')}
                </Text>
              </View>

              {/* Synopsis */}
              <Text style={styles.synopsis} numberOfLines={3}>
                {movie.synopsis}
              </Text>

              {/* Explanation Box */}
              <View style={styles.explanationBox}>
                <Text style={styles.explanationText} numberOfLines={3}>
                  💡 {rec.explanation}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <FocusableButton
          label="Start Final Vote on Phones"
          onPress={onStartVoting}
          initialFocus={true}
          style={styles.actionButton}
        />
        <FocusableButton
          label="Recalculate"
          onPress={onBack}
          style={styles.backButton}
          textStyle={{ color: COLORS.textSecondary }}
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
    marginBottom: 16,
  },
  headerSubtitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 36,
    fontWeight: '800',
    marginTop: 4,
  },
  cardsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
    marginVertical: 12,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionTag: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  matchScoreBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchScoreText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  movieTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  ratingBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metadataText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  synopsis: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  explanationBox: {
    backgroundColor: COLORS.surfaceSubtle,
    padding: 12,
    borderRadius: 10,
  },
  explanationText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 16,
  },
  actionButton: {
    minWidth: 320,
  },
  backButton: {
    minWidth: 160,
    backgroundColor: COLORS.surfaceSubtle,
  },
});
