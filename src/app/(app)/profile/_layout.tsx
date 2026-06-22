import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: 'Account settings' }} />
      <Stack.Screen name="org-settings" options={{ title: 'Organization settings' }} />
      <Stack.Screen name="billing" options={{ title: 'Billing' }} />
    </Stack>
  );
}
