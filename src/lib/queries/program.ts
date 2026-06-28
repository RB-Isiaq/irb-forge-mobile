import { useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';

import { programApi } from '@/lib/api/program';
import type {
  CreateProgramPayload,
  PaginatedData,
  Program,
  UpdateProgramPayload,
} from '@/lib/api/types';
import { queryKeys } from '@/lib/query-keys';
import { usePaginatedList } from '@/lib/queries/use-paginated-list';

export function usePrograms(slug: string | null) {
  return usePaginatedList(
    queryKeys.programs.list(slug ?? ''),
    (page) => programApi.list(slug as string, page),
    Boolean(slug)
  );
}

export function useProgram(slug: string | null, id: string | null) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.programs.detail(slug ?? '', id ?? ''),
    queryFn: () => programApi.get(slug as string, id as string),
    enabled: Boolean(slug && id),
    // Seed from the (paginated) programs list cache so the detail page opens
    // instantly, then refetches the full record in the background.
    placeholderData: () =>
      queryClient
        .getQueryData<InfiniteData<PaginatedData<Program>>>(queryKeys.programs.list(slug ?? ''))
        ?.pages.flatMap((pg) => pg.items)
        .find((p) => p.id === id),
  });
}

export function useCreateProgram(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProgramPayload) => programApi.create(slug, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.programs.list(slug) });
    },
  });
}

export function useUpdateProgram(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProgramPayload }) =>
      programApi.update(slug, id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.programs.list(slug) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.programs.detail(slug, id) });
    },
  });
}

export function useDeleteProgram(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => programApi.delete(slug, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.programs.list(slug) });
    },
  });
}
