import { apiGet, apiPost } from './client';
import type { Message, PaginatedData, SendMessagePayload } from './types';

export const messageApi = {
  list: (slug: string) => apiGet<PaginatedData<Message>>(`/organizations/${slug}/messages`),
  send: (slug: string, data: SendMessagePayload) =>
    apiPost<Message>(`/organizations/${slug}/messages`, data),
};
