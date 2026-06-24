import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/lib/store/auth-store';
import { useChangePassword, useUpdateProfile } from '@/lib/queries/user';
import { Spacing } from '@/constants/theme';

export default function AccountSettingsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <UpdateProfileSection />
        <ChangePasswordSection />
      </ScrollView>
    </ThemedView>
  );
}

function UpdateProfileSection() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    setStatus(null);
    try {
      await updateProfile.mutateAsync({ firstName: firstName.trim(), lastName: lastName.trim() });
      setStatus('Profile updated.');
    } catch (err) {
      setStatus((err as { message?: string })?.message ?? 'Unable to update profile.');
    }
  }

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">Profile</ThemedText>
      <Field label="First name">
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        />
      </Field>
      <Field label="Last name">
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        />
      </Field>
      {status && (
        <ThemedText type="small" themeColor="textMuted">
          {status}
        </ThemedText>
      )}
      <Pressable
        disabled={updateProfile.isPending}
        onPress={save}
        style={[
          styles.button,
          { backgroundColor: theme.primary, opacity: updateProfile.isPending ? 0.6 : 1 },
        ]}
      >
        {updateProfile.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText type="smallBold" style={{ color: '#fff' }}>
            Save profile
          </ThemedText>
        )}
      </Pressable>
    </View>
  );
}

function ChangePasswordSection() {
  const theme = useTheme();
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const canSubmit =
    currentPassword.length > 0 && newPassword.length >= 8 && !changePassword.isPending;

  async function save() {
    setStatus(null);
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setStatus('Password changed.');
    } catch (err) {
      setStatus((err as { message?: string })?.message ?? 'Unable to change password.');
    }
  }

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">Change password</ThemedText>
      <Field label="Current password">
        <TextInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Current password"
          placeholderTextColor={theme.textMuted}
          secureTextEntry
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        />
      </Field>
      <Field label="New password (min 8 chars)">
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password"
          placeholderTextColor={theme.textMuted}
          secureTextEntry
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        />
      </Field>
      {status && (
        <ThemedText type="small" themeColor="textMuted">
          {status}
        </ThemedText>
      )}
      <Pressable
        disabled={!canSubmit}
        onPress={save}
        style={[styles.button, { backgroundColor: theme.primary, opacity: canSubmit ? 1 : 0.6 }]}
      >
        {changePassword.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText type="smallBold" style={{ color: '#fff' }}>
            Change password
          </ThemedText>
        )}
      </Pressable>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.five },
  section: { gap: Spacing.two },
  field: { gap: Spacing.one },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
  },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
});
