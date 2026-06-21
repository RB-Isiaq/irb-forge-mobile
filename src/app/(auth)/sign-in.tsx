import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/lib/store/auth-store';
import { isGoogleSignInConfigured, signInWithGoogleAsync } from '@/lib/auth/google';
import { Spacing } from '@/constants/theme';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function SignInScreen() {
  const theme = useTheme();
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const [formError, setFormError] = useState<string | null>(null);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function afterAuth() {
    const user = useAuthStore.getState().user;
    router.replace(user?.isVerified === false ? '/(auth)/verify-email' : '/(app)');
  }

  async function onSubmit(data: FormData) {
    setFormError(null);
    try {
      await login(data);
      afterAuth();
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Unable to sign in.';
      setFormError(message);
    }
  }

  async function onGooglePress() {
    setFormError(null);
    setGoogleSubmitting(true);
    try {
      const idToken = await signInWithGoogleAsync();
      if (!idToken) return;
      await loginWithGoogle({ idToken });
      afterAuth();
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Unable to sign in with Google.';
      setFormError(message);
    } finally {
      setGoogleSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            IRB Forge
          </ThemedText>
          <ThemedText type="default" themeColor="textMuted">
            Sign in to continue
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <ThemedText type="smallBold">Email</ThemedText>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  placeholderTextColor={theme.textMuted}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  style={[
                    styles.input,
                    { borderColor: errors.email ? theme.error : theme.border, color: theme.text },
                  ]}
                />
              )}
            />
            {errors.email && (
              <ThemedText type="small" themeColor="error">
                {errors.email.message}
              </ThemedText>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Password</ThemedText>
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <TextInput
                  secureTextEntry
                  autoCapitalize="none"
                  placeholder="••••••••"
                  placeholderTextColor={theme.textMuted}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  style={[
                    styles.input,
                    {
                      borderColor: errors.password ? theme.error : theme.border,
                      color: theme.text,
                    },
                  ]}
                />
              )}
            />
            {errors.password && (
              <ThemedText type="small" themeColor="error">
                {errors.password.message}
              </ThemedText>
            )}
          </View>

          {formError && (
            <ThemedText type="small" themeColor="error">
              {formError}
            </ThemedText>
          )}

          <Pressable
            disabled={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            style={[
              styles.button,
              { backgroundColor: theme.primary, opacity: isSubmitting ? 0.6 : 1 },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="smallBold" style={{ color: '#fff' }}>
                Sign in
              </ThemedText>
            )}
          </Pressable>

          {isGoogleSignInConfigured && (
            <>
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                <ThemedText type="small" themeColor="textMuted">
                  or
                </ThemedText>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              </View>

              <Pressable
                disabled={googleSubmitting}
                onPress={onGooglePress}
                style={[
                  styles.button,
                  styles.googleButton,
                  { borderColor: theme.border, opacity: googleSubmitting ? 0.6 : 1 },
                ]}
              >
                {googleSubmitting ? (
                  <ActivityIndicator color={theme.text} />
                ) : (
                  <ThemedText type="smallBold">Continue with Google</ThemedText>
                )}
              </Pressable>
            </>
          )}

          <Link href="/(auth)/forgot-password" asChild>
            <Pressable style={styles.linkRow}>
              <ThemedText type="link">Forgot password?</ThemedText>
            </Pressable>
          </Link>

          <Link href="/(auth)/register" asChild>
            <Pressable style={styles.linkRow}>
              <ThemedText type="small" themeColor="textMuted">
                Don&apos;t have an account? <ThemedText type="link">Create one</ThemedText>
              </ThemedText>
            </Pressable>
          </Link>
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
  linkRow: { alignItems: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dividerLine: { flex: 1, height: 1 },
  googleButton: { borderWidth: 1, backgroundColor: 'transparent' },
});
