/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111827',
    background: '#f3f4f6',
    backgroundElement: '#ffffff',
    backgroundSelected: '#eef2ff',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    border: '#d1d5db',
    surface: '#ffffff',
    primary: '#4f46e5',
    primaryDark: '#4338ca',
    accent: '#8b5cf6',
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#dc2626',
  },
  dark: {
    text: '#e6edf3',
    background: '#0d1117',
    backgroundElement: '#161b22',
    backgroundSelected: '#1f2937',
    textSecondary: '#c9d1d9',
    textMuted: '#8b949e',
    border: '#30363d',
    surface: '#161b22',
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    accent: '#a78bfa',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#f87171',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
