import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query';

import type { PaginatedData } from '@/lib/api/types';

/**
 * Offset-paginated infinite query for list endpoints that return `PaginatedData`
 * (`{ items, total, page, pages }`). Pairs with `flattenPages` + a FlatList
 * `onEndReached` to load more on scroll. Safe with offset paging because these
 * lists don't live-poll, so new rows never shift loaded page boundaries.
 */
export function usePaginatedList<T>(
  queryKey: QueryKey,
  fetchPage: (page: number) => Promise<PaginatedData<T>>,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
  });
}

/** Flatten an infinite query's loaded pages into a single item array. */
export function flattenPages<T>(data: { pages: PaginatedData<T>[] } | undefined): T[] {
  return data?.pages.flatMap((page) => page.items) ?? [];
}
