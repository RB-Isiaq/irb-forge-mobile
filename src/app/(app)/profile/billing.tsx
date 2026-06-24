import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useQueryClient } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useOrgStore } from '@/lib/store/org-store';
import {
  useCancelSubscription,
  useCreateCheckout,
  useOrgPayments,
  useSubscription,
} from '@/lib/queries/subscription';
import { queryKeys } from '@/lib/query-keys';
import type { Payment, SubscriptionStatus } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

const PRO_FEATURES = [
  'Unlimited programs',
  'Unlimited members',
  'Priority support',
  'Advanced announcements',
];

const STATUS_COLOR: Record<SubscriptionStatus, 'success' | 'warning' | 'primary' | 'textMuted'> = {
  active: 'success',
  trialing: 'primary',
  past_due: 'warning',
  cancelled: 'textMuted',
};

function formatAmount(payment: Payment): string {
  const value = (payment.amount / 100).toFixed(2);
  return `${payment.currency.toUpperCase()} ${value}`;
}

export default function BillingScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const slug = useOrgStore((s) => s.activeOrgSlug);
  const { data: subscription, isLoading } = useSubscription(slug);
  const { data: paymentsPage } = useOrgPayments(slug);
  const checkout = useCreateCheckout(slug ?? '');
  const cancel = useCancelSubscription(slug ?? '');

  const isPro = subscription?.plan === 'pro';

  async function handleUpgrade() {
    try {
      const session = await checkout.mutateAsync();
      await WebBrowser.openBrowserAsync(session.url);
      // The user may have completed payment in the browser — refresh on return.
      void queryClient.invalidateQueries({ queryKey: queryKeys.subscription.byOrg(slug ?? '') });
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.byOrg(slug ?? '') });
    } catch (err) {
      Alert.alert('Checkout failed', (err as { message?: string })?.message ?? 'Please try again.');
    }
  }

  function handleCancel() {
    Alert.alert(
      'Cancel subscription',
      'Your organization will return to the Free plan at the end of the billing period.',
      [
        { text: 'Keep Pro', style: 'cancel' },
        { text: 'Cancel plan', style: 'destructive', onPress: () => cancel.mutate() },
      ]
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Current plan */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardTop}>
            <ThemedText type="subtitle" style={styles.planName}>
              {isPro ? 'Pro' : 'Free'} plan
            </ThemedText>
            {subscription && (
              <ThemedText type="small" themeColor={STATUS_COLOR[subscription.status]}>
                {subscription.status}
              </ThemedText>
            )}
          </View>
          {subscription?.currentPeriodEnd && (
            <ThemedText type="small" themeColor="textMuted">
              Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </ThemedText>
          )}
        </ThemedView>

        {/* Pro features / upgrade */}
        {!isPro && (
          <View style={styles.section}>
            <ThemedText type="smallBold">Upgrade to Pro</ThemedText>
            {PRO_FEATURES.map((f) => (
              <ThemedText key={f} type="small" themeColor="textMuted">
                • {f}
              </ThemedText>
            ))}
            <Pressable
              disabled={checkout.isPending}
              onPress={handleUpgrade}
              style={[
                styles.button,
                { backgroundColor: theme.primary, opacity: checkout.isPending ? 0.6 : 1 },
              ]}
            >
              {checkout.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText type="smallBold" style={{ color: '#fff' }}>
                  Upgrade to Pro
                </ThemedText>
              )}
            </Pressable>
          </View>
        )}

        {isPro && subscription?.status === 'active' && (
          <Pressable
            disabled={cancel.isPending}
            onPress={handleCancel}
            style={[styles.button, styles.outlineBtn, { borderColor: theme.error }]}
          >
            {cancel.isPending ? (
              <ActivityIndicator color={theme.error} />
            ) : (
              <ThemedText type="smallBold" themeColor="error">
                Cancel subscription
              </ThemedText>
            )}
          </Pressable>
        )}

        {/* Payment history */}
        <View style={styles.section}>
          <ThemedText type="smallBold">Payment history</ThemedText>
          {paymentsPage && paymentsPage.items.length > 0 ? (
            paymentsPage.items.map((p) => (
              <ThemedView key={p.id} type="backgroundElement" style={styles.paymentRow}>
                <View>
                  <ThemedText type="small">{formatAmount(p)}</ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </ThemedText>
                </View>
                <ThemedText
                  type="small"
                  themeColor={p.status === 'succeeded' ? 'success' : 'error'}
                >
                  {p.status}
                </ThemedText>
              </ThemedView>
            ))
          ) : (
            <ThemedText type="small" themeColor="textMuted">
              No payments yet.
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.four, gap: Spacing.four },
  card: { borderRadius: Spacing.three, padding: Spacing.four, gap: Spacing.one },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 22 },
  section: { gap: Spacing.two },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  outlineBtn: { borderWidth: 1 },
  paymentRow: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
