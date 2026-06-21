import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/lib/store/auth-store';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}
          </ThemedText>
          <ThemedText type="default" themeColor="textMuted">
            Your programs, members, and announcements will live here.
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.placeholderCard}>
          <ThemedText type="smallBold">Nothing to show yet</ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            This is a scaffold screen — wire up org/program data next.
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.five, gap: Spacing.four },
  header: { gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  placeholderCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.one,
  },
});
