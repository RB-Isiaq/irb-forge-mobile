import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

// Indigo brand color (matches the web logo gradient's midpoint #6366f1 → #4338ca).
const MARK_COLOR = '#4f46e5';

/**
 * Brand mark + wordmark for IRB Forge. Reproduces the web app's "F" logo
 * (irb-forge-fe `shared/ui/logo.tsx`, viewBox 0 0 100 100) by drawing the same
 * blocky-F polygon with three positioned bars — so it needs no native SVG.
 *
 *   stem:     x 0..27,  y 0..100
 *   top bar:  x 0..100, y 0..26
 *   mid bar:  x 27..70, y 43..62
 */
export function Logo({
  markSize = 36,
  showWordmark = true,
}: {
  markSize?: number;
  showWordmark?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={{ width: markSize, height: markSize }}>
        <View style={[styles.bar, styles.top]} />
        <View style={[styles.bar, styles.stem]} />
        <View style={[styles.bar, styles.mid]} />
      </View>
      {showWordmark && (
        <ThemedText type="subtitle" style={styles.wordmark}>
          IRB Forge
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bar: { position: 'absolute', backgroundColor: MARK_COLOR },
  top: { left: '0%', top: '0%', width: '100%', height: '26%' },
  stem: { left: '0%', top: '0%', width: '27%', height: '100%' },
  mid: { left: '27%', top: '43%', width: '43%', height: '19%' },
  wordmark: { fontSize: 26 },
});
