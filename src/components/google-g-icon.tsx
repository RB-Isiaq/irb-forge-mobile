import { StyleSheet, Text, View } from 'react-native';

/**
 * Compact Google "G" mark for the Continue-with-Google button. Uses RN
 * primitives (no native SVG) — a white tile with Google-blue "G".
 */
export function GoogleGIcon({ size = 20 }: { size?: number }) {
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: size * 0.2 }]}>
      <Text style={[styles.letter, { fontSize: size * 0.72 }]}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  letter: { color: '#4285F4', fontWeight: '700' },
});
