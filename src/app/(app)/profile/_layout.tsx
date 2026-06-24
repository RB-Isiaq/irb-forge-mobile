import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function ProfileLayout() {
  const theme = useTheme();
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: 'Account settings' }} />
      <Stack.Screen name="org-settings" options={{ title: 'Organization settings' }} />
      <Stack.Screen name="billing" options={{ title: 'Billing' }} />
    </Stack>
  );
}
