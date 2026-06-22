import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type { Enrollment, UpdateEnrollmentStatusPayload } from './types';

export const enrollmentApi = {
  listByProgram: (slug: string, programId: string) =>
    apiGet<Enrollment[]>(`/organizations/${slug}/programs/${programId}/enrollments`),

  getMyEnrollment: (slug: string, programId: string) =>
    apiGet<Enrollment | null>(`/organizations/${slug}/programs/${programId}/enrollments/me`),

  getMyEnrollmentsInOrg: (slug: string) =>
    apiGet<Enrollment[]>(`/organizations/${slug}/enrollments`),

  enroll: (slug: string, programId: string) =>
    apiPost<Enrollment>(`/organizations/${slug}/programs/${programId}/enrollments`),

  drop: (slug: string, programId: string) =>
    apiDelete(`/organizations/${slug}/programs/${programId}/enrollments/me`),

  updateStatus: (
    slug: string,
    programId: string,
    userId: string,
    data: UpdateEnrollmentStatusPayload
  ) =>
    apiPatch<Enrollment>(
      `/organizations/${slug}/programs/${programId}/enrollments/${userId}`,
      data
    ),
};
