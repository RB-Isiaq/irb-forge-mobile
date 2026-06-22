import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { userApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { Spacing } from '@/constants/theme';

export default function VerifyEmailScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const logout = useAuthStore((s) => s.logout);

  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleVerify() {
    setError(null);
    setSubmitting(true);
    try {
      await userApi.verifyEmail({ otp });
      await refreshProfile();
      router.replace('/(app)');
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Invalid or expired code.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!user?.email) return;
    setResendMessage(null);
    setResending(true);
    try {
      await userApi.resendVerification({ email: user.email });
      setResendMessage('A new code has been sent to your email.');
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Unable to resend code.');
    } finally {
      setResending(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Verify your email
          </ThemedText>
          <ThemedText type="default" themeColor="textMuted">
            Enter the code we sent to {user?.email ?? 'your email'}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <TextInput
            keyboardType="number-pad"
            placeholder="123456"
            placeholderTextColor={theme.textMuted}
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            style={[
              styles.input,
              { borderColor: error ? theme.error : theme.border, color: theme.text },
            ]}
          />

          {error && (
            <ThemedText type="small" themeColor="error">
              {error}
            </ThemedText>
          )}
          {resendMessage && (
            <ThemedText type="small" themeColor="success">
              {resendMessage}
            </ThemedText>
          )}

          <Pressable
            disabled={submitting || otp.length === 0}
            onPress={handleVerify}
            style={[
              styles.button,
              { backgroundColor: theme.primary, opacity: submitting || otp.length === 0 ? 0.6 : 1 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="smallBold" style={{ color: '#fff' }}>
                Verify
              </ThemedText>
            )}
          </Pressable>

          <Pressable disabled={resending} onPress={handleResend} style={styles.linkRow}>
            <ThemedText type="small" themeColor="textMuted">
              Didn&apos;t get a code? <ThemedText type="link">Resend</ThemedText>
            </ThemedText>
          </Pressable>

          <Pressable onPress={() => logout()} style={styles.linkRow}>
            <ThemedText type="small" themeColor="textMuted">
              Wrong account? <ThemedText type="link">Sign out</ThemedText>
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.five,
  },
  header: { gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  form: { gap: Spacing.three },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkRow: { alignItems: 'center' },
});
