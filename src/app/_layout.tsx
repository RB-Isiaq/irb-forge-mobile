import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { AppState, useColorScheme, type AppStateStatus } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { focusManager, QueryClientProvider } from '@tanstack/react-query';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useTheme } from '@/hooks/use-theme';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/lib/store/auth-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // Paint the native root view the theme color so screen transitions and the
  // brief mount before a themed view renders never flash white (NativeTabs has
  // no `contentStyle` to theme the content area the way the Stack does).
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.background);
  }, [theme.background]);

  // React Query's refetchOnWindowFocus doesn't fire on React Native by default —
  // bridge it to AppState so returning from the background refetches stale data.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    });
    return () => sub.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
