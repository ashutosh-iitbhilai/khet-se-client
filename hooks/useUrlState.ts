'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

type Value = string | number | boolean | undefined;

function parse<T extends Record<string, Value>>(params: URLSearchParams, defaults: T): T {
  const out = { ...defaults } as Record<string, Value>;
  for (const [key, def] of Object.entries(defaults)) {
    const raw = params.get(key);
    if (raw === null) continue;
    if (typeof def === 'number') {
      const n = Number(raw);
      if (Number.isFinite(n)) out[key] = n;
    } else if (typeof def === 'boolean') out[key] = raw === 'true';
    else out[key] = raw;
  }
  return out as T;
}

/**
 * Filter state stored in the URL query string, so filtered pages can be shared,
 * bookmarked and survive back/forward. Values equal to their default are omitted.
 * Changing any filter other than `page` resets `page` to 1.
 */
export function useUrlState<T extends Record<string, Value>>(defaults: T) {
  const params = useSearchParams();
  const pathname = usePathname();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const state = useMemo(() => parse(new URLSearchParams(params.toString()), defaults), [params]);

  const set = useCallback(
    (patch: Partial<T>) => {
      // Read the live URL, not the last render: two quick changes in a row (e.g. pick a
      // type, then search) must not overwrite each other with stale values.
      const current = parse(new URLSearchParams(window.location.search), defaults);
      const next = { ...current, ...patch } as Record<string, Value>;
      if (!('page' in patch) && 'page' in defaults) next.page = defaults.page;
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) {
        if (v === undefined || v === '' || v === defaults[k]) continue;
        sp.set(k, String(v));
      }
      // Native replaceState updates the URL synchronously (so the next read sees it) and
      // Next.js syncs it into useSearchParams — no navigation, no scroll jump.
      window.history.replaceState(null, '', `${pathname}${sp.size ? `?${sp}` : ''}`);
    },
    [defaults, pathname],
  );

  const reset = useCallback(() => window.history.replaceState(null, '', pathname), [pathname]);

  return [state, set, reset] as const;
}
