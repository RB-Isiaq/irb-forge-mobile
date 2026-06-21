import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { memberApi } from '@/lib/api/member';
import type { UpdateMemberRolePayload } from '@/lib/api/types';
import { queryKeys } from '@/lib/query-keys';

export function useMembers(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.members.list(slug ?? ''),
    queryFn: () => memberApi.list(slug as string),
    enabled: Boolean(slug),
  });
}

export function useMyMembership(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.members.me(slug ?? ''),
    queryFn: () => memberApi.getMe(slug as string),
    enabled: Boolean(slug),
  });
}

export function useUpdateMemberRole(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateMemberRolePayload }) =>
      memberApi.updateRole(slug, userId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.members.list(slug) });
    },
  });
}

export function useRemoveMember(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => memberApi.remove(slug, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.members.list(slug) });
    },
  });
}
