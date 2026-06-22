import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AuthHeader } from '@/components/auth-header';
import { useTheme } from '@/hooks/use-theme';
import { userApi } from '@/lib/api/auth';
import { Spacing } from '@/constants/theme';

const schema = z.object({
  token: z.string().min(1, 'Enter the code from your email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setFormError(null);
    try {
      await userApi.resetPassword(data);
      router.replace('/(auth)/sign-in');
    } catch (err) {
      setFormError((err as { message?: string })?.message ?? 'Unable to reset password.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader />
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            New password
          </ThemedText>
          <ThemedText type="default" themeColor="textMuted">
            {email ? `Resetting password for ${email}` : 'Enter the code from your email'}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <ThemedText type="smallBold">Reset code</ThemedText>
            <Controller
              control={control}
              name="token"
              render={({ field }) => (
                <TextInput
                  autoCapitalize="none"
                  placeholder="Paste the code from your email"
                  placeholderTextColor={theme.textMuted}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  style={[
                    styles.input,
                    { borderColor: errors.token ? theme.error : theme.border, color: theme.text },
                  ]}
                />
              )}
            />
            {errors.token && (
              <ThemedText type="small" themeColor="error">
                {errors.token.message}
              </ThemedText>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">New password</ThemedText>
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
                Reset password
              </ThemedText>
            )}
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
