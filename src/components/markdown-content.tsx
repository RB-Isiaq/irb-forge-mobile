import { useMemo } from 'react';
import { Linking, Platform, type TextStyle, type ViewStyle } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { useTheme } from '@/hooks/use-theme';

type Theme = ReturnType<typeof useTheme>;

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

/**
 * Renders message content as markdown, matching the web app (react-markdown +
 * remark-gfm). Messages are authored as markdown plaintext on web, so the native
 * client must render it rather than show raw `**`/`#` syntax. Styles are themed
 * and tuned tight for chat bubbles (minimal paragraph spacing).
 */
export function MarkdownContent({ content }: { content: string }) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Markdown
      style={styles}
      onLinkPress={(url) => {
        void Linking.openURL(url);
        return false;
      }}
    >
      {content}
    </Markdown>
  );
}

function makeStyles(theme: Theme): Record<string, TextStyle | ViewStyle> {
  return {
    body: { color: theme.text, fontSize: 14, lineHeight: 20 },
    paragraph: { marginTop: 0, marginBottom: 6 },
    heading1: { color: theme.text, fontSize: 20, fontWeight: '700', marginBottom: 4 },
    heading2: { color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
    heading3: { color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
    strong: { fontWeight: '700' },
    em: { fontStyle: 'italic' },
    s: { textDecorationLine: 'line-through' },
    link: { color: theme.primary, textDecorationLine: 'underline' },
    blockquote: {
      backgroundColor: theme.backgroundElement,
      borderColor: theme.border,
      borderLeftWidth: 3,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginVertical: 2,
    },
    bullet_list: { marginVertical: 2 },
    ordered_list: { marginVertical: 2 },
    code_inline: {
      backgroundColor: theme.backgroundElement,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 4,
      color: theme.text,
      fontFamily: mono,
      fontSize: 13,
    },
    code_block: {
      backgroundColor: theme.backgroundElement,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      color: theme.text,
      fontFamily: mono,
      fontSize: 13,
      padding: 8,
    },
    fence: {
      backgroundColor: theme.backgroundElement,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      color: theme.text,
      fontFamily: mono,
      fontSize: 13,
      padding: 8,
    },
    hr: { backgroundColor: theme.border, height: 1, marginVertical: 6 },
    table: { borderColor: theme.border, borderWidth: 1, borderRadius: 6 },
    th: { padding: 6 },
    td: { padding: 6, borderColor: theme.border },
  };
}
