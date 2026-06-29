import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';
import { usePullRefresh } from '@/hooks/use-pull-refresh';
import { useOrgStore } from '@/lib/store/org-store';
import { usePrograms } from '@/lib/queries/program';
import { flattenPages } from '@/lib/queries/use-paginated-list';
import { useMyMembership } from '@/lib/queries/member';
import type { OrgRole, Program, ProgramStatus } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

const STATUS_COLOR: Record<ProgramStatus, 'success' | 'primary' | 'textMuted' | 'error'> = {
  active: 'success',
  draft: 'textMuted',
  completed: 'primary',
  cancelled: 'error',
};

const CAN_MANAGE: OrgRole[] = ['owner', 'admin'];

export default function ProgramsScreen() {
  const theme = useTheme();
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);
  const {
    data: programs,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePrograms(activeOrgSlug);
  const programItems = flattenPages(programs);
  const { data: myMembership } = useMyMembership(activeOrgSlug);
  const canManage = myMembership ? CAN_MANAGE.includes(myMembership.role) : false;

  useRefetchOnFocus(refetch);
  const { refreshing, onRefresh } = usePullRefresh(refetch);

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
          <View style={styles.headerActions}>
            <Link href="/(app)/programs/my-enrollments" asChild>
              <Pressable>
                <ThemedText type="link" themeColor="primary">
                  My enrollments
                </ThemedText>
              </Pressable>
            </Link>
            {canManage && (
              <Link href="/(app)/programs/new" asChild>
                <Pressable
                  style={StyleSheet.flatten([styles.newBtn, { backgroundColor: theme.primary }])}
                >
                  <ThemedText type="small" style={{ color: '#fff' }}>
                    + New
                  </ThemedText>
                </Pressable>
              </Link>
            )}
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={programItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
            }}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator color={theme.primary} style={styles.footerSpinner} />
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
              />
            }
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
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    gap: Spacing.three,
  },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  title: { fontSize: 32, lineHeight: 38 },
  newBtn: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  listContent: { gap: Spacing.two, paddingBottom: Spacing.six },
  footerSpinner: { marginVertical: Spacing.three },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.one },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { flex: 1 },
});
