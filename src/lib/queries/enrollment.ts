import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { enrollmentApi } from '@/lib/api/enrollment';
import type { UpdateEnrollmentStatusPayload } from '@/lib/api/types';
import { queryKeys } from '@/lib/query-keys';

export function useProgramEnrollments(slug: string | null, programId: string | null) {
  return useQuery({
    queryKey: queryKeys.enrollments.byProgram(slug ?? '', programId ?? ''),
    queryFn: () => enrollmentApi.listByProgram(slug as string, programId as string),
    enabled: Boolean(slug && programId),
  });
}

export function useMyEnrollment(slug: string | null, programId: string | null) {
  return useQuery({
    queryKey: queryKeys.enrollments.mine(slug ?? '', programId ?? ''),
    queryFn: () => enrollmentApi.getMyEnrollment(slug as string, programId as string),
    enabled: Boolean(slug && programId),
  });
}

export function useMyOrgEnrollments(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.enrollments.myInOrg(slug ?? ''),
    queryFn: () => enrollmentApi.getMyEnrollmentsInOrg(slug as string),
    enabled: Boolean(slug),
  });
}

function invalidateEnrollments(
  queryClient: ReturnType<typeof useQueryClient>,
  slug: string,
  programId: string
) {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.enrollments.byProgram(slug, programId),
  });
  void queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.mine(slug, programId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.myInOrg(slug) });
}

export function useEnroll(slug: string, programId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => enrollmentApi.enroll(slug, programId),
    onSuccess: () => invalidateEnrollments(queryClient, slug, programId),
  });
}

export function useDropEnrollment(slug: string, programId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => enrollmentApi.drop(slug, programId),
    onSuccess: () => invalidateEnrollments(queryClient, slug, programId),
  });
}

export function useUpdateEnrollmentStatus(slug: string, programId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateEnrollmentStatusPayload }) =>
      enrollmentApi.updateStatus(slug, programId, userId, data),
    onSuccess: () => invalidateEnrollments(queryClient, slug, programId),
  });
}
