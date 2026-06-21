import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/lib/store/auth-store';
import { Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Profile
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">
            {user?.firstName ?? ''} {user?.lastName ?? ''}
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {user?.email}
          </ThemedText>
        </ThemedView>

        <Pressable
          disabled={signingOut}
          onPress={handleSignOut}
          style={[styles.button, { borderColor: theme.error, opacity: signingOut ? 0.6 : 1 }]}>
          {signingOut ? (
            <ActivityIndicator color={theme.error} />
          ) : (
            <ThemedText type="smallBold" themeColor="error">
              Sign out
            </ThemedText>
          )}
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.five, gap: Spacing.four },
  header: { gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  card: { borderRadius: Spacing.three, padding: Spacing.four, gap: Spacing.half },
  button: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
