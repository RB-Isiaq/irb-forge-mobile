import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOrgStore } from '@/lib/store/org-store';
import { useMyMembership } from '@/lib/queries/member';
import type { OrgRole } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

const CAN_MANAGE_ORG: OrgRole[] = ['owner', 'admin'];

export default function ProfileScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);
  const { data: myMembership } = useMyMembership(activeOrgSlug);
  const [signingOut, setSigningOut] = useState(false);

  const canManageOrg = myMembership ? CAN_MANAGE_ORG.includes(myMembership.role) : false;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Profile
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">
              {user?.firstName ?? ''} {user?.lastName ?? ''}
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {user?.email}
            </ThemedText>
          </ThemedView>

          <View style={styles.section}>
            <NavRow href="/(app)/profile/settings" label="Account settings" />
            {canManageOrg && (
              <>
                <NavRow href="/(app)/profile/org-settings" label="Organization settings" />
                <NavRow href="/(app)/profile/billing" label="Billing & plan" />
              </>
            )}
          </View>

          <Pressable
            disabled={signingOut}
            onPress={handleSignOut}
            style={[styles.button, { borderColor: theme.error, opacity: signingOut ? 0.6 : 1 }]}
          >
            {signingOut ? (
              <ActivityIndicator color={theme.error} />
            ) : (
              <ThemedText type="smallBold" themeColor="error">
                Sign out
              </ThemedText>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function NavRow({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href as never} asChild>
      <Pressable>
        <ThemedView type="backgroundElement" style={styles.navRow}>
          <ThemedText type="default">{label}</ThemedText>
          <ThemedText type="default" themeColor="textMuted">
            ›
          </ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.five },
  content: { gap: Spacing.four, paddingBottom: Spacing.six },
  header: { gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  card: { borderRadius: Spacing.three, padding: Spacing.four, gap: Spacing.half },
  section: { gap: Spacing.two },
  navRow: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
