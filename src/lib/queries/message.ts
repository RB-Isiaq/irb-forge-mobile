import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { messageApi } from '@/lib/api/message';
import type { SendMessagePayload } from '@/lib/api/types';
import { queryKeys } from '@/lib/query-keys';

export function useMessages(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.messages.byOrg(slug ?? ''),
    queryFn: () => messageApi.list(slug as string),
    enabled: Boolean(slug),
  });
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
