import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useOrgStore } from '@/lib/store/org-store';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  useAddChannelMember,
  useChannelMembers,
  useChannels,
  useDeleteChannel,
  useRemoveChannelMember,
} from '@/lib/queries/channel';
import { useMembers, useMyMembership } from '@/lib/queries/member';
import { flattenPages } from '@/lib/queries/use-paginated-list';
import type { OrgRole } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

const MANAGER_ROLES: OrgRole[] = ['owner', 'admin'];

type NamedUser = { firstName: string | null; lastName: string | null; email: string } | undefined;

function displayName(user: NamedUser): string {
  if (!user) return 'Member';
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email;
}

export default function ManageChannelScreen() {
  const theme = useTheme();
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);
  const userId = useAuthStore((s) => s.user?.id);

  const { data: channels } = useChannels(activeOrgSlug);
  const channel = channels?.find((c) => c.id === channelId) ?? null;
  const {
    data: members,
    isLoading: membersLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMembers(activeOrgSlug);
  // Drain every page so the add-member picker offers all org members, not just
  // the first page.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const { data: myMembership } = useMyMembership(activeOrgSlug);

  // Mirrors the backend's `assertCanManageMembers`: org owner/admin, or the
  // channel's creator. The default channel manages its own membership.
  const isManagerRole = myMembership ? MANAGER_ROLES.includes(myMembership.role) : false;
  const isCreator = !!channel?.createdById && channel.createdById === userId;
  const canManage = !!channel && !channel.isDefault && (isManagerRole || isCreator);
  const canDelete = !!channel && !channel.isDefault && isManagerRole;

  // The members endpoint is manager-gated on the backend; only fetch when allowed.
  const { data: channelMembers, isLoading: channelMembersLoading } = useChannelMembers(
    activeOrgSlug,
    channelId,
    canManage
  );
  const addMember = useAddChannelMember(activeOrgSlug ?? '', channelId ?? '');
  const removeMember = useRemoveChannelMember(activeOrgSlug ?? '', channelId ?? '');
  const deleteChannel = useDeleteChannel(activeOrgSlug ?? '');

  const [pendingId, setPendingId] = useState<string | null>(null);

  if (!activeOrgSlug || !channelId || !channel) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Manage channel' }} />
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <ThemedText type="default" themeColor="textMuted">
            Channel not found.
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!canManage) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: `#${channel.name}` }} />
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <ThemedText type="default" themeColor="textMuted">
            Only the channel creator or an org owner/admin can manage this channel.
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const memberIds = new Set((channelMembers ?? []).map((m) => m.userId));
  const candidates = flattenPages(members).filter((m) => !memberIds.has(m.userId));

  function handleAdd(targetUserId: string) {
    setPendingId(targetUserId);
    addMember.mutate(
      { userId: targetUserId },
      {
        onError: (err) =>
          Alert.alert(
            'Could not add',
            (err as { message?: string })?.message ?? 'Please try again.'
          ),
        onSettled: () => setPendingId(null),
      }
    );
  }

  function handleRemove(targetUserId: string, name: string) {
    Alert.alert('Remove member', `Remove ${name} from #${channel?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setPendingId(targetUserId);
          removeMember.mutate(targetUserId, {
            onError: (err) =>
              Alert.alert(
                'Could not remove',
                (err as { message?: string })?.message ?? 'Please try again.'
              ),
            onSettled: () => setPendingId(null),
          });
        },
      },
    ]);
  }

  function handleDelete() {
    Alert.alert('Delete channel', `Delete #${channel?.name}? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteChannel.mutate(channelId, {
            onSuccess: () => router.dismissAll(),
            onError: (err) =>
              Alert.alert(
                'Could not delete',
                (err as { message?: string })?.message ?? 'Please try again.'
              ),
          }),
      },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: `#${channel.name}` }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedText type="smallBold">Members</ThemedText>
          {channelMembersLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            (channelMembers ?? []).map((m) => {
              const name = displayName(m.user);
              const isSelf = m.userId === userId;
              const busy = pendingId === m.userId;
              return (
                <ThemedView key={m.id} type="backgroundElement" style={styles.row}>
                  <View style={styles.rowText}>
                    <ThemedText type="smallBold">{isSelf ? `${name} (you)` : name}</ThemedText>
                  </View>
                  {!isSelf && (
                    <Pressable
                      disabled={busy}
                      onPress={() => handleRemove(m.userId, name)}
                      style={[
                        styles.pillBtn,
                        { borderColor: theme.error, opacity: busy ? 0.6 : 1 },
                      ]}
                    >
                      {busy ? (
                        <ActivityIndicator color={theme.error} />
                      ) : (
                        <ThemedText type="small" themeColor="error">
                          Remove
                        </ThemedText>
                      )}
                    </Pressable>
                  )}
                </ThemedView>
              );
            })
          )}

          <ThemedText type="smallBold" style={styles.sectionGap}>
            Add members
          </ThemedText>
          {membersLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : candidates.length === 0 ? (
            <ThemedText type="small" themeColor="textMuted">
              Everyone in the org is already in this channel.
            </ThemedText>
          ) : (
            candidates.map((m) => {
              const name = displayName(m.user);
              const busy = pendingId === m.userId;
              return (
                <ThemedView key={m.id} type="backgroundElement" style={styles.row}>
                  <View style={styles.rowText}>
                    <ThemedText type="smallBold">{name}</ThemedText>
                    <ThemedText type="small" themeColor="textMuted">
                      {m.role}
                    </ThemedText>
                  </View>
                  <Pressable
                    disabled={busy}
                    onPress={() => handleAdd(m.userId)}
                    style={[
                      styles.pillBtn,
                      {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                        opacity: busy ? 0.6 : 1,
                      },
                    ]}
                  >
                    {busy ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText type="small" style={{ color: '#fff' }}>
                        Add
                      </ThemedText>
                    )}
                  </Pressable>
                </ThemedView>
              );
            })
          )}

          {canDelete && (
            <Pressable
              disabled={deleteChannel.isPending}
              onPress={handleDelete}
              style={[
                styles.deleteBtn,
                { borderColor: theme.error, opacity: deleteChannel.isPending ? 0.6 : 1 },
              ]}
            >
              <ThemedText type="smallBold" themeColor="error">
                {deleteChannel.isPending ? 'Deleting…' : 'Delete channel'}
              </ThemedText>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  scrollContent: { gap: Spacing.two, paddingBottom: Spacing.six },
  centered: { justifyContent: 'center', alignItems: 'center' },
  sectionGap: { marginTop: Spacing.three },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  rowText: { gap: Spacing.half, flex: 1 },
  pillBtn: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    minWidth: 76,
    alignItems: 'center',
  },
  deleteBtn: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two + 2,
    alignItems: 'center',
    marginTop: Spacing.four,
  },
});
