import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// A stable, per-user color from the seed's hue — ~360 distinct hues (so users
// rarely collide, unlike a small fixed palette) at a fixed moderate saturation
// and lightness, which keeps them vivid-but-not-harsh and readable under white
// initials. Independent of the user's role.
function colorFor(seed: string): string {
  return `hsl(${hash(seed) % 360}, 52%, 48%)`;
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
  const color = colorFor(seed || name);
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
