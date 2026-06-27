import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MarkdownContent } from '@/components/markdown-content';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  placeholder: string;
  sendLabel?: string;
}

/**
 * Message composer with a Write/Preview toggle, mirroring the web announcement
 * editor. Messages are markdown, so the preview renders exactly what the feed
 * will show. Shared by the announcements and channel composers.
 */
export function MarkdownComposer({
  value,
  onChangeText,
  onSend,
  sending,
  placeholder,
  sendLabel = 'Send',
}: Props) {
  const theme = useTheme();
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const canSend = !!value.trim() && !sending;

  // Derive the shown mode instead of syncing it in an effect: an empty value
  // forces Write, so after a send clears the input we're back to Write with no
  // "Nothing to preview yet" flash, and previewing emptiness isn't possible.
  const activeMode = value.trim() ? mode : 'write';

  return (
    <View style={styles.wrap}>
      <View style={styles.tabs}>
        {(['write', 'preview'] as const).map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={styles.tab} hitSlop={6}>
            <ThemedText
              type="small"
              style={{
                color: activeMode === m ? theme.primary : theme.textMuted,
                fontWeight: activeMode === m ? '600' : '400',
              }}
            >
              {m === 'write' ? 'Write' : 'Preview'}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.inputRow}>
        {activeMode === 'write' ? (
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={theme.textMuted}
            value={value}
            onChangeText={onChangeText}
            multiline
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          />
        ) : (
          <ScrollView
            style={[styles.preview, { borderColor: theme.border }]}
            contentContainerStyle={styles.previewContent}
            showsVerticalScrollIndicator={false}
          >
            {value.trim() ? (
              <MarkdownContent content={value} />
            ) : (
              <ThemedText type="small" themeColor="textMuted" style={styles.empty}>
                Nothing to preview yet.
              </ThemedText>
            )}
          </ScrollView>
        )}

        <Pressable
          disabled={!canSend}
          onPress={onSend}
          style={[
            styles.sendButton,
            { backgroundColor: theme.primary, opacity: canSend ? 1 : 0.6 },
          ]}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText type="smallBold" style={{ color: '#fff' }}>
              {sendLabel}
            </ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.one, paddingBottom: Spacing.three },
  tabs: { flexDirection: 'row', gap: Spacing.three },
  tab: { paddingVertical: Spacing.half },
  inputRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-end' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    maxHeight: 100,
  },
  preview: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    minHeight: 44,
    maxHeight: 120,
  },
  previewContent: { paddingVertical: Spacing.two },
  empty: { fontStyle: 'italic' },
  sendButton: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
