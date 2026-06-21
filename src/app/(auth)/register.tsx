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
import { Spacing } from '@/constants/theme';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const theme = useTheme();
  const register = useAuthStore((s) => s.register);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setFormError(null);
    try {
      await register(data);
      router.replace('/(auth)/verify-email');
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Unable to create account.';
      setFormError(message);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Create account
          </ThemedText>
          <ThemedText type="default" themeColor="textMuted">
            Join IRB Forge to manage your mentorship programs
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.field, styles.flex1]}>
              <ThemedText type="smallBold">First name</ThemedText>
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <TextInput
                    placeholder="Ada"
                    placeholderTextColor={theme.textMuted}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    style={[
                      styles.input,
                      {
                        borderColor: errors.firstName ? theme.error : theme.border,
                        color: theme.text,
                      },
                    ]}
                  />
                )}
              />
              {errors.firstName && (
                <ThemedText type="small" themeColor="error">
                  {errors.firstName.message}
                </ThemedText>
              )}
            </View>

            <View style={[styles.field, styles.flex1]}>
              <ThemedText type="smallBold">Last name</ThemedText>
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <TextInput
                    placeholder="Lovelace"
                    placeholderTextColor={theme.textMuted}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    style={[
                      styles.input,
                      {
                        borderColor: errors.lastName ? theme.error : theme.border,
                        color: theme.text,
                      },
                    ]}
                  />
                )}
              />
              {errors.lastName && (
                <ThemedText type="small" themeColor="error">
                  {errors.lastName.message}
                </ThemedText>
              )}
            </View>
          </View>

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
                Create account
              </ThemedText>
            )}
          </Pressable>

          <Link href="/(auth)/sign-in" asChild>
            <Pressable style={styles.linkRow}>
              <ThemedText type="small" themeColor="textMuted">
                Already have an account? <ThemedText type="link">Sign in</ThemedText>
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
  row: { flexDirection: 'row', gap: Spacing.three },
  flex1: { flex: 1 },
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
  linkRow: { alignItems: 'center', marginTop: Spacing.one },
});
