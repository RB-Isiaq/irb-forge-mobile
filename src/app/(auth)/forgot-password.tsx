import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { userApi } from '@/lib/api/auth';
import { Spacing } from '@/constants/theme';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setFormError(null);
    try {
      await userApi.forgotPassword(data);
      setSent(true);
    } catch (err) {
      setFormError((err as { message?: string })?.message ?? 'Unable to send reset email.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Reset password
          </ThemedText>
          <ThemedText type="default" themeColor="textMuted">
            We&apos;ll email you a reset code
          </ThemedText>
        </View>

        {sent ? (
          <View style={styles.form}>
            <ThemedText type="small" themeColor="success">
              If an account exists for {getValues('email')}, a reset code is on its way.
            </ThemedText>
            <Pressable
              onPress={() =>
                router.replace({
                  pathname: '/(auth)/reset-password',
                  params: { email: getValues('email') },
                })
              }
              style={[styles.button, { backgroundColor: theme.primary }]}>
              <ThemedText type="smallBold" style={{ color: '#fff' }}>
                I have a code
              </ThemedText>
            </Pressable>
          </View>
        ) : (
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

            {formError && (
              <ThemedText type="small" themeColor="error">
                {formError}
              </ThemedText>
            )}

            <Pressable
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              style={[styles.button, { backgroundColor: theme.primary, opacity: isSubmitting ? 0.6 : 1 }]}>
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText type="smallBold" style={{ color: '#fff' }}>
                  Send reset code
                </ThemedText>
              )}
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, justifyContent: 'center', gap: Spacing.five },
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
  },
});
