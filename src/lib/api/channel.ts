import { apiDelete, apiGet, apiPost } from './client';
import type {
  AddChannelMemberPayload,
  Channel,
  ChannelMember,
  ChannelMessage,
  CreateChannelPayload,
  CursorPaginatedData,
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
  // Cursor-paginated, newest-first ({ items, nextCursor }). We load only the
  // latest page today; pass `before=<nextCursor>` to page older messages when we
  // add scroll-up history. Cursor (not offset) so the 5s poll inserting new rows
  // at the head doesn't shift page boundaries.
  list: (slug: string, channelId: string) =>
    apiGet<CursorPaginatedData<ChannelMessage>>(
      `/organizations/${slug}/channels/${channelId}/messages`
    ),
  send: (slug: string, channelId: string, data: SendChannelMessagePayload) =>
    apiPost<ChannelMessage>(`/organizations/${slug}/channels/${channelId}/messages`, data),
};
