import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';
import { usePullRefresh } from '@/hooks/use-pull-refresh';
import { useOrgStore } from '@/lib/store/org-store';
import { useChannels, useCreateChannel } from '@/lib/queries/channel';
import { useMyMembership } from '@/lib/queries/member';
import { useSubscription } from '@/lib/queries/subscription';
import type { Channel, OrgRole } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

const CAN_CREATE: OrgRole[] = ['owner', 'admin', 'mentor'];

export default function ChannelsScreen() {
  const theme = useTheme();
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);
  const { data: channels, isLoading, refetch } = useChannels(activeOrgSlug);
  const { data: myMembership } = useMyMembership(activeOrgSlug);
  const { data: subscription } = useSubscription(activeOrgSlug);
  const createChannel = useCreateChannel(activeOrgSlug ?? '');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useRefetchOnFocus(refetch);
  const { refreshing, onRefresh } = usePullRefresh(refetch);

  const canCreate = myMembership ? CAN_CREATE.includes(myMembership.role) : false;
  // Mirrors the web gate: free plan is capped at 1 channel (the default), so a
  // manager on Free sees an Upgrade link instead of a Create button.
  const isPro = subscription?.plan === 'pro' && subscription.status === 'active';
  const atFreeLimit = !isPro && (channels === undefined || channels.length >= 1);

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

  async function handleCreate() {
    if (!name.trim()) return;
    setError(null);
    try {
      await createChannel.mutateAsync({ name: name.trim() });
      setName('');
      setShowForm(false);
    } catch (err) {
      // Surface backend rejections (e.g. the Free-plan 1-channel limit) instead
      // of leaving the form looking frozen.
      setError((err as { message?: string })?.message ?? 'Unable to create channel.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Channels
          </ThemedText>
          {canCreate &&
            (showForm ? (
              <Pressable
                onPress={() => {
                  setShowForm(false);
                  setError(null);
                }}
                style={[styles.newBtn, styles.upgradeBtn, { borderColor: theme.border }]}
              >
                <ThemedText type="small" themeColor="textMuted">
                  Cancel
                </ThemedText>
              </Pressable>
            ) : atFreeLimit ? (
              <Link href="/(app)/profile/billing" asChild>
                <Pressable
                  style={StyleSheet.flatten([
                    styles.newBtn,
                    styles.upgradeBtn,
                    { borderColor: theme.border },
                  ])}
                >
                  <Ionicons name="lock-closed" size={12} color={theme.textMuted} />
                  <ThemedText type="small" themeColor="textMuted">
                    Upgrade
                  </ThemedText>
                </Pressable>
              </Link>
            ) : (
              <Pressable
                onPress={() => setShowForm(true)}
                style={[styles.newBtn, { backgroundColor: theme.primary }]}
              >
                <ThemedText type="small" style={{ color: '#fff' }}>
                  New
                </ThemedText>
              </Pressable>
            ))}
        </View>

        {showForm && (
          <View style={styles.createRow}>
            <TextInput
              placeholder="e.g. cohort-2026"
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={setName}
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            />
            <Pressable
              disabled={createChannel.isPending || !name.trim()}
              onPress={handleCreate}
              style={[
                styles.createBtn,
                {
                  backgroundColor: theme.primary,
                  opacity: createChannel.isPending || !name.trim() ? 0.6 : 1,
                },
              ]}
            >
              <ThemedText type="smallBold" style={{ color: '#fff' }}>
                Create
              </ThemedText>
            </Pressable>
          </View>
        )}

        {error && (
          <ThemedText type="small" themeColor="error">
            {error}
          </ThemedText>
        )}

        {isLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={channels ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
              />
            }
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textMuted">
                No channels yet.
              </ThemedText>
            }
            renderItem={({ item }) => <ChannelRow channel={item} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function ChannelRow({ channel }: { channel: Channel }) {
  return (
    <Link href={`/(app)/channels/${channel.id}`} asChild>
      <Pressable>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold"># {channel.name}</ThemedText>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, lineHeight: 38 },
  newBtn: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  upgradeBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, borderWidth: 1 },
  createRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  createBtn: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  listContent: { gap: Spacing.two, paddingBottom: Spacing.six },
  card: { borderRadius: Spacing.three, padding: Spacing.three },
});
