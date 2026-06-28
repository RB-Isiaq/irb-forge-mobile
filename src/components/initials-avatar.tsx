import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

// Stable per-user colors, like Slack/Discord avatar fallbacks.
const PALETTE = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Circular avatar showing a user's initials over a stable, name-derived color. */
export function InitialsAvatar({
  name,
  seed,
  size = 36,
}: {
  name: string;
  seed?: string;
  size?: number;
}) {
  const color = PALETTE[hash(seed || name) % PALETTE.length];
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <ThemedText type="smallBold" style={{ color: '#fff', fontSize: size * 0.38 }}>
        {getInitials(name)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
});
