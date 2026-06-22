import { Stack } from 'expo-router';

export default function MembersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="invite" options={{ title: 'Invite members' }} />
    </Stack>
  );
}
