/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  // useColorScheme can return 'light' | 'dark' | 'unspecified' | null | undefined
  // (null when the system scheme is undetermined). Anything that isn't 'dark'
  // falls back to the light palette so we never index Colors with a bad key.
  const scheme = useColorScheme();

  return scheme === 'dark' ? Colors.dark : Colors.light;
}
