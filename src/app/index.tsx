import { ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/lib/store/auth-store';

export default function AuthGate() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const user = useAuthStore((s) => s.user);
  const theme = useTheme();

  if (!isInitialized) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.primary} />
      </ThemedView>
    );
  }

  return <Redirect href={user ? '/(app)' : '/(auth)/sign-in'} />;
}
