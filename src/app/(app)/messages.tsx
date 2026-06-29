import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MarkdownContent } from '@/components/markdown-content';
import { MarkdownComposer } from '@/components/markdown-composer';
import { useTheme } from '@/hooks/use-theme';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';
import { usePullRefresh } from '@/hooks/use-pull-refresh';
import { useOrgStore } from '@/lib/store/org-store';
import { useMessages, useSendMessage } from '@/lib/queries/message';
import { flattenPages } from '@/lib/queries/use-paginated-list';
import { useMyMembership } from '@/lib/queries/member';
import type { Message, OrgRole } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

// Who can post announcements — mirrors the web's `canPost` (owner/admin/mentor).
const CAN_POST: OrgRole[] = ['owner', 'admin', 'mentor'];

export default function MessagesScreen() {
  const theme = useTheme();
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);
  const {
    data: messages,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(activeOrgSlug);
  const messageItems = flattenPages(messages);
  const { data: myMembership } = useMyMembership(activeOrgSlug);
  const sendMessage = useSendMessage(activeOrgSlug ?? '');
  const [content, setContent] = useState('');

  useRefetchOnFocus(refetch);
  const { refreshing, onRefresh } = usePullRefresh(refetch);

  const canPost = myMembership ? CAN_POST.includes(myMembership.role) : false;

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

  async function handleSend() {
    if (!content.trim()) return;
    try {
      await sendMessage.mutateAsync({ content: content.trim() });
      setContent('');
    } catch (err) {
      Alert.alert('Could not post', (err as { message?: string })?.message ?? 'Please try again.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Announcements
            </ThemedText>
          </View>

          {isLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={messageItems}
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
                  No announcements yet.
                </ThemedText>
              }
              renderItem={({ item }) => <MessageRow message={item} />}
            />
          )}

          {/* Composing is limited to owner/admin/mentor; members read only. */}
          {canPost && (
            <MarkdownComposer
              value={content}
              onChangeText={setContent}
              onSend={handleSend}
              sending={sendMessage.isPending}
              placeholder="Write an announcement…"
            />
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function MessageRow({ message }: { message: Message }) {
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
    paddingTop: Spacing.five,
    gap: Spacing.three,
  },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  listContent: { gap: Spacing.two, paddingBottom: Spacing.three },
  footerSpinner: { marginVertical: Spacing.three },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.half },
});
