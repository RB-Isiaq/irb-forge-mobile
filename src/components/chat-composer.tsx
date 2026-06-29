import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmojiPicker, { type EmojiType } from 'rn-emoji-keyboard';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  placeholder: string;
}

/**
 * Casual chat composer for channels: a plain growing input with an emoji picker
 * and a send icon — no markdown toolbar (announcements use MarkdownComposer for
 * that). Markdown the user types still renders in the feed.
 */
export function ChatComposer({ value, onChangeText, onSend, sending, placeholder }: Props) {
  const theme = useTheme();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const canSend = !!value.trim() && !sending;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setEmojiOpen(true)}
        hitSlop={6}
        accessibilityLabel="Add emoji"
        style={styles.iconBtn}
      >
        <Ionicons name="happy-outline" size={24} color={theme.textMuted} />
      </Pressable>

      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
      />

      <Pressable
        disabled={!canSend}
        onPress={onSend}
        accessibilityLabel="Send"
        style={[styles.sendButton, { backgroundColor: theme.primary, opacity: canSend ? 1 : 0.6 }]}
      >
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="send" size={18} color="#fff" />
        )}
      </Pressable>

      <EmojiPicker
        open={emojiOpen}
        onClose={() => setEmojiOpen(false)}
        onEmojiSelected={(e: EmojiType) => onChangeText(value + e.emoji)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  iconBtn: { height: 44, alignItems: 'center', justifyContent: 'center' },
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
    width: 44,
    height: 44,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
