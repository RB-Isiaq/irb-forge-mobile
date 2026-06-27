import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function ChannelsLayout() {
  const theme = useTheme();
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[channelId]" options={{ title: 'Channel' }} />
      <Stack.Screen name="manage" options={{ title: 'Manage channel' }} />
    </Stack>
  );
}
