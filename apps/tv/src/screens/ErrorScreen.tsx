/**
 * ErrorScreen — Recoverable error screen on Fire TV.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FocusableButton } from '../components/FocusableButton.js';
import { COLORS, SPACING } from '@commonscene/ui-tokens';

export interface ErrorScreenProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    onHome: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
    title = 'Something Went Wrong',
    message,
    onRetry,
    onHome,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.icon}>⚠️</Text>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>

                <View style={styles.actionsRow}>
                    {onRetry && (
                        <FocusableButton
                            label="Try Again"
                            onPress={onRetry}
                            initialFocus={true}
                            style={styles.retryButton}
                        />
                    )}
                    <FocusableButton
                        label="Return to Home"
                        onPress={onHome}
                        initialFocus={!onRetry}
                        style={styles.homeButton}
                        textStyle={{ color: COLORS.textSecondary }}
                    />
                </View>
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 48,
        maxWidth: 680,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.danger,
    },
    icon: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 12,
    },
    message: {
        color: COLORS.textSecondary,
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 32,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 20,
    },
    retryButton: {
        minWidth: 200,
    },
    homeButton: {
        minWidth: 200,
        backgroundColor: COLORS.surfaceSubtle,
    },
});
