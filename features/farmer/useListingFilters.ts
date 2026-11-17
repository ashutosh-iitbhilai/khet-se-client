'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'On sale' },
  { value: 'low', label: 'Running low' },
  { value: 'out', label: 'Out of stock' },
  { value: 'inactive', label: 'Paused' },
] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number]['value'];

/** Status / page filters kept in the URL so they survive refresh and back-navigation. */
export function useListingFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const raw = params.get('status');
  const status: StatusFilter = STATUS_FILTERS.some((s) => s.value === raw) ? (raw as StatusFilter) : 'all';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const set = useCallback(
    (next: { status?: StatusFilter; page?: number }) => {
      const sp = new URLSearchParams();
      const s = next.status ?? status;
      const p = next.page ?? (next.status ? 1 : page);
      if (s !== 'all') sp.set('status', s);
      if (p > 1) sp.set('page', String(p));
      router.replace(`${pathname}${sp.size ? `?${sp}` : ''}`, { scroll: false });
    },
    [status, page, router, pathname],
  );

  return { status, page, set, flash: params.get('added') ? 'added' : params.get('saved') ? 'saved' : null };
}
