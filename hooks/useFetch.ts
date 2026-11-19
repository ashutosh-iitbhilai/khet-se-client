'use client';

import { keepPreviousData, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useCallback } from 'react';

interface FetchState<T> {
  data: T | undefined;
  /** Only when there is nothing to show; a failed background refresh keeps the last good data. */
  error: Error | null;
  /** True while there is no data yet, or while showing the previous page's data for a new one. */
  loading: boolean;
  /** Fetch again now (also happens automatically after changes and when you return to the tab). */
  reload: () => Promise<void>;
  /** Update the cached value directly, e.g. with the object a change returned. */
  setData: (updater: T | ((prev: T | undefined) => T)) => void;
}

interface FetchOptions {
  /** Poll while the screen is open (ms), e.g. order queues and the job board. */
  refetchInterval?: number;
  enabled?: boolean;
}

/**
 * Data for one screen, from the shared cache. The key names the data: its first element is
 * the area (see lib/queryClient.ts), the rest are the parameters (ids, page, filters, location).
 * Screens that use the same key share one request and always show the same data.
 */
export function useFetch<T>(key: QueryKey, fetcher: () => Promise<T>, opts: FetchOptions = {}): FetchState<T> {
  const client = useQueryClient();
  const q = useQuery({
    queryKey: key,
    queryFn: fetcher,
    placeholderData: keepPreviousData,
    refetchInterval: opts.refetchInterval,
    enabled: opts.enabled,
  });

  const reload = useCallback(async () => {
    await q.refetch();
  }, [q]);

  const setData = useCallback(
    (updater: T | ((prev: T | undefined) => T)) => {
      client.setQueryData<T>(key, (prev) => (typeof updater === 'function' ? (updater as (p: T | undefined) => T)(prev) : updater));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client, JSON.stringify(key)],
  );

  return {
    data: q.data,
    error: q.data === undefined ? (q.error as Error | null) : null,
    // isPending with an idle fetch means the query is switched off (enabled: false), not loading.
    loading: (q.isPending && q.fetchStatus !== 'idle') || q.isPlaceholderData,
    reload,
    setData,
  };
}
