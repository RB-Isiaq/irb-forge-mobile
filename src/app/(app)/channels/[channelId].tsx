import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MarkdownContent } from '@/components/markdown-content';
import { ChatComposer } from '@/components/chat-composer';
import { InitialsAvatar } from '@/components/initials-avatar';
import { useTheme } from '@/hooks/use-theme';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';
import { usePullRefresh } from '@/hooks/use-pull-refresh';
import { useOrgStore } from '@/lib/store/org-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useChannelMessages, useChannels, useSendChannelMessage } from '@/lib/queries/channel';
import { useMyMembership } from '@/lib/queries/member';
import type { ChannelMessage } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';
import { formatDayDivider, formatTime, isSameDay } from '@/lib/date';

// Same author within this window (and same day) collapses into one group —
// avatar + name shown once, Slack/Discord-style.
const GROUP_WINDOW_MS = 5 * 60 * 1000;
const AVATAR_SIZE = 36;
const AVATAR_GUTTER = AVATAR_SIZE + 10;

function authorNameOf(message: ChannelMessage): string {
  return message.author
    ? `${message.author.firstName ?? ''} ${message.author.lastName ?? ''}`.trim() || 'Member'
    : 'Member';
}

export default function ChannelDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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

  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChannelMessages(activeOrgSlug, channelId);
  // Pages are newest-first; flattening keeps a single continuous DESC list that
  // the inverted FlatList renders bottom-up (newest at the bottom).
  const allMessages = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
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
        behavior="padding"
        keyboardVerticalOffset={insets.top + (Platform.OS === 'ios' ? 44 : 56)}
      >
        {/* The stack header already covers the top inset — don't pad it again. */}
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
          {isLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <FlatList
              inverted
              showsVerticalScrollIndicator={false}
              data={allMessages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              onEndReachedThreshold={0.4}
              onEndReached={() => {
                // Inverted: the list's "end" is the visual top — load older here.
                if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
              }}
              ListFooterComponent={
                // Footer of an inverted list renders at the top: the load-older spinner.
                isFetchingNextPage ? (
                  <ActivityIndicator color={theme.primary} style={styles.olderSpinner} />
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
                  No messages yet. Say hello!
                </ThemedText>
              }
              renderItem={({ item, index }) => {
                // Data is newest-first (DESC) and the list is inverted, so the
                // message rendered *above* this one (older) is items[index + 1].
                const older = allMessages[index + 1];
                const grouped =
                  !!older &&
                  older.authorId === item.authorId &&
                  isSameDay(older.createdAt, item.createdAt) &&
                  new Date(item.createdAt).getTime() - new Date(older.createdAt).getTime() <=
                    GROUP_WINDOW_MS;
                const showDivider = !older || !isSameDay(older.createdAt, item.createdAt);
                return (
                  <ChannelMessageItem
                    message={item}
                    showHeader={!grouped}
                    showDivider={showDivider}
                  />
                );
              }}
            />
          )}

          <ChatComposer
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

function ChannelMessageItem({
  message,
  showHeader,
  showDivider,
}: {
  message: ChannelMessage;
  showHeader: boolean;
  showDivider: boolean;
}) {
  const theme = useTheme();
  const name = authorNameOf(message);

  return (
    <View>
      {showDivider && (
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <ThemedText type="small" themeColor="textMuted">
            {formatDayDivider(message.createdAt)}
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>
      )}

      {showHeader ? (
        <View style={[styles.headerRow, showDivider && styles.noTopGap]}>
          <InitialsAvatar name={name} seed={message.authorId ?? name} size={AVATAR_SIZE} />
          <View style={styles.headerBody}>
            <View style={styles.nameRow}>
              <ThemedText type="smallBold">{name}</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                {formatTime(message.createdAt)}
              </ThemedText>
            </View>
            <MarkdownContent content={message.content} />
          </View>
        </View>
      ) : (
        <View style={styles.continuation}>
          <MarkdownContent content={message.content} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    gap: Spacing.three,
  },
  centered: { justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingVertical: Spacing.two },
  olderSpinner: { marginVertical: Spacing.three },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginVertical: Spacing.three,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  headerRow: { flexDirection: 'row', gap: 10, marginTop: Spacing.three },
  noTopGap: { marginTop: 0 },
  headerBody: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  continuation: { paddingLeft: AVATAR_GUTTER, marginTop: 2 },
});
