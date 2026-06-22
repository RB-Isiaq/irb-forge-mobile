import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { CreateProgramPayload, ProgramStatus } from '@/lib/api/types';

const STATUSES: ProgramStatus[] = ['draft', 'active', 'completed', 'cancelled'];

export interface ProgramFormValues {
  name: string;
  description: string;
  status: ProgramStatus;
  capacity: string; // kept as string for the text input
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

const EMPTY: ProgramFormValues = {
  name: '',
  description: '',
  status: 'draft',
  capacity: '',
  startDate: '',
  endDate: '',
};

/** Maps the string-based form values to the API payload. */
export function toProgramPayload(values: ProgramFormValues): CreateProgramPayload {
  return {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    status: values.status,
    capacity: values.capacity ? Number(values.capacity) : undefined,
    startDate: values.startDate.trim() || undefined,
    endDate: values.endDate.trim() || undefined,
  };
}

export function ProgramForm({
  initial,
  submitLabel,
  isPending,
  error,
  onSubmit,
}: {
  initial?: Partial<ProgramFormValues>;
  submitLabel: string;
  isPending: boolean;
  error?: string | null;
  onSubmit: (values: ProgramFormValues) => void;
}) {
  const theme = useTheme();
  const [values, setValues] = useState<ProgramFormValues>({ ...EMPTY, ...initial });

  function set<K extends keyof ProgramFormValues>(key: K, value: ProgramFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const canSubmit = values.name.trim().length > 0 && !isPending;

  return (
    <View style={styles.form}>
      <Field label="Name">
        <TextInput
          value={values.name}
          onChangeText={(t) => set('name', t)}
          placeholder="Program name"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        />
      </Field>

      <Field label="Description">
        <TextInput
          value={values.description}
          onChangeText={(t) => set('description', t)}
          placeholder="What is this program about?"
          placeholderTextColor={theme.textMuted}
          multiline
          style={[styles.input, styles.multiline, { borderColor: theme.border, color: theme.text }]}
        />
      </Field>

      <Field label="Status">
        <View style={styles.chips}>
          {STATUSES.map((s) => {
            const selected = values.status === s;
            return (
              <Pressable
                key={s}
                onPress={() => set('status', s)}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? theme.primary : theme.border,
                    backgroundColor: selected ? theme.backgroundSelected : 'transparent',
                  },
                ]}
              >
                <ThemedText type="small" themeColor={selected ? 'primary' : 'textMuted'}>
                  {s}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </Field>

      <Field label="Capacity (optional)">
        <TextInput
          value={values.capacity}
          onChangeText={(t) => set('capacity', t.replace(/[^0-9]/g, ''))}
          placeholder="Unlimited"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        />
      </Field>

      <View style={styles.dateRow}>
        <Field label="Start (YYYY-MM-DD)" style={styles.dateField}>
          <TextInput
            value={values.startDate}
            onChangeText={(t) => set('startDate', t)}
            placeholder="2026-01-01"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          />
        </Field>
        <Field label="End (YYYY-MM-DD)" style={styles.dateField}>
          <TextInput
            value={values.endDate}
            onChangeText={(t) => set('endDate', t)}
            placeholder="2026-06-01"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          />
        </Field>
      </View>

      {error && (
        <ThemedText type="small" themeColor="error">
          {error}
        </ThemedText>
      )}

      <Pressable
        disabled={!canSubmit}
        onPress={() => onSubmit(values)}
        style={[styles.button, { backgroundColor: theme.primary, opacity: canSubmit ? 1 : 0.6 }]}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText type="smallBold" style={{ color: '#fff' }}>
            {submitLabel}
          </ThemedText>
        )}
      </Pressable>
    </View>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.field, style]}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.three },
  field: { gap: Spacing.one },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  dateRow: { flexDirection: 'row', gap: Spacing.three },
  dateField: { flex: 1 },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
});
