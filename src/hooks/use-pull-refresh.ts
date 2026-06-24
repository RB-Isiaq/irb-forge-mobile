import { useCallback, useState } from 'react';

/**
 * Tracks a *user-initiated* pull-to-refresh independently of React Query's
 * `isRefetching`, which also flips true for background and focus-triggered
 * refetches. Binding `RefreshControl` to this means the spinner only shows when
 * the user actually pulls down — silent background refreshes (e.g. on every
 * screen focus via `useRefetchOnFocus`) never flash it. Cached content stays on
 * screen and updates underneath without a loading indicator.
 */
export function usePullRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void refetch().finally(() => setRefreshing(false));
  }, [refetch]);
  return { refreshing, onRefresh };
}
