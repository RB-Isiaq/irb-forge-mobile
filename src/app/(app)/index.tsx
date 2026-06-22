import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UnverifiedBanner } from '@/components/unverified-banner';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOrgStore } from '@/lib/store/org-store';
import { useCreateOrg, useOrgs } from '@/lib/queries/org';
import { useMembers } from '@/lib/queries/member';
import { usePrograms } from '@/lib/queries/program';
import { useMessages } from '@/lib/queries/message';
import type { Organization } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);
  const setActiveOrgSlug = useOrgStore((s) => s.setActiveOrgSlug);
  const { data: orgs, isLoading: orgsLoading } = useOrgs();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    if (!orgs || orgs.length === 0) return;
    if (!activeOrgSlug || !orgs.some((o) => o.slug === activeOrgSlug)) {
      setActiveOrgSlug(orgs[0].slug);
    }
  }, [orgs, activeOrgSlug, setActiveOrgSlug]);

  const activeOrg = orgs?.find((o) => o.slug === activeOrgSlug) ?? null;

  const { data: members } = useMembers(activeOrg?.slug ?? null);
  const { data: programs } = usePrograms(activeOrg?.slug ?? null);
  const { data: messages } = useMessages(activeOrg?.slug ?? null);

  if (orgsLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <ActivityIndicator color={theme.primary} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!orgs || orgs.length === 0) {
    return <CreateOrgPrompt firstName={user?.firstName} onCreated={setActiveOrgSlug} />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <UnverifiedBanner />
          <View style={styles.header}>
            <ThemedText type="default" themeColor="textMuted">
              Welcome{user?.firstName ? `, ${user.firstName}` : ''}
            </ThemedText>
            <Pressable onPress={() => setSwitcherOpen(true)} style={styles.orgRow}>
              <ThemedText type="title" style={styles.title}>
                {activeOrg?.name}
              </ThemedText>
              {orgs.length > 1 && (
                <ThemedText type="link" themeColor="primary">
                  Switch org
                </ThemedText>
              )}
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <StatCard label="Members" value={members?.total} />
            <StatCard label="Programs" value={programs?.total} />
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold">Recent announcements</ThemedText>
            {messages && messages.items.length > 0 ? (
              messages.items.slice(0, 3).map((m) => (
                <ThemedView key={m.id} type="backgroundElement" style={styles.card}>
                  <ThemedText type="small">{m.content}</ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {m.author
                      ? `${m.author.firstName ?? ''} ${m.author.lastName ?? ''}`.trim() || 'Member'
                      : 'Member'}
                  </ThemedText>
                </ThemedView>
              ))
            ) : (
              <ThemedText type="small" themeColor="textMuted">
                No announcements yet.
              </ThemedText>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <OrgSwitcherModal
        visible={switcherOpen}
        orgs={orgs}
        activeSlug={activeOrgSlug}
        onSelect={(slug) => {
          setActiveOrgSlug(slug);
          setSwitcherOpen(false);
        }}
        onClose={() => setSwitcherOpen(false)}
      />
    </ThemedView>
  );
}

function StatCard({ label, value }: { label: string; value: number | undefined }) {
  return (
    <ThemedView type="backgroundElement" style={styles.statCard}>
      <ThemedText type="title" style={styles.statValue}>
        {value ?? '–'}
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

function CreateOrgPrompt({
  firstName,
  onCreated,
}: {
  firstName: string | null | undefined;
  onCreated: (slug: string) => void;
}) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createOrg = useCreateOrg();

  async function handleCreate() {
    if (!name.trim()) return;
    setError(null);
    try {
      const org = await createOrg.mutateAsync({ name: name.trim() });
      onCreated(org.slug);
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Unable to create organization.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Welcome{firstName ? `, ${firstName}` : ''}
          </ThemedText>
          <ThemedText type="default" themeColor="textMuted">
            Create your organization to get started.
          </ThemedText>
        </View>

        <TextInput
          placeholder="Organization name"
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={setName}
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        />

        {error && (
          <ThemedText type="small" themeColor="error">
            {error}
          </ThemedText>
        )}

        <Pressable
          disabled={createOrg.isPending || !name.trim()}
          onPress={handleCreate}
          style={[
            styles.button,
            {
              backgroundColor: theme.primary,
              opacity: createOrg.isPending || !name.trim() ? 0.6 : 1,
            },
          ]}
        >
          {createOrg.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText type="smallBold" style={{ color: '#fff' }}>
              Create organization
            </ThemedText>
          )}
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

function OrgSwitcherModal({
  visible,
  orgs,
  activeSlug,
  onSelect,
  onClose,
}: {
  visible: boolean;
  orgs: Organization[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
  onClose: () => void;
}) {
  const theme = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <ThemedView type="backgroundElement" style={styles.modalSheet}>
          <ThemedText type="smallBold" style={styles.modalTitle}>
            Switch organization
          </ThemedText>
          {orgs.map((org) => (
            <Pressable
              key={org.slug}
              onPress={() => onSelect(org.slug)}
              style={[
                styles.modalRow,
                org.slug === activeSlug && { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <ThemedText type="default">{org.name}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.five },
  centered: { justifyContent: 'center', gap: Spacing.three },
  scrollContent: { gap: Spacing.four, paddingBottom: Spacing.six },
  header: { gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  orgRow: { gap: Spacing.half },
  statsRow: { flexDirection: 'row', gap: Spacing.three },
  statCard: { flex: 1, borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.half },
  statValue: { fontSize: 28, lineHeight: 32 },
  section: { gap: Spacing.two },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.half },
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  modalTitle: { marginBottom: Spacing.two },
  modalRow: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
});
