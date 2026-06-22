import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useOrgStore } from '@/lib/store/org-store';
import { useProgram } from '@/lib/queries/program';
import { Spacing } from '@/constants/theme';

function formatDate(value: string | null): string {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString();
}

export default function ProgramDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);
  const { data: program, isLoading } = useProgram(activeOrgSlug, id ?? null);

  if (isLoading || !program) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {program.name}
          </ThemedText>
          <ThemedText type="small" themeColor="primary">
            {program.status}
          </ThemedText>
        </View>

        {program.description && (
          <ThemedText type="default" themeColor="textMuted">
            {program.description}
          </ThemedText>
        )}

        <ThemedView type="backgroundElement" style={styles.card}>
          <DetailRow
            label="Capacity"
            value={program.capacity ? String(program.capacity) : 'Unlimited'}
          />
          <DetailRow label="Start date" value={formatDate(program.startDate)} />
          <DetailRow label="End date" value={formatDate(program.endDate)} />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="small" themeColor="textMuted">
        {label}
      </ThemedText>
      <ThemedText type="small">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.four, gap: Spacing.four },
  header: { gap: Spacing.one },
  title: { fontSize: 28, lineHeight: 34 },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
