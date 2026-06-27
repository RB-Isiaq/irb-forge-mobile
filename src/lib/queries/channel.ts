import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { channelApi, channelMessageApi } from '@/lib/api/channel';
import type {
  AddChannelMemberPayload,
  CreateChannelPayload,
  SendChannelMessagePayload,
} from '@/lib/api/types';
import { queryKeys } from '@/lib/query-keys';

export function useChannels(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.channels.byOrg(slug ?? ''),
    queryFn: () => channelApi.list(slug as string),
    enabled: Boolean(slug),
  });
}

export function useCreateChannel(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChannelPayload) => channelApi.create(slug, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.channels.byOrg(slug) });
    },
  });
}

export function useDeleteChannel(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (channelId: string) => channelApi.delete(slug, channelId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.channels.byOrg(slug) });
    },
  });
}

export function useChannelMembers(slug: string | null, channelId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.channels.members(slug ?? '', channelId ?? ''),
    queryFn: () => channelApi.listMembers(slug as string, channelId as string),
    enabled: Boolean(slug) && Boolean(channelId) && enabled,
  });
}

export function useAddChannelMember(slug: string, channelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddChannelMemberPayload) => channelApi.addMember(slug, channelId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.channels.members(slug, channelId),
      });
    },
  });
}

export function useRemoveChannelMember(slug: string, channelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => channelApi.removeMember(slug, channelId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.channels.members(slug, channelId),
      });
    },
  });
}

export function useChannelMessages(slug: string | null, channelId: string | null) {
  return useQuery({
    queryKey: queryKeys.channels.messages(slug ?? '', channelId ?? ''),
    queryFn: () => channelMessageApi.list(slug as string, channelId as string),
    enabled: Boolean(slug) && Boolean(channelId),
    refetchInterval: 5_000,
  });
}

export function useSendChannelMessage(slug: string, channelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendChannelMessagePayload) => channelMessageApi.send(slug, channelId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.channels.messages(slug, channelId),
      });
    },
  });
}
