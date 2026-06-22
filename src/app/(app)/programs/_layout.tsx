import { Stack } from 'expo-router';

export default function ProgramsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: 'Program' }} />
      <Stack.Screen name="new" options={{ title: 'New program', presentation: 'modal' }} />
      <Stack.Screen name="my-enrollments" options={{ title: 'My enrollments' }} />
    </Stack>
  );
}
