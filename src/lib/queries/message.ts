import { useMutation, useQueryClient } from '@tanstack/react-query';

import { messageApi } from '@/lib/api/message';
import type { SendMessagePayload } from '@/lib/api/types';
import { queryKeys } from '@/lib/query-keys';
import { usePaginatedList } from '@/lib/queries/use-paginated-list';

export function useMessages(slug: string | null) {
  return usePaginatedList(
    queryKeys.messages.byOrg(slug ?? ''),
    (page) => messageApi.list(slug as string, page),
    Boolean(slug)
  );
}

export function useSendMessage(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessagePayload) => messageApi.send(slug, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages.byOrg(slug) });
    },
  });
}
