import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProgramForm, toProgramPayload } from '@/components/program-form';
import { useTheme } from '@/hooks/use-theme';
import { useOrgStore } from '@/lib/store/org-store';
import { useDeleteProgram, useProgram, useUpdateProgram } from '@/lib/queries/program';
import { useMyMembership } from '@/lib/queries/member';
import {
  useDropEnrollment,
  useEnroll,
  useMyEnrollment,
  useProgramEnrollments,
  useUpdateEnrollmentStatus,
} from '@/lib/queries/enrollment';
import type { Enrollment, EnrollmentStatus, OrgRole, Program } from '@/lib/api/types';
import { Spacing } from '@/constants/theme';

const CAN_MANAGE: OrgRole[] = ['owner', 'admin'];

const ENROLLMENT_COLOR: Record<EnrollmentStatus, 'success' | 'primary' | 'textMuted'> = {
  active: 'success',
  completed: 'primary',
  dropped: 'textMuted',
};

function formatDate(value: string | null): string {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString();
}

export default function ProgramDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const slug = useOrgStore((s) => s.activeOrgSlug);
  const programId = id ?? null;

  const { data: program, isLoading } = useProgram(slug, programId);
  const { data: myMembership } = useMyMembership(slug);
  const { data: myEnrollment } = useMyEnrollment(slug, programId);

  const canManage = myMembership ? CAN_MANAGE.includes(myMembership.role) : false;

  const enroll = useEnroll(slug ?? '', programId ?? '');
  const drop = useDropEnrollment(slug ?? '', programId ?? '');
  const deleteProgram = useDeleteProgram(slug ?? '');
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading || !program) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  const isEnrolledActive = myEnrollment?.status === 'active';

  function confirmDelete() {
    if (!program) return;
    Alert.alert('Delete program', `Permanently delete “${program.name}”? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProgram.mutateAsync(program.id);
            router.back();
          } catch (err) {
            Alert.alert(
              'Could not delete',
              (err as { message?: string })?.message ?? 'Please try again.'
            );
          }
        },
      },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {program.name}
          </ThemedText>
          <ThemedText type="small" themeColor="primary">
            {program.status}
          </ThemedText>
        </View>

        {program.description && (
          <ThemedText type="default" themeColor="textMuted">
            {program.description}
          </ThemedText>
        )}

        <ThemedView type="backgroundElement" style={styles.card}>
          <DetailRow
            label="Capacity"
            value={program.capacity ? String(program.capacity) : 'Unlimited'}
          />
          <DetailRow label="Start date" value={formatDate(program.startDate)} />
          <DetailRow label="End date" value={formatDate(program.endDate)} />
        </ThemedView>

        {/* Enrollment action for the current member */}
        <View style={styles.section}>
          <ThemedText type="smallBold">Your enrollment</ThemedText>
          {myEnrollment ? (
            <ThemedText type="small" themeColor={ENROLLMENT_COLOR[myEnrollment.status]}>
              {myEnrollment.status === 'active'
                ? 'You are enrolled in this program.'
                : `Your enrollment is ${myEnrollment.status}.`}
            </ThemedText>
          ) : (
            <ThemedText type="small" themeColor="textMuted">
              You are not enrolled.
            </ThemedText>
          )}

          {isEnrolledActive ? (
            <Pressable
              disabled={drop.isPending}
              onPress={() => drop.mutate()}
              style={[styles.actionBtn, styles.outlineBtn, { borderColor: theme.error }]}
            >
              {drop.isPending ? (
                <ActivityIndicator color={theme.error} />
              ) : (
                <ThemedText type="smallBold" themeColor="error">
                  Drop program
                </ThemedText>
              )}
            </Pressable>
          ) : (
            // Matches the web: you can only enroll if you have no enrollment yet.
            // A completed/dropped enrollment is terminal — there's no re-enroll.
            !myEnrollment &&
            program.status === 'active' && (
              <Pressable
                disabled={enroll.isPending}
                onPress={() => enroll.mutate()}
                style={[styles.actionBtn, { backgroundColor: theme.primary }]}
              >
                {enroll.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>
                    Enroll
                  </ThemedText>
                )}
              </Pressable>
            )
          )}
        </View>

        {/* Admin: roster + program actions */}
        {canManage && (
          <>
            <Roster slug={slug as string} programId={program.id} />

            <View style={styles.section}>
              <ThemedText type="smallBold">Manage program</ThemedText>
              <Pressable
                onPress={() => setEditOpen(true)}
                style={[styles.actionBtn, styles.outlineBtn, { borderColor: theme.border }]}
              >
                <ThemedText type="smallBold">Edit program</ThemedText>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                style={[styles.actionBtn, styles.outlineBtn, { borderColor: theme.error }]}
              >
                <ThemedText type="smallBold" themeColor="error">
                  Delete program
                </ThemedText>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      <EditProgramModal
        visible={editOpen}
        slug={slug ?? ''}
        program={program}
        onClose={() => setEditOpen(false)}
      />
    </ThemedView>
  );
}

function Roster({ slug, programId }: { slug: string; programId: string }) {
  const { data: enrollments, isLoading } = useProgramEnrollments(slug, programId);
  const updateStatus = useUpdateEnrollmentStatus(slug, programId);

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">Roster ({enrollments?.length ?? 0})</ThemedText>
      {isLoading ? (
        <ActivityIndicator />
      ) : enrollments && enrollments.length > 0 ? (
        enrollments.map((e) => (
          <RosterRow
            key={e.id}
            enrollment={e}
            onComplete={() =>
              updateStatus.mutate({ userId: e.userId, data: { status: 'completed' } })
            }
            onDrop={() => updateStatus.mutate({ userId: e.userId, data: { status: 'dropped' } })}
          />
        ))
      ) : (
        <ThemedText type="small" themeColor="textMuted">
          No one is enrolled yet.
        </ThemedText>
      )}
    </View>
  );
}

function RosterRow({
  enrollment,
  onComplete,
  onDrop,
}: {
  enrollment: Enrollment;
  onComplete: () => void;
  onDrop: () => void;
}) {
  const theme = useTheme();
  const name =
    `${enrollment.user?.firstName ?? ''} ${enrollment.user?.lastName ?? ''}`.trim() ||
    enrollment.user?.email ||
    'Member';

  return (
    <ThemedView type="backgroundElement" style={styles.rosterCard}>
      <View style={styles.rosterTop}>
        <ThemedText type="small" style={styles.rosterName}>
          {name}
        </ThemedText>
        <ThemedText type="small" themeColor={ENROLLMENT_COLOR[enrollment.status]}>
          {enrollment.status}
        </ThemedText>
      </View>
      {enrollment.status === 'active' && (
        <View style={styles.rosterActions}>
          <Pressable onPress={onComplete} style={[styles.tag, { borderColor: theme.border }]}>
            <ThemedText type="small" themeColor="primary">
              Mark complete
            </ThemedText>
          </Pressable>
          <Pressable onPress={onDrop} style={[styles.tag, { borderColor: theme.error }]}>
            <ThemedText type="small" themeColor="error">
              Drop
            </ThemedText>
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

function EditProgramModal({
  visible,
  slug,
  program,
  onClose,
}: {
  visible: boolean;
  slug: string;
  program: Program;
  onClose: () => void;
}) {
  const updateProgram = useUpdateProgram(slug);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ThemedView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalHeader}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Edit program
            </ThemedText>
            <Pressable onPress={onClose}>
              <ThemedText type="link" themeColor="primary">
                Close
              </ThemedText>
            </Pressable>
          </View>
          <ProgramForm
            submitLabel="Save changes"
            isPending={updateProgram.isPending}
            error={error}
            initial={{
              name: program.name,
              description: program.description ?? '',
              status: program.status,
              capacity: program.capacity ? String(program.capacity) : '',
              startDate: program.startDate?.slice(0, 10) ?? '',
              endDate: program.endDate?.slice(0, 10) ?? '',
            }}
            onSubmit={async (values) => {
              setError(null);
              try {
                await updateProgram.mutateAsync({ id: program.id, data: toProgramPayload(values) });
                onClose();
              } catch (err) {
                setError((err as { message?: string })?.message ?? 'Unable to update program.');
              }
            }}
          />
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="small" themeColor="textMuted">
        {label}
      </ThemedText>
      <ThemedText type="small">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.four, gap: Spacing.four },
  header: { gap: Spacing.one },
  title: { fontSize: 28, lineHeight: 34 },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  section: { gap: Spacing.two },
  actionBtn: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtn: { borderWidth: 1 },
  rosterCard: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  rosterTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rosterName: { flex: 1 },
  rosterActions: { flexDirection: 'row', gap: Spacing.two },
  tag: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 24 },
});
