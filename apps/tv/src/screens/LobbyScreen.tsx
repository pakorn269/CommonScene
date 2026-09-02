/**
 * LobbyScreen — TV screen showing room code, QR join instructions, and joined participants.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FocusableButton } from '../components/FocusableButton.js';
import { COLORS, SPACING, AVATARS } from '@commonscene/ui-tokens';
import type { Participant } from '@commonscene/contracts';

export interface LobbyScreenProps {
    roomCode: string;
    participants: Participant[];
    onStartCollecting: () => void;
    onBack: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
    roomCode,
    participants,
    onStartCollecting,
    onBack,
}) => {
    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <Text style={styles.headerSubtitle}>STEP 1 OF 4: GATHER GROUP</Text>
                <Text style={styles.headerTitle}>Join on Your Phones</Text>
            </View>

            {/* Main Content: Left = Code Card, Right = Joined Participants */}
            <View style={styles.contentRow}>
                {/* Left: Room Code & Instructions */}
                <View style={styles.codeCard}>
                    <Text style={styles.codeLabel}>ROOM CODE</Text>
                    <Text style={styles.roomCodeText}>{roomCode}</Text>
                    <Text style={styles.instructionText}>
                        Open your phone browser to connect:
                    </Text>
                    <View style={styles.urlBox}>
                        <Text style={styles.urlText}>commonscene.tv</Text>
                    </View>
                    <Text style={styles.subInstructionText}>
                        No account or download required.
                    </Text>
                </View>

                {/* Right: Joined Participants List */}
                <View style={styles.participantsCard}>
                    <Text style={styles.participantsTitle}>
                        Joined Group Members ({participants.length})
                    </Text>

                    <View style={styles.participantsGrid}>
                        {participants.map((p) => {
                            const avatar =
                                AVATARS.find((a) => a.id === p.avatarId) ??
                                AVATARS[0];
                            return (
                                <View key={p.id} style={styles.participantItem}>
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
                                    <Text
                                        style={styles.participantName}
                                        numberOfLines={1}
                                    >
                                        {p.displayName}
                                        {p.isHost ? ' (Host)' : ''}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    {participants.length === 1 && (
                        <Text style={styles.waitingText}>
                            Waiting for others to join...
                        </Text>
                    )}
                </View>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
                <FocusableButton
                    label="Start Collecting Preferences"
                    onPress={onStartCollecting}
                    initialFocus={true}
                    style={styles.actionButton}
                />
                <FocusableButton
                    label="Back"
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
        fontSize: 38,
        fontWeight: '800',
        marginTop: 4,
    },
    contentRow: {
        flex: 1,
        flexDirection: 'row',
        gap: 32,
        alignItems: 'center',
    },
    codeCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    codeLabel: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 2,
    },
    roomCodeText: {
        color: COLORS.accent,
        fontSize: 72,
        fontWeight: '900',
        letterSpacing: 8,
        marginVertical: 12,
    },
    instructionText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        marginBottom: 8,
    },
    urlBox: {
        backgroundColor: COLORS.surfaceElevated,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 12,
    },
    urlText: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontWeight: '700',
    },
    subInstructionText: {
        color: COLORS.textMuted,
        fontSize: 13,
    },
    participantsCard: {
        flex: 1.2,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 32,
        minHeight: 280,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    participantsTitle: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },
    participantsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    participantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceElevated,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEmoji: {
        fontSize: 20,
    },
    participantName: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    waitingText: {
        color: COLORS.textMuted,
        fontSize: 15,
        fontStyle: 'italic',
        marginTop: 24,
    },
    bottomBar: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 16,
    },
    actionButton: {
        minWidth: 300,
    },
    backButton: {
        minWidth: 140,
        backgroundColor: COLORS.surfaceSubtle,
    },
});
