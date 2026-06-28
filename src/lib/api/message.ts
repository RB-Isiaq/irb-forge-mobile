import { apiGet, apiPost } from './client';
import type { Message, PaginatedData, SendMessagePayload } from './types';

export const messageApi = {
  list: (slug: string, page = 1, limit = 20) =>
    apiGet<PaginatedData<Message>>(`/organizations/${slug}/messages?page=${page}&limit=${limit}`),
  send: (slug: string, data: SendMessagePayload) =>
    apiPost<Message>(`/organizations/${slug}/messages`, data),
};
