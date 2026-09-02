/**
 * FocusableButton — Reusable D-pad-navigable TV button.
 *
 * Design rules (AGENTS.md):
 * - Focused state must be visually obvious (≥ 3px focus indicator).
 * - No hover-only interactions.
 * - Must support Select/Enter activation.
 * - Must be readable at television viewing distance.
 *
 * The focus ring uses a border approach: unfocused renders a transparent
 * border (preserving layout); focused renders a coloured border with a
 * slight scale transform for additional emphasis.
 */
import React from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    type StyleProp,
    type ViewStyle,
    type TextStyle,
} from 'react-native';
import { useTVFocus } from '../hooks/useTVFocus.js';

export interface FocusableButtonProps {
    label: string;
    onPress: () => void;
    /** Request initial focus when component mounts. */
    initialFocus?: boolean;
    /** Accessible hint read by assistive technology. */
    accessibilityHint?: string;
    /** Optional override styles for the outer container. */
    style?: StyleProp<ViewStyle>;
    /** Optional override styles for the text. */
    textStyle?: StyleProp<TextStyle>;
    testID?: string;
}

export function FocusableButton({
    label,
    onPress,
    initialFocus = false,
    accessibilityHint,
    style,
    textStyle,
    testID,
}: FocusableButtonProps): React.ReactElement {
    const { isFocused, focusProps } = useTVFocus({ initialFocus });

    return (
        <TouchableOpacity
            {...focusProps}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint={accessibilityHint}
            testID={testID}
            activeOpacity={0.85}
        >
            <View style={[styles.button, isFocused && styles.buttonFocused, style]}>
                <Text style={[styles.label, isFocused && styles.labelFocused, textStyle]}>
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default FocusableButton;

// ─── Design tokens (inline for Phase 1 — moved to @commonscene/ui-tokens in Phase 6)

/** TV-safe base colour palette */
const COLOURS = {
    background: '#1a1a2e',
    backgroundFocused: '#16213e',
    border: 'transparent',
    borderFocused: '#e94560',
    textDefault: 'rgba(255, 255, 255, 0.7)',
    textFocused: '#ffffff',
} as const;

const styles = StyleSheet.create({
    button: {
        paddingVertical: 18,
        paddingHorizontal: 48,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: COLOURS.border,
        backgroundColor: COLOURS.background,
        alignItems: 'center',
        justifyContent: 'center',
        // Minimum touch/focus target — readable at TV viewing distance
        minWidth: 280,
        minHeight: 64,
    },
    buttonFocused: {
        borderColor: COLOURS.borderFocused,
        backgroundColor: COLOURS.backgroundFocused,
        // Subtle scale for extra emphasis without being jarring
        transform: [{ scale: 1.04 }],
    },
    label: {
        fontSize: 28,
        fontWeight: '600',
        color: COLOURS.textDefault,
        letterSpacing: 0.5,
    },
    labelFocused: {
        color: COLOURS.textFocused,
    },
});
