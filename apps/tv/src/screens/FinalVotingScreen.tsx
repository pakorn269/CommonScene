/**
 * FinalVotingScreen — TV screen tracking live votes from mobile participants.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FocusableButton } from '../components/FocusableButton.js';
import { COLORS, SPACING, RATING_BADGES } from '@commonscene/ui-tokens';
import type { RankedMovie, Vote } from '@commonscene/contracts';
import { getMovieById } from '@commonscene/catalog';

export interface FinalVotingScreenProps {
    recommendations: RankedMovie[];
    votes: Vote[];
    onRevealWinner: () => void;
}

export const FinalVotingScreen: React.FC<FinalVotingScreenProps> = ({
    recommendations,
    votes,
    onRevealWinner,
}) => {
    // Count votes per movie
    const voteCounts: Record<string, number> = {};
    for (const v of votes) {
        voteCounts[v.movieId] = (voteCounts[v.movieId] ?? 0) + 1;
    }

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <Text style={styles.headerSubtitle}>
                    STEP 4 OF 4: GROUP VOTE
                </Text>
                <Text style={styles.headerTitle}>
                    Voting in Progress ({votes.length} Votes Cast)
                </Text>
            </View>

            {/* 3 Horizontal Cards with Vote Tallies */}
            <View style={styles.cardsRow}>
                {recommendations.slice(0, 3).map((rec, index) => {
                    const movie = getMovieById(rec.movieId);
                    if (!movie) return null;

                    const count = voteCounts[movie.id] ?? 0;
                    const ratingBadge = RATING_BADGES[movie.contentRating];

                    return (
                        <View
                            key={movie.id}
                            style={[
                                styles.card,
                                count > 0 && styles.cardWithVotes,
                            ]}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.optionTag}>
                                    OPTION {index + 1}
                                </Text>
                                <View style={styles.voteCounterBadge}>
                                    <Text style={styles.voteCounterText}>
                                        {count} {count === 1 ? 'Vote' : 'Votes'}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.movieTitle} numberOfLines={1}>
                                {movie.title}
                            </Text>

                            <Text style={styles.metadataText}>
                                {movie.releaseYear} • {movie.runtimeMinutes} min •{' '}
                                <Text style={{ color: ratingBadge.color }}>
                                    {movie.contentRating}
                                </Text>
                            </Text>

                            <Text style={styles.synopsis} numberOfLines={3}>
                                {movie.synopsis}
                            </Text>

                            <View style={styles.voteIndicatorBar}>
                                <View
                                    style={[
                                        styles.voteProgressFill,
                                        {
                                            width: `${Math.min(
                                                100,
                                                votes.length > 0
                                                    ? (count / votes.length) * 100
                                                    : 0
                                            )}%`,
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
                <FocusableButton
                    label="Reveal Winner"
                    onPress={onRevealWinner}
                    initialFocus={true}
                    style={styles.actionButton}
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
        color: COLORS.accent,
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
        marginVertical: 16,
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
    cardWithVotes: {
        borderColor: COLORS.accent,
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    optionTag: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    voteCounterBadge: {
        backgroundColor: COLORS.surfaceElevated,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    voteCounterText: {
        color: COLORS.accent,
        fontSize: 14,
        fontWeight: '800',
    },
    movieTitle: {
        color: COLORS.textPrimary,
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 6,
    },
    metadataText: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginBottom: 12,
    },
    synopsis: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    voteIndicatorBar: {
        height: 8,
        backgroundColor: COLORS.surfaceSubtle,
        borderRadius: 4,
        overflow: 'hidden',
    },
    voteProgressFill: {
        height: '100%',
        backgroundColor: COLORS.accent,
    },
    bottomBar: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 16,
    },
    actionButton: {
        minWidth: 280,
    },
});
