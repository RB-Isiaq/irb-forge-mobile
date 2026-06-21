import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type { CreateOrganizationPayload, Organization, UpdateOrganizationPayload } from './types';

export const orgApi = {
  list: () => apiGet<Organization[]>('/organizations'),
  get: (slug: string) => apiGet<Organization>(`/organizations/${slug}`),
  create: (data: CreateOrganizationPayload) => apiPost<Organization>('/organizations', data),
  update: (slug: string, data: UpdateOrganizationPayload) =>
    apiPatch<Organization>(`/organizations/${slug}`, data),
  delete: (slug: string) => apiDelete(`/organizations/${slug}`),
};
