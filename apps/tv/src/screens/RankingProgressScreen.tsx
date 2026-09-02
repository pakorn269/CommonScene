/**
 * RankingProgressScreen — TV animated consensus calculation screen.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '@commonscene/ui-tokens';

export interface RankingProgressScreenProps {
  onComplete?: () => void;
}

export const RankingProgressScreen: React.FC<RankingProgressScreenProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    '1. Checking hard constraints (runtime, rating, excluded genres)...',
    '2. Calculating fairness weights and minimum satisfaction...',
    '3. Optimizing group preference coverage and ranking finalists...',
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStepIndex(1), 800);
    const timer2 = setTimeout(() => setStepIndex(2), 1600);
    const timer3 = setTimeout(() => onComplete?.(), 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
        <Text style={styles.title}>Finding Consensus</Text>
        <Text style={styles.subtitle}>
          Applying deterministic fair ranking across all group preferences
        </Text>

        <View style={styles.stepsContainer}>
          {steps.map((text, idx) => {
            const isDone = idx < stepIndex;
            const isCurrent = idx === stepIndex;

            return (
              <View key={text} style={styles.stepRow}>
                <Text
                  style={[
                    styles.stepIcon,
                    isDone && styles.stepIconDone,
                    isCurrent && styles.stepIconCurrent,
                  ]}
                >
                  {isDone ? '✓' : isCurrent ? '●' : '○'}
                </Text>
                <Text
                  style={[
                    styles.stepText,
                    isDone && styles.stepTextDone,
                    isCurrent && styles.stepTextCurrent,
                  ]}
                >
                  {text}
                </Text>
              </View>
            );
          })}
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
    maxWidth: 760,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  spinner: {
    marginBottom: 24,
    transform: [{ scale: 1.5 }],
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  stepsContainer: {
    width: '100%',
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepIcon: {
    color: COLORS.textMuted,
    fontSize: 18,
    width: 24,
  },
  stepIconDone: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  stepIconCurrent: {
    color: COLORS.accent,
  },
  stepText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  stepTextDone: {
    color: COLORS.textPrimary,
  },
  stepTextCurrent: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});
