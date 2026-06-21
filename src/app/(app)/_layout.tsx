import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { useAuthStore } from '@/lib/store/auth-store';

export default function AppLayout() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const user = useAuthStore((s) => s.user);

  // Defensive guard for deep links straight into (app) — the root index.tsx
  // gate handles the common case, this covers direct navigation.
  if (isInitialized && !user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <AppTabs />;
}
