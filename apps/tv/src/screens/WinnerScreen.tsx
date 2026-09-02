/**
 * WinnerScreen — Full-screen celebration of the winning movie on Fire TV.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FocusableButton } from '../components/FocusableButton.js';
import { COLORS, SPACING, RATING_BADGES } from '@commonscene/ui-tokens';
import type { Movie } from '@commonscene/contracts';

export interface WinnerScreenProps {
    winningMovie: Movie;
    onStartNew: () => void;
}

export const WinnerScreen: React.FC<WinnerScreenProps> = ({
    winningMovie,
    onStartNew,
}) => {
    const ratingBadge = RATING_BADGES[winningMovie.contentRating];

    return (
        <View style={styles.container}>
            {/* Celebration Banner */}
            <View style={styles.bannerRow}>
                <Text style={styles.popcornEmoji}>🍿</Text>
                <View>
                    <Text style={styles.bannerTag}>TONIGHT&apos;S WINNER</Text>
                    <Text style={styles.bannerSub}>
                        Consensus choice chosen by your group
                    </Text>
                </View>
            </View>

            {/* Main Movie Feature Card */}
            <View style={styles.featureCard}>
                <Text style={styles.movieTitle}>{winningMovie.title}</Text>

                <View style={styles.metadataRow}>
                    <Text style={styles.metadataYear}>
                        {winningMovie.releaseYear}
                    </Text>
                    <Text style={styles.metadataDot}>•</Text>
                    <Text style={styles.metadataRuntime}>
                        {winningMovie.runtimeMinutes} min
                    </Text>
                    <Text style={styles.metadataDot}>•</Text>
                    <View
                        style={[
                            styles.ratingBadge,
                            { borderColor: ratingBadge.color },
                        ]}
                    >
                        <Text
                            style={[
                                styles.ratingBadgeText,
                                { color: ratingBadge.color },
                            ]}
                        >
                            {winningMovie.contentRating}
                        </Text>
                    </View>
                </View>

                <Text style={styles.synopsis}>{winningMovie.synopsis}</Text>

                <View style={styles.genreTagsRow}>
                    {winningMovie.genres.map((g) => (
                        <View key={g} style={styles.genreTag}>
                            <Text style={styles.genreTagText}>{g}</Text>
                        </View>
                    ))}
                    {winningMovie.moods.map((m) => (
                        <View key={m} style={styles.moodTag}>
                            <Text style={styles.moodTagText}>✨ {m}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
                <FocusableButton
                    label="Start New Session"
                    onPress={onStartNew}
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
    bannerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    popcornEmoji: {
        fontSize: 48,
    },
    bannerTag: {
        color: COLORS.accent,
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 3,
    },
    bannerSub: {
        color: COLORS.textSecondary,
        fontSize: 16,
        marginTop: 2,
    },
    featureCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 40,
        maxWidth: 900,
        borderWidth: 2,
        borderColor: COLORS.accent,
        marginVertical: 20,
    },
    movieTitle: {
        color: COLORS.textPrimary,
        fontSize: 48,
        fontWeight: '900',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    metadataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    metadataYear: {
        color: COLORS.textSecondary,
        fontSize: 18,
        fontWeight: '600',
    },
    metadataRuntime: {
        color: COLORS.textSecondary,
        fontSize: 18,
        fontWeight: '600',
    },
    metadataDot: {
        color: COLORS.textMuted,
        fontSize: 18,
    },
    ratingBadge: {
        borderWidth: 1.5,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    ratingBadgeText: {
        fontSize: 14,
        fontWeight: '800',
    },
    synopsis: {
        color: COLORS.textPrimary,
        fontSize: 20,
        lineHeight: 30,
        marginBottom: 24,
    },
    genreTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    genreTag: {
        backgroundColor: COLORS.surfaceElevated,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    genreTagText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    moodTag: {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    moodTagText: {
        color: '#A5B4FC',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomBar: {
        flexDirection: 'row',
        gap: 20,
    },
    actionButton: {
        minWidth: 260,
    },
});
