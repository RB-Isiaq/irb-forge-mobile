import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { invitationApi } from '@/lib/api/invitation';
import type { SendInvitationPayload } from '@/lib/api/types';
import { queryKeys } from '@/lib/query-keys';

export function useOrgInvitations(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.invitations.byOrg(slug ?? ''),
    queryFn: () => invitationApi.listPending(slug as string),
    enabled: Boolean(slug),
  });
}

export function useMyInvitations() {
  return useQuery({ queryKey: queryKeys.invitations.mine(), queryFn: invitationApi.mine });
}

export function useSendInvitation(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendInvitationPayload) => invitationApi.send(slug, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invitations.byOrg(slug) });
    },
  });
}

export function useCancelInvitation(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invitationApi.cancel(slug, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invitations.byOrg(slug) });
    },
  });
}

export function useResendInvitation(slug: string) {
  return useMutation({
    mutationFn: (id: string) => invitationApi.resend(slug, id),
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invitationApi.acceptById(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invitations.mine() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orgs.all() });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invitationApi.declineById(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invitations.mine() });
    },
  });
}
