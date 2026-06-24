import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function MembersLayout() {
  const theme = useTheme();
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="invite" options={{ title: 'Invite members' }} />
    </Stack>
  );
}
