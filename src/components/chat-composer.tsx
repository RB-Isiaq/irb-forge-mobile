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
 * Casual chat composer for channels: an emoji button + plain growing input in a
 * single pill, with a round send button alongside (WhatsApp-style) — no markdown
 * toolbar (announcements use MarkdownComposer). Markdown the user types still
 * renders in the feed.
 */
export function ChatComposer({ value, onChangeText, onSend, sending, placeholder }: Props) {
  const theme = useTheme();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const canSend = !!value.trim() && !sending;

  return (
    <View style={styles.wrap}>
      <View style={[styles.pill, { borderColor: theme.border, backgroundColor: theme.background }]}>
        <Pressable
          onPress={() => setEmojiOpen(true)}
          hitSlop={6}
          accessibilityLabel="Add emoji"
          style={styles.emojiBtn}
        >
          <Ionicons name="happy-outline" size={24} color={theme.textMuted} />
        </Pressable>

        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline
          style={[styles.input, { color: theme.text }]}
        />
      </View>

      <Pressable
        disabled={!canSend}
        onPress={onSend}
        accessibilityLabel="Send"
        style={[styles.sendButton, { backgroundColor: theme.primary, opacity: canSend ? 1 : 0.5 }]}
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
        theme={{
          backdrop: '#00000066',
          knob: theme.textMuted,
          container: theme.backgroundElement,
          header: theme.textMuted,
          skinTonesContainer: theme.background,
          category: {
            icon: theme.textMuted,
            iconActive: '#fff',
            container: theme.background,
            containerActive: theme.primary,
          },
        }}
      />
    </View>
  );
}

const SIZE = 44;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: SIZE / 2,
    minHeight: SIZE,
    maxHeight: 120,
    paddingLeft: Spacing.one,
    paddingRight: Spacing.three,
  },
  emojiBtn: { width: 36, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    paddingVertical: Spacing.two,
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 112,
  },
  sendButton: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
