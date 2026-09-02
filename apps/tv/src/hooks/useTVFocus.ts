/**
 * useTVFocus — Hook for TV D-pad focus management.
 *
 * Wraps React Native's TV focus APIs in a consistent interface for
 * CommonScene components. Provides:
 * - `focusRef`: ref to attach to the focusable element
 * - `isFocused`: whether the element currently has focus
 * - `focusProps`: spread onto the Touchable/Pressable for correct behaviour
 *
 * Vega OS focus model:
 * - `hasTVPreferredFocus`: requests initial focus on mount
 * - `onFocus` / `onBlur`: fired by the RNV runtime when D-pad moves focus
 * - `accessible` + `accessibilityLabel`: required for WCAG AA compliance
 *
 * References:
 * https://developer.amazon.com/docs/vega/focus-management.html
 * https://reactnative.dev/docs/next/tv-guide#focus-and-navigation
 */
import { useRef, useState, useCallback, type RefObject } from 'react';
import type { ElementRef } from 'react';
import type { TouchableOpacity } from 'react-native';

/** Concrete instance type of a TouchableOpacity ref. */
type TouchableRef = ElementRef<typeof TouchableOpacity>;

export interface TVFocusOptions {
  /** If true, this element requests focus when it first mounts. */
  initialFocus?: boolean;
  /** Called when this element gains focus. */
  onFocus?: () => void;
  /** Called when this element loses focus. */
  onBlur?: () => void;
}

export interface TVFocusResult {
  focusRef: RefObject<TouchableRef | null>;
  isFocused: boolean;
  focusProps: {
    ref: RefObject<TouchableRef | null>;
    hasTVPreferredFocus: boolean;
    onFocus: () => void;
    onBlur: () => void;
    accessible: true;
  };
}

export function useTVFocus(options: TVFocusOptions = {}): TVFocusResult {
  const { initialFocus = false, onFocus, onBlur } = options;
  const focusRef = useRef<TouchableRef>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  return {
    focusRef,
    isFocused,
    focusProps: {
      ref: focusRef,
      hasTVPreferredFocus: initialFocus,
      onFocus: handleFocus,
      onBlur: handleBlur,
      accessible: true,
    },
  };
}
