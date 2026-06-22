import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ProgramForm, toProgramPayload } from '@/components/program-form';
import { useOrgStore } from '@/lib/store/org-store';
import { useCreateProgram } from '@/lib/queries/program';
import { Spacing } from '@/constants/theme';

export default function NewProgramScreen() {
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);
  const createProgram = useCreateProgram(activeOrgSlug ?? '');
  const [error, setError] = useState<string | null>(null);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ProgramForm
          submitLabel="Create program"
          isPending={createProgram.isPending}
          error={error}
          onSubmit={async (values) => {
            setError(null);
            try {
              await createProgram.mutateAsync(toProgramPayload(values));
              router.back();
            } catch (err) {
              setError((err as { message?: string })?.message ?? 'Unable to create program.');
            }
          }}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
});
