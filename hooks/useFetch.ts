'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface FetchState<T> {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  /** Re-runs the request; keeps showing current data while refreshing. */
  reload: () => Promise<void>;
  setData: (updater: T | ((prev: T | undefined) => T)) => void;
}

/**
 * Minimal data-fetching hook with loading / error / reload.
 * `deps` re-trigger the request; stale responses are discarded.
 */
export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []): FetchState<T> {
  const [data, setDataState] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (id === requestId.current) setDataState(result);
    } catch (err) {
      if (id === requestId.current) setError(err as Error);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((updater: T | ((prev: T | undefined) => T)) => {
    setDataState((prev) => (typeof updater === 'function' ? (updater as (p: T | undefined) => T)(prev) : updater));
  }, []);

  return { data, error, loading, reload: run, setData };
}
