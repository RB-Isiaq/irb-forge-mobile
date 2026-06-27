import { apiDelete, apiGet, apiPost } from './client';
import type {
  AddChannelMemberPayload,
  Channel,
  ChannelMember,
  ChannelMessage,
  CreateChannelPayload,
  PaginatedData,
  SendChannelMessagePayload,
} from './types';

export const channelApi = {
  list: (slug: string) => apiGet<Channel[]>(`/organizations/${slug}/channels`),
  create: (slug: string, data: CreateChannelPayload) =>
    apiPost<Channel>(`/organizations/${slug}/channels`, data),
  delete: (slug: string, channelId: string) =>
    apiDelete<void>(`/organizations/${slug}/channels/${channelId}`),
  listMembers: (slug: string, channelId: string) =>
    apiGet<ChannelMember[]>(`/organizations/${slug}/channels/${channelId}/members`),
  addMember: (slug: string, channelId: string, data: AddChannelMemberPayload) =>
    apiPost<unknown>(`/organizations/${slug}/channels/${channelId}/members`, data),
  removeMember: (slug: string, channelId: string, userId: string) =>
    apiDelete<void>(`/organizations/${slug}/channels/${channelId}/members/${userId}`),
};

export const channelMessageApi = {
  // Loads the latest page only (backend default: 20, newest-first). This is
  // deliberate: the channel polls every 5s for new messages, and the backend
  // paginates by offset — so scroll-up "load older" would shift page boundaries
  // on each new message and duplicate/skip rows. Proper history needs cursor
  // (createdAt/id) pagination on the backend before we add infinite scroll here.
  list: (slug: string, channelId: string) =>
    apiGet<PaginatedData<ChannelMessage>>(`/organizations/${slug}/channels/${channelId}/messages`),
  send: (slug: string, channelId: string, data: SendChannelMessagePayload) =>
    apiPost<ChannelMessage>(`/organizations/${slug}/channels/${channelId}/messages`, data),
};
