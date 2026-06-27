import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MarkdownContent } from '@/components/markdown-content';
import { MarkdownComposer } from '@/components/markdown-composer';
import { useTheme } from '@/hooks/use-theme';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';
import { usePullRefresh } from '@/hooks/use-pull-refresh';
import { useOrgStore } from '@/lib/store/org-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useChannelMessages, useChannels, useSendChannelMessage } from '@/lib/queries/channel';
import { useMyMembership } from '@/lib/queries/member';
import type { ChannelMessage } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

export default function ChannelDetailScreen() {
  const theme = useTheme();
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);
  const userId = useAuthStore((s) => s.user?.id);
  const { data: channels } = useChannels(activeOrgSlug);
  const channel = channels?.find((c) => c.id === channelId) ?? null;
  const { data: myMembership } = useMyMembership(activeOrgSlug);

  // Owner/admin or the channel's creator can manage members + delete; the
  // default channel is managed automatically, so no manage affordance there.
  const canManage =
    !!channel &&
    !channel.isDefault &&
    (myMembership?.role === 'owner' ||
      myMembership?.role === 'admin' ||
      (!!channel.createdById && channel.createdById === userId));

  const { data: messages, isLoading, refetch } = useChannelMessages(activeOrgSlug, channelId);
  const sendMessage = useSendChannelMessage(activeOrgSlug ?? '', channelId ?? '');
  const [content, setContent] = useState('');

  useRefetchOnFocus(refetch);
  const { refreshing, onRefresh } = usePullRefresh(refetch);

  if (!activeOrgSlug || !channelId) {
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

  async function handleSend() {
    if (!content.trim()) return;
    try {
      await sendMessage.mutateAsync({ content: content.trim() });
      setContent('');
    } catch (err) {
      // e.g. ChannelMemberGuard 403 if you're not a member of this channel.
      Alert.alert('Could not send', (err as { message?: string })?.message ?? 'Please try again.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: channel ? `#${channel.name}` : 'Channel',
          headerRight: canManage
            ? () => (
                <Pressable
                  hitSlop={8}
                  onPress={() =>
                    router.push({ pathname: '/(app)/channels/manage', params: { channelId } })
                  }
                >
                  <ThemedText type="small" style={{ color: theme.primary }}>
                    Manage
                  </ThemedText>
                </Pressable>
              )
            : undefined,
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <SafeAreaView style={styles.safeArea}>
          {isLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <FlatList
              inverted
              showsVerticalScrollIndicator={false}
              data={messages?.items ?? []}
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
                  No messages yet. Say hello!
                </ThemedText>
              }
              renderItem={({ item }) => <MessageRow message={item} />}
            />
          )}

          <MarkdownComposer
            value={content}
            onChangeText={setContent}
            onSend={handleSend}
            sending={sendMessage.isPending}
            placeholder="Message this channel…"
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function MessageRow({ message }: { message: ChannelMessage }) {
  const authorName = message.author
    ? `${message.author.firstName ?? ''} ${message.author.lastName ?? ''}`.trim() || 'Member'
    : 'Member';

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <MarkdownContent content={message.content} />
      <ThemedText type="small" themeColor="textMuted">
        {authorName} · {new Date(message.createdAt).toLocaleDateString()}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  centered: { justifyContent: 'center', alignItems: 'center' },
  listContent: { gap: Spacing.two, paddingBottom: Spacing.three },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.half },
});
