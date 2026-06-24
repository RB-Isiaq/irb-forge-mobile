import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useOrgStore } from '@/lib/store/org-store';
import { useMyOrgEnrollments } from '@/lib/queries/enrollment';
import type { Enrollment, EnrollmentStatus } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

const STATUS_COLOR: Record<EnrollmentStatus, 'success' | 'primary' | 'textMuted'> = {
  active: 'success',
  completed: 'primary',
  dropped: 'textMuted',
};

export default function MyEnrollmentsScreen() {
  const theme = useTheme();
  const slug = useOrgStore((s) => s.activeOrgSlug);
  const { data: enrollments, isLoading } = useMyOrgEnrollments(slug);

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={enrollments ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textMuted">
              You are not enrolled in any programs yet.
            </ThemedText>
          }
          renderItem={({ item }) => <EnrollmentRow enrollment={item} />}
        />
      )}
    </ThemedView>
  );
}

function EnrollmentRow({ enrollment }: { enrollment: Enrollment }) {
  const programName = enrollment.program?.name ?? 'Program';
  return (
    <Link href={`/(app)/programs/${enrollment.programId}`} asChild>
      <Pressable>
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardRow}>
            <ThemedText type="smallBold" style={styles.name}>
              {programName}
            </ThemedText>
            <ThemedText type="small" themeColor={STATUS_COLOR[enrollment.status]}>
              {enrollment.status}
            </ThemedText>
          </View>
          {enrollment.program?.description && (
            <ThemedText type="small" themeColor="textMuted">
              {enrollment.program.description}
            </ThemedText>
          )}
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: Spacing.four, gap: Spacing.two },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.one },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { flex: 1 },
});
