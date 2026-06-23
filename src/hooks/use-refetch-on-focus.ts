import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Refetches a query whenever the screen regains focus. Tab screens stay mounted,
 * so without this, revisiting a tab (e.g. Announcements) wouldn't pull fresh data
 * — you'd have to change the query key (switch orgs) to force it. Pairs with the
 * AppState→focusManager wiring in the root layout for background→foreground refetch.
 */
export function useRefetchOnFocus(refetch: () => void) {
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );
}
