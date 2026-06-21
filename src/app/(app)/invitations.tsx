import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAcceptInvitation, useDeclineInvitation, useMyInvitations } from '@/lib/queries/invitation';
import type { Invitation } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

export default function InvitationsScreen() {
  const theme = useTheme();
  const { data: invitations, isLoading } = useMyInvitations();
  const acceptInvitation = useAcceptInvitation();
  const declineInvitation = useDeclineInvitation();

  const pending = (invitations ?? []).filter((i) => i.status === 'pending');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Invitations
          </ThemedText>
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <FlatList
            data={pending}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textMuted">
                No pending invitations.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <InvitationRow
                invitation={item}
                onAccept={() => acceptInvitation.mutate(item.id)}
                onDecline={() => declineInvitation.mutate(item.id)}
                isBusy={acceptInvitation.isPending || declineInvitation.isPending}
              />
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function InvitationRow({
  invitation,
  onAccept,
  onDecline,
  isBusy,
}: {
  invitation: Invitation;
  onAccept: () => void;
  onDecline: () => void;
  isBusy: boolean;
}) {
  const theme = useTheme();
  const inviterName = invitation.invitedBy
    ? `${invitation.invitedBy.firstName ?? ''} ${invitation.invitedBy.lastName ?? ''}`.trim()
    : null;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{invitation.organization?.name ?? 'Organization'}</ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        Invited as {invitation.role}
        {inviterName ? ` by ${inviterName}` : ''}
      </ThemedText>

      <View style={styles.actionsRow}>
        <Pressable
          disabled={isBusy}
          onPress={onDecline}
          style={[styles.actionButton, { borderColor: theme.error, opacity: isBusy ? 0.6 : 1 }]}>
          <ThemedText type="small" themeColor="error">
            Decline
          </ThemedText>
        </Pressable>
        <Pressable
          disabled={isBusy}
          onPress={onAccept}
          style={[styles.actionButton, { backgroundColor: theme.primary, opacity: isBusy ? 0.6 : 1 }]}>
          <ThemedText type="small" style={{ color: '#fff' }}>
            Accept
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.five, gap: Spacing.three },
  header: { gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  listContent: { gap: Spacing.two, paddingBottom: Spacing.six },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.one },
  actionsRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
