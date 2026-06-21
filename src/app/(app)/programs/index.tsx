import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useOrgStore } from '@/lib/store/org-store';
import { usePrograms } from '@/lib/queries/program';
import type { Program, ProgramStatus } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

const STATUS_COLOR: Record<ProgramStatus, 'success' | 'primary' | 'textMuted' | 'error'> = {
  active: 'success',
  draft: 'textMuted',
  completed: 'primary',
  cancelled: 'error',
};

export default function ProgramsScreen() {
  const theme = useTheme();
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);
  const { data: programs, isLoading } = usePrograms(activeOrgSlug);

  if (!activeOrgSlug) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <ThemedText type="default" themeColor="textMuted">
            Pick an organization from Home first.
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Programs
          </ThemedText>
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <FlatList
            data={programs?.items ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textMuted">
                No programs yet.
              </ThemedText>
            }
            renderItem={({ item }) => <ProgramRow program={item} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function ProgramRow({ program }: { program: Program }) {
  return (
    <Link href={`/(app)/programs/${program.id}`} asChild>
      <Pressable>
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardRow}>
            <ThemedText type="smallBold" style={styles.cardName}>
              {program.name}
            </ThemedText>
            <ThemedText type="small" themeColor={STATUS_COLOR[program.status]}>
              {program.status}
            </ThemedText>
          </View>
          {program.description && (
            <ThemedText type="small" themeColor="textMuted">
              {program.description}
            </ThemedText>
          )}
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.five, gap: Spacing.three },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  listContent: { gap: Spacing.two, paddingBottom: Spacing.six },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.one },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { flex: 1 },
});
