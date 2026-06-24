import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Data is "fresh" for 30s (no refetch); after that a revisit shows the
      // cached data immediately and refetches in the background.
      staleTime: 30_000,
      // Keep cached data ~30 min after a screen unmounts, so navigating back
      // renders instantly instead of flashing a loading spinner — like the web app.
      gcTime: 1000 * 60 * 30,
    },
  },
});
