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
import { useOrgStore } from '@/lib/store/org-store';
import {
  useCancelInvitation,
  useOrgInvitations,
  useResendInvitation,
  useSendInvitation,
} from '@/lib/queries/invitation';
import type { Invitation, OrgRole } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

const ROLES: Exclude<OrgRole, 'owner'>[] = ['admin', 'mentor', 'member'];

export default function InviteScreen() {
  const theme = useTheme();
  const slug = useOrgStore((s) => s.activeOrgSlug);
  const { data: invitations, isLoading } = useOrgInvitations(slug);
  const sendInvite = useSendInvitation(slug ?? '');

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Exclude<OrgRole, 'owner'>>('member');
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!email.trim()) return;
    setError(null);
    try {
      await sendInvite.mutateAsync({ email: email.trim().toLowerCase(), role });
      setEmail('');
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Unable to send invitation.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <ThemedText type="smallBold">Invite by email</ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="person@example.com"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          />

          <View style={styles.chips}>
            {ROLES.map((r) => {
              const selected = role === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => setRole(r)}
                  style={[
                    styles.chip,
                    {
                      borderColor: selected ? theme.primary : theme.border,
                      backgroundColor: selected ? theme.backgroundSelected : 'transparent',
                    },
                  ]}
                >
                  <ThemedText type="small" themeColor={selected ? 'primary' : 'textMuted'}>
                    {r}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {error && (
            <ThemedText type="small" themeColor="error">
              {error}
            </ThemedText>
          )}

          <Pressable
            disabled={sendInvite.isPending || !email.trim()}
            onPress={handleSend}
            style={[
              styles.button,
              {
                backgroundColor: theme.primary,
                opacity: sendInvite.isPending || !email.trim() ? 0.6 : 1,
              },
            ]}
          >
            {sendInvite.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="smallBold" style={{ color: '#fff' }}>
                Send invitation
              </ThemedText>
            )}
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Pending invitations</ThemedText>
          {isLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : invitations && invitations.length > 0 ? (
            invitations.map((inv) => <PendingRow key={inv.id} invitation={inv} slug={slug ?? ''} />)
          ) : (
            <ThemedText type="small" themeColor="textMuted">
              No pending invitations.
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function PendingRow({ invitation, slug }: { invitation: Invitation; slug: string }) {
  const theme = useTheme();
  const cancel = useCancelInvitation(slug);
  const resend = useResendInvitation(slug);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <ThemedText type="small">{invitation.email}</ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {invitation.role} · {invitation.status}
          </ThemedText>
        </View>
      </View>
      <View style={styles.cardActions}>
        <Pressable
          disabled={resend.isPending}
          onPress={() => resend.mutate(invitation.id)}
          style={[styles.tag, { borderColor: theme.border }]}
        >
          <ThemedText type="small" themeColor="primary">
            Resend
          </ThemedText>
        </Pressable>
        <Pressable
          disabled={cancel.isPending}
          onPress={() => cancel.mutate(invitation.id)}
          style={[styles.tag, { borderColor: theme.error }]}
        >
          <ThemedText type="small" themeColor="error">
            Cancel
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  section: { gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardInfo: { gap: Spacing.half },
  cardActions: { flexDirection: 'row', gap: Spacing.two },
  tag: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
});
