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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';
import { useOrgStore } from '@/lib/store/org-store';
import { useMessages, useSendMessage } from '@/lib/queries/message';
import { useMyMembership } from '@/lib/queries/member';
import type { Message, OrgRole } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

// Who can post announcements — mirrors the web's `canPost` (owner/admin/mentor).
const CAN_POST: OrgRole[] = ['owner', 'admin', 'mentor'];

export default function MessagesScreen() {
  const theme = useTheme();
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);
  const { data: messages, isLoading, refetch, isRefetching } = useMessages(activeOrgSlug);
  const { data: myMembership } = useMyMembership(activeOrgSlug);
  const sendMessage = useSendMessage(activeOrgSlug ?? '');
  const [content, setContent] = useState('');

  useRefetchOnFocus(refetch);

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
    await sendMessage.mutateAsync({ content: content.trim() });
    setContent('');
  }

  return (
    <ThemedView style={styles.container}>
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
            data={messages?.items ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
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
          <View style={styles.composer}>
            <TextInput
              placeholder="Write an announcement…"
              placeholderTextColor={theme.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            />
            <Pressable
              disabled={sendMessage.isPending || !content.trim()}
              onPress={handleSend}
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.primary,
                  opacity: sendMessage.isPending || !content.trim() ? 0.6 : 1,
                },
              ]}
            >
              {sendMessage.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText type="smallBold" style={{ color: '#fff' }}>
                  Send
                </ThemedText>
              )}
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function MessageRow({ message }: { message: Message }) {
  const authorName = message.author
    ? `${message.author.firstName ?? ''} ${message.author.lastName ?? ''}`.trim() || 'Member'
    : 'Member';

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="small">{message.content}</ThemedText>
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
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.half },
  composer: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-end',
    paddingBottom: Spacing.three,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
