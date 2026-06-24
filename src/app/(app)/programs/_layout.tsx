import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function ProgramsLayout() {
  const theme = useTheme();
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: 'Program' }} />
      <Stack.Screen name="new" options={{ title: 'New program', presentation: 'modal' }} />
      <Stack.Screen name="my-enrollments" options={{ title: 'My enrollments' }} />
    </Stack>
  );
}
