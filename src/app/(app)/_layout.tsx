import { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import * as Notifications from 'expo-notifications';

import AppTabs from '@/components/app-tabs';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOrgStore } from '@/lib/store/org-store';
import { registerForPushNotificationsAsync } from '@/lib/notifications/push';
import { userApi } from '@/lib/api/auth';

export default function AppLayout() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    void registerForPushNotificationsAsync().then((token) => {
      if (token) void userApi.savePushToken(token);
    });
  }, [user]);

  // Tapping a notification can deep-link via a `url` in its data payload.
  // An `orgSlug` switches the active org first, so org-scoped routes (like
  // /messages) resolve against the org the notification is actually about.
  useEffect(() => {
    if (!user) return;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const { url, orgSlug } = response.notification.request.content.data ?? {};
      if (typeof orgSlug === 'string') {
        useOrgStore.getState().setActiveOrgSlug(orgSlug);
      }
      if (typeof url === 'string') {
        router.push(url as Href);
      }
    });
    return () => sub.remove();
  }, [user]);

  // Defensive guard for deep links straight into (app) — the root index.tsx
  // gate handles the common case, this covers direct navigation.
  if (isInitialized && !user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <AppTabs />;
}
