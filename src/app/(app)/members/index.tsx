import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useOrgStore } from '@/lib/store/org-store';
import {
  useMembers,
  useMyMembership,
  useRemoveMember,
  useUpdateMemberRole,
} from '@/lib/queries/member';
import type { Membership, OrgRole } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

const ASSIGNABLE_ROLES: Exclude<OrgRole, 'owner'>[] = ['admin', 'mentor', 'member'];
const CAN_MANAGE_ROLES: OrgRole[] = ['owner', 'admin'];

export default function MembersScreen() {
  const theme = useTheme();
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);
  const { data: members, isLoading } = useMembers(activeOrgSlug);
  const { data: myMembership } = useMyMembership(activeOrgSlug);
  const updateRole = useUpdateMemberRole(activeOrgSlug ?? '');
  const removeMember = useRemoveMember(activeOrgSlug ?? '');
  const [managingUserId, setManagingUserId] = useState<string | null>(null);

  const canManage = myMembership ? CAN_MANAGE_ROLES.includes(myMembership.role) : false;

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
            Members
          </ThemedText>
          {canManage && (
            <Link href="/(app)/members/invite" asChild>
              <Pressable style={[styles.inviteBtn, { backgroundColor: theme.primary }]}>
                <ThemedText type="small" style={{ color: '#fff' }}>
                  Invite
                </ThemedText>
              </Pressable>
            </Link>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <FlatList
            data={members?.items ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textMuted">
                No members yet.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <MemberRow
                member={item}
                canManage={canManage && item.role !== 'owner'}
                isManaging={managingUserId === item.userId}
                onToggleManage={() =>
                  setManagingUserId(managingUserId === item.userId ? null : item.userId)
                }
                onChangeRole={(role) => {
                  updateRole.mutate({ userId: item.userId, data: { role } });
                  setManagingUserId(null);
                }}
                onRemove={() => {
                  removeMember.mutate(item.userId);
                  setManagingUserId(null);
                }}
              />
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function MemberRow({
  member,
  canManage,
  isManaging,
  onToggleManage,
  onChangeRole,
  onRemove,
}: {
  member: Membership;
  canManage: boolean;
  isManaging: boolean;
  onToggleManage: () => void;
  onChangeRole: (role: Exclude<OrgRole, 'owner'>) => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const name =
    `${member.user.firstName ?? ''} ${member.user.lastName ?? ''}`.trim() || member.user.email;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.cardInfo}>
          <ThemedText type="smallBold">{name}</ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {member.user.email}
          </ThemedText>
        </View>
        <RoleBadge role={member.role} />
        {canManage && (
          <Pressable onPress={onToggleManage} style={styles.manageButton}>
            <ThemedText type="link" themeColor="primary">
              {isManaging ? 'Close' : 'Manage'}
            </ThemedText>
          </Pressable>
        )}
      </View>

      {isManaging && (
        <View style={styles.manageRow}>
          {ASSIGNABLE_ROLES.filter((r) => r !== member.role).map((role) => (
            <Pressable
              key={role}
              onPress={() => onChangeRole(role)}
              style={[styles.roleOption, { borderColor: theme.border }]}
            >
              <ThemedText type="small">Make {role}</ThemedText>
            </Pressable>
          ))}
          <Pressable onPress={onRemove} style={[styles.roleOption, { borderColor: theme.error }]}>
            <ThemedText type="small" themeColor="error">
              Remove
            </ThemedText>
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

function RoleBadge({ role }: { role: OrgRole }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
      <ThemedText type="small" themeColor="primary">
        {role}
      </ThemedText>
    </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, lineHeight: 38 },
  inviteBtn: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  listContent: { gap: Spacing.two, paddingBottom: Spacing.six },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  cardInfo: { flex: 1, gap: Spacing.half },
  badge: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  manageButton: { paddingHorizontal: Spacing.one },
  manageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  roleOption: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
});
