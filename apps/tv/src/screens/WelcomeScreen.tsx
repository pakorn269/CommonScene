/**
 * WelcomeScreen — First screen displayed when CommonScene launches on Fire TV.
 *
 * Meets AGENTS.md requirements:
 * - 5% TV-safe margins
 * - D-pad navigable focus buttons with >= 3px focus ring
 * - "Create Room" and "Demo Mode"
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FocusableButton } from '../components/FocusableButton.js';
import { COLORS, SPACING } from '@commonscene/ui-tokens';

export interface WelcomeScreenProps {
    onCreateRoom: () => void;
    onDemoMode: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    onCreateRoom,
    onDemoMode,
}) => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.badge}>Fire TV Edition</Text>
                <Text style={styles.title}>CommonScene</Text>
                <Text style={styles.subtitle}>
                    Find a movie everyone loves. Connect phones, submit preferences,
                    and get fair, explainable group recommendations on the big screen.
                </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <FocusableButton
                    label="Create Room"
                    onPress={onCreateRoom}
                    initialFocus={true}
                    style={styles.primaryButton}
                    textStyle={styles.primaryButtonText}
                />
                <FocusableButton
                    label="Demo Mode (Offline 90s)"
                    onPress={onDemoMode}
                    style={styles.secondaryButton}
                    textStyle={styles.secondaryButtonText}
                />
            </View>

            {/* Remote Navigation Hint */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Use remote D-pad to navigate • Press Select to activate
                </Text>
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
    header: {
        maxWidth: 720,
    },
    badge: {
        color: COLORS.accent,
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 54,
        fontWeight: '900',
        letterSpacing: -1,
        marginBottom: 16,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 20,
        lineHeight: 30,
    },
    actions: {
        flexDirection: 'row',
        gap: 20,
        marginVertical: 40,
    },
    primaryButton: {
        minWidth: 260,
    },
    primaryButtonText: {
        fontSize: 18,
    },
    secondaryButton: {
        minWidth: 260,
    },
    secondaryButtonText: {
        fontSize: 18,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 16,
    },
    footerText: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
});
