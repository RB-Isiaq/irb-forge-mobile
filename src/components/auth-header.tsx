import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Logo } from '@/components/logo';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

/**
 * Shared branded header for the auth screens: a left-aligned IRB Forge logo,
 * with a top-left circular back button whenever there's somewhere to go back to
 * (so secondary screens like reset-password get one, while the sign-in root and
 * any screen reached via `replace` correctly do not).
 */
export function AuthHeader() {
  const theme = useTheme();
  const canGoBack = router.canGoBack();

  return (
    <View style={styles.wrap}>
      {canGoBack && (
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[
            styles.backBtn,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <ThemedText style={styles.chevron}>‹</ThemedText>
        </Pressable>
      )}
      <Logo markSize={40} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.three, alignItems: 'flex-start' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Nudge the chevron glyph to optically center it within the circle.
  chevron: { fontSize: 26, fontWeight: '600', lineHeight: 30, marginTop: -2, marginLeft: -2 },
});
