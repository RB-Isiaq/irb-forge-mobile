import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { subscriptionApi } from '@/lib/api/subscription';
import { queryKeys } from '@/lib/query-keys';

export function useSubscription(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.subscription.byOrg(slug ?? ''),
    queryFn: () => subscriptionApi.getByOrg(slug as string),
    enabled: Boolean(slug),
  });
}

export function useOrgPayments(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.payments.byOrg(slug ?? ''),
    queryFn: () => subscriptionApi.getPayments(slug as string),
    enabled: Boolean(slug),
  });
}

export function useCreateCheckout(slug: string) {
  return useMutation({
    mutationFn: () => subscriptionApi.createCheckout(slug),
  });
}

export function useCancelSubscription(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionApi.cancel(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.subscription.byOrg(slug) });
    },
  });
}
