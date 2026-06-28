import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type { CreateProgramPayload, PaginatedData, Program, UpdateProgramPayload } from './types';

export const programApi = {
  list: (slug: string, page = 1, limit = 20) =>
    apiGet<PaginatedData<Program>>(`/organizations/${slug}/programs?page=${page}&limit=${limit}`),
  get: (slug: string, id: string) => apiGet<Program>(`/organizations/${slug}/programs/${id}`),
  create: (slug: string, data: CreateProgramPayload) =>
    apiPost<Program>(`/organizations/${slug}/programs`, data),
  update: (slug: string, id: string, data: UpdateProgramPayload) =>
    apiPatch<Program>(`/organizations/${slug}/programs/${id}`, data),
  delete: (slug: string, id: string) => apiDelete(`/organizations/${slug}/programs/${id}`),
};
