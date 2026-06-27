import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextStyle,
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

type Tool =
  | {
      kind: 'wrap';
      before: string;
      after: string;
      placeholder: string;
      label: string;
      style?: TextStyle;
    }
  | { kind: 'prefix'; prefix: string; label: string; style?: TextStyle };

const TOOL_ORDER = [
  'heading',
  'bold',
  'italic',
  'quote',
  'code',
  'link',
  'orderedList',
  'bulletList',
  'taskList',
] as const;

type ToolKey = (typeof TOOL_ORDER)[number];

// Mirrors the web composer's toolbar (features/org/send-message).
const TOOLS: Record<ToolKey, Tool> = {
  heading: { kind: 'prefix', prefix: '## ', label: 'H' },
  bold: {
    kind: 'wrap',
    before: '**',
    after: '**',
    placeholder: 'bold text',
    label: 'B',
    style: { fontWeight: '700' },
  },
  italic: {
    kind: 'wrap',
    before: '_',
    after: '_',
    placeholder: 'italic text',
    label: 'I',
    style: { fontStyle: 'italic' },
  },
  quote: { kind: 'prefix', prefix: '> ', label: '❝' },
  code: { kind: 'wrap', before: '`', after: '`', placeholder: 'code', label: '</>' },
  link: { kind: 'wrap', before: '[', after: '](url)', placeholder: 'link text', label: 'Link' },
  orderedList: { kind: 'prefix', prefix: '1. ', label: '1.' },
  bulletList: { kind: 'prefix', prefix: '- ', label: '•' },
  taskList: { kind: 'prefix', prefix: '- [ ] ', label: '☑' },
};

/**
 * Message composer with a Write/Preview toggle and a markdown toolbar, mirroring
 * the web announcement editor. The toolbar wraps the selection (or inserts a
 * placeholder) / prefixes the current line(s); the preview renders exactly what
 * the feed will show. Shared by the announcements and channel composers.
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
  const inputRef = useRef<TextInput>(null);
  const selection = useRef({ start: value.length, end: value.length });
  // Set only right after a toolbar action so the cursor lands correctly; cleared
  // on the next selection event so normal typing stays uncontrolled.
  const [forcedSelection, setForcedSelection] = useState<{ start: number; end: number } | null>(
    null
  );

  const canSend = !!value.trim() && !sending;
  // An empty value forces Write, so a send (which clears the input) returns us to
  // Write with no empty-preview flash, and previewing emptiness isn't possible.
  const activeMode = value.trim() ? mode : 'write';

  function applyTool(key: ToolKey) {
    const tool = TOOLS[key];
    const { start, end } = selection.current;
    let next: string;
    let nextStart: number;
    let nextEnd: number;

    if (tool.kind === 'wrap') {
      const inner = value.slice(start, end) || tool.placeholder;
      next = value.slice(0, start) + tool.before + inner + tool.after + value.slice(end);
      nextStart = start + tool.before.length;
      nextEnd = nextStart + inner.length;
    } else {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const rawEnd = start === end ? value.indexOf('\n', end) : end;
      const lineEnd = rawEnd === -1 ? value.length : rawEnd;
      const block = value.slice(lineStart, lineEnd);
      const prefixed = block
        .split('\n')
        .map((line, idx) => (idx === 0 || line.trim() ? tool.prefix + line : line))
        .join('\n');
      next = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
      nextStart = lineStart + tool.prefix.length;
      nextEnd = lineStart + prefixed.length;
    }

    onChangeText(next);
    selection.current = { start: nextStart, end: nextEnd };
    setForcedSelection({ start: nextStart, end: nextEnd });
    inputRef.current?.focus();
  }

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

      {activeMode === 'write' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.toolbar}
        >
          {TOOL_ORDER.map((key) => (
            <Pressable
              key={key}
              onPress={() => applyTool(key)}
              hitSlop={4}
              style={[styles.toolBtn, { borderColor: theme.border }]}
            >
              <ThemedText type="small" style={[{ color: theme.textMuted }, TOOLS[key].style]}>
                {TOOLS[key].label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={styles.inputRow}>
        {activeMode === 'write' ? (
          <TextInput
            ref={inputRef}
            placeholder={placeholder}
            placeholderTextColor={theme.textMuted}
            value={value}
            onChangeText={onChangeText}
            selection={forcedSelection ?? undefined}
            onSelectionChange={(e) => {
              selection.current = e.nativeEvent.selection;
              if (forcedSelection) setForcedSelection(null);
            }}
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
  toolbar: { gap: Spacing.one, paddingVertical: Spacing.half },
  toolBtn: {
    borderWidth: 1,
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
