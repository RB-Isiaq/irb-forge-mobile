import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { orgApi } from '@/lib/api/org';
import type { CreateOrganizationPayload, UpdateOrganizationPayload } from '@/lib/api/types';
import { queryKeys } from '@/lib/query-keys';

export function useOrgs() {
  return useQuery({ queryKey: queryKeys.orgs.all(), queryFn: orgApi.list });
}

export function useOrg(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.orgs.detail(slug ?? ''),
    queryFn: () => orgApi.get(slug as string),
    enabled: Boolean(slug),
  });
}

export function useCreateOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrganizationPayload) => orgApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orgs.all() });
    },
  });
}

export function useUpdateOrg(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOrganizationPayload) => orgApi.update(slug, data),
    onSuccess: (org) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orgs.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orgs.detail(org.slug) });
    },
  });
}

export function useDeleteOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => orgApi.delete(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orgs.all() });
    },
  });
}
