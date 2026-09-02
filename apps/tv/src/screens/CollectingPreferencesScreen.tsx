/**
 * CollectingPreferencesScreen — TV screen tracking live preference submissions.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FocusableButton } from '../components/FocusableButton.js';
import { COLORS, SPACING, AVATARS } from '@commonscene/ui-tokens';
import type { Participant } from '@commonscene/contracts';

export interface CollectingPreferencesScreenProps {
    roomCode: string;
    participants: Participant[];
    onRunConsensus: () => void;
    onBack: () => void;
}

export const CollectingPreferencesScreen: React.FC<
    CollectingPreferencesScreenProps
> = ({ roomCode: _roomCode, participants, onRunConsensus, onBack }) => {
    const submittedCount = participants.filter(
        (p) => p.hasSubmittedPreferences
    ).length;
    const allReady =
        participants.length > 0 && submittedCount === participants.length;

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <Text style={styles.headerSubtitle}>
                    STEP 2 OF 4: COLLECT PREFERENCES
                </Text>
                <Text style={styles.headerTitle}>
                    Check Your Phones ({submittedCount}/{participants.length} Ready)
                </Text>
            </View>

            {/* Grid of Participant Cards */}
            <View style={styles.gridContainer}>
                {participants.map((p) => {
                    const avatar =
                        AVATARS.find((a) => a.id === p.avatarId) ?? AVATARS[0];
                    const isReady = p.hasSubmittedPreferences;

                    return (
                        <View
                            key={p.id}
                            style={[
                                styles.participantCard,
                                isReady && styles.participantCardReady,
                            ]}
                        >
                            <View
                                style={[
                                    styles.avatarCircle,
                                    { backgroundColor: avatar.bg },
                                ]}
                            >
                                <Text style={styles.avatarEmoji}>
                                    {avatar.emoji}
                                </Text>
                            </View>

                            <View style={styles.participantInfo}>
                                <Text style={styles.participantName}>
                                    {p.displayName}
                                </Text>
                                <Text
                                    style={[
                                        styles.participantStatus,
                                        isReady && styles.participantStatusReady,
                                    ]}
                                >
                                    {isReady
                                        ? '✓ Preferences Ready'
                                        : 'Selecting choices...'}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
                <FocusableButton
                    label={
                        allReady
                            ? 'Run Consensus Engine (All Ready)'
                            : `Run Consensus Engine (${submittedCount}/${participants.length} Ready)`
                    }
                    onPress={onRunConsensus}
                    initialFocus={true}
                    style={[
                        styles.actionButton,
                        allReady ? styles.actionButtonReady : undefined,
                    ]}
                />
                <FocusableButton
                    label="Back to Lobby"
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
        marginBottom: 20,
    },
    headerSubtitle: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
    },
    headerTitle: {
        color: COLORS.textPrimary,
        fontSize: 38,
        fontWeight: '800',
        marginTop: 4,
    },
    gridContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        alignContent: 'flex-start',
    },
    participantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        width: 340,
        gap: 16,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    participantCardReady: {
        borderColor: COLORS.success,
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEmoji: {
        fontSize: 26,
    },
    participantInfo: {
        flex: 1,
    },
    participantName: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    participantStatus: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
    participantStatusReady: {
        color: COLORS.success,
        fontWeight: '600',
    },
    bottomBar: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 16,
    },
    actionButton: {
        minWidth: 360,
    },
    actionButtonReady: {
        backgroundColor: COLORS.success,
    },
    backButton: {
        minWidth: 160,
        backgroundColor: COLORS.surfaceSubtle,
    },
});
