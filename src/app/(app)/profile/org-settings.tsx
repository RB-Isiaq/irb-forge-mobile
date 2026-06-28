import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useOrgStore } from '@/lib/store/org-store';
import { useDeleteOrg, useOrg, useUpdateOrg } from '@/lib/queries/org';
import type { Organization } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

export default function OrgSettingsScreen() {
  const theme = useTheme();
  const slug = useOrgStore((s) => s.activeOrgSlug);
  const { data: org } = useOrg(slug);

  if (!org) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  // Keyed on the org id so the form re-seeds if the active org changes.
  return <OrgSettingsForm key={org.id} org={org} />;
}

function OrgSettingsForm({ org }: { org: Organization }) {
  const theme = useTheme();
  const setActiveOrgSlug = useOrgStore((s) => s.setActiveOrgSlug);
  const updateOrg = useUpdateOrg(org.slug);
  const deleteOrg = useDeleteOrg();

  const [name, setName] = useState(org.name);
  const [description, setDescription] = useState(org.description ?? '');
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    setStatus(null);
    try {
      await updateOrg.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setStatus('Organization updated.');
    } catch (err) {
      setStatus((err as { message?: string })?.message ?? 'Unable to update organization.');
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete organization',
      `Permanently delete “${org.name}”? This removes all members, programs and data. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOrg.mutateAsync(org.slug);
              setActiveOrgSlug(null);
              router.replace('/(app)');
            } catch (err) {
              Alert.alert(
                'Could not delete',
                (err as { message?: string })?.message ?? 'Please try again.'
              );
            }
          },
        },
      ]
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <ThemedText type="smallBold">Organization</ThemedText>
          <Field label="Name">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholderTextColor={theme.textMuted}
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            />
          </Field>
          <Field label="Description">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What does this organization do?"
              placeholderTextColor={theme.textMuted}
              multiline
              style={[
                styles.input,
                styles.multiline,
                { borderColor: theme.border, color: theme.text },
              ]}
            />
          </Field>
          {status && (
            <ThemedText type="small" themeColor="textMuted">
              {status}
            </ThemedText>
          )}
          <Pressable
            disabled={updateOrg.isPending || !name.trim()}
            onPress={save}
            style={[
              styles.button,
              {
                backgroundColor: theme.primary,
                opacity: updateOrg.isPending || !name.trim() ? 0.6 : 1,
              },
            ]}
          >
            {updateOrg.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="smallBold" style={{ color: '#fff' }}>
                Save changes
              </ThemedText>
            )}
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="error">
            Danger zone
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            Permanently delete this organization. This cannot be undone.
          </ThemedText>
          <Pressable
            onPress={confirmDelete}
            style={[styles.button, styles.outlineBtn, { borderColor: theme.error }]}
          >
            <ThemedText type="smallBold" themeColor="error">
              Delete organization
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.four, gap: Spacing.five },
  section: { gap: Spacing.two },
  field: { gap: Spacing.one },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  outlineBtn: { borderWidth: 1 },
});
