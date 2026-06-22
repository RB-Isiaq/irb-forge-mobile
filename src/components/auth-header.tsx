import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Logo } from '@/components/logo';
import { Spacing } from '@/constants/theme';

/**
 * Shared branded header for the auth screens: the IRB Forge logo, plus a back
 * affordance whenever there's somewhere to go back to (so secondary screens like
 * reset-password get one, while the sign-in root does not).
 */
export function AuthHeader() {
  const canGoBack = router.canGoBack();

  return (
    <View style={styles.wrap}>
      {canGoBack && (
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ThemedText type="link" themeColor="primary">
            ‹ Back
          </ThemedText>
        </Pressable>
      )}
      <Logo markSize={40} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.three },
  back: { alignSelf: 'flex-start' },
});
