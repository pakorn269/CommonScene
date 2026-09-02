/**
 * @commonscene/ui-tokens — Shared Design Tokens for TV and Mobile Apps.
 *
 * Provides a cohesive, premium dark cinema palette, typography scales,
 * avatar definitions, and TV-safe area constants.
 */

export const UI_TOKENS_VERSION = '1.0.0' as const;

export const COLORS = {
  background: '#090D16',
  surface: '#121826',
  surfaceSubtle: '#1C2436',
  surfaceElevated: '#242F46',
  border: '#2C3A54',
  borderFocus: '#6366F1',

  // Primary Accents
  primary: '#6366F1', // Vibrant Indigo
  primaryHover: '#4F46E5',
  primaryLight: 'rgba(99, 102, 241, 0.15)',

  accent: '#F59E0B', // Amber Gold (Winner & Star)
  accentHover: '#D97706',

  success: '#10B981', // Emerald
  danger: '#EF4444', // Rose Red (Exclusion)
  warning: '#F59E0B',

  // Text hierarchy
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#090D16',

  // Focus indicator for TV and accessibility (>= 3px)
  focusRing: '#818CF8',
} as const;

export const AVATARS = [
  { id: 'avatar-1', emoji: '🦊', label: 'Fox', bg: '#F97316' },
  { id: 'avatar-2', emoji: '🐼', label: 'Panda', bg: '#10B981' },
  { id: 'avatar-3', emoji: '🦁', label: 'Lion', bg: '#F59E0B' },
  { id: 'avatar-4', emoji: '🐬', label: 'Dolphin', bg: '#06B6D4' },
  { id: 'avatar-5', emoji: '🦉', label: 'Owl', bg: '#8B5CF6' },
  { id: 'avatar-6', emoji: '🐨', label: 'Koala', bg: '#EC4899' },
] as const;

export const GENRE_OPTIONS = [
  'Family',
  'Comedy',
  'Sci-Fi',
  'Adventure',
  'Fantasy',
  'Animation',
  'Musical',
  'Mystery',
  'Thriller',
  'Action',
  'Romance',
  'Documentary',
  'Horror',
] as const;

export const MOOD_OPTIONS = [
  'lighthearted',
  'heartwarming',
  'thrilling',
  'epic',
  'whimsical',
  'joyful',
  'uplifting',
  'relaxing',
  'witty',
  'feel-good',
  'clever',
  'scary',
  'tense',
] as const;

export const RATING_BADGES = {
  G: { label: 'G', color: '#10B981', desc: 'All Ages' },
  PG: { label: 'PG', color: '#06B6D4', desc: 'Parental Guidance' },
  'PG-13': { label: 'PG-13', color: '#F59E0B', desc: 'Parents Strongly Cautioned' },
  R: { label: 'R', color: '#EF4444', desc: 'Restricted 17+' },
  'NC-17': { label: 'NC-17', color: '#DC2626', desc: 'Adults Only' },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  tvSafeMarginPct: 5, // 5% viewport TV-safe inset
} as const;

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 18,
  full: 9999,
} as const;
