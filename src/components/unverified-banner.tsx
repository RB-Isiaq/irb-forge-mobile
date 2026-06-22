import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/lib/store/auth-store';
import { userApi } from '@/lib/api/auth';
import { Spacing } from '@/constants/theme';

/**
 * Shown while the signed-in user hasn't verified their email. Mirrors the web
 * app's `unverified-banner` widget.
 */
export function UnverifiedBanner() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const [sent, setSent] = useState(false);

  const resend = useMutation({
    mutationFn: () => userApi.resendVerification({ email: user?.email ?? '' }),
    onSuccess: () => setSent(true),
  });

  if (!user || user.isVerified) return null;

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: theme.backgroundElement, borderColor: theme.warning },
      ]}
    >
      <ThemedText type="small" themeColor="warning">
        Verify your email to unlock everything.
      </ThemedText>
      {sent ? (
        <ThemedText type="small" themeColor="textMuted">
          Verification email sent.
        </ThemedText>
      ) : (
        <Pressable disabled={resend.isPending} onPress={() => resend.mutate()}>
          <ThemedText type="link" themeColor="primary">
            {resend.isPending ? 'Sending…' : 'Resend email'}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
});
