'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { useFetch } from '@/hooks/useFetch';
import { productService } from '@/services/farmer.service';
import { CATEGORY_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { Product, ProductType } from '@/types';

/** Step 1 of "Add product": choose what you are selling from the shared catalogue. */
export function ProductPicker({ onPick, listedIds }: { onPick: (p: Product) => void; listedIds: Set<string> }) {
  const [type, setType] = useState<ProductType>('fresh');
  const [q, setQ] = useState('');
  const { data, error, loading, reload } = useFetch(['catalogue', type], () => productService.list({ type, limit: 100 }), {});

  const items = (data?.items ?? []).filter((p) => {
    const s = q.trim().toLowerCase();
    return !s || p.name.toLowerCase().includes(s) || p.localName?.toLowerCase().includes(s);
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex border border-line bg-white p-1" role="tablist">
          {(['fresh', 'dry'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={type === t}
              onClick={() => setType(t)}
              className={cn('px-4 py-2 text-sm font-medium', type === t ? 'bg-leaf text-white' : 'text-soil hover:bg-cream')}
            >
              {t === 'fresh' ? 'Fresh vegetables' : 'Dry products'}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search e.g. tamatar"
            aria-label="Search products"
            className="h-10 w-full border border-line bg-white pl-9 pr-3 text-sm focus-visible:border-leaf focus-visible:ring-1 focus-visible:ring-leaf focus-visible:ring-offset-0"
          />
        </div>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorState error={error} onRetry={reload} />
        </div>
      )}

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {loading && !data
          ? Array.from({ length: 8 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="aspect-[4/5]" />
              </li>
            ))
          : items.map((p) => {
              const listed = listedIds.has(p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onPick(p)}
                    className="group block w-full border border-line bg-white text-left transition-colors hover:border-leaf"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                      <SafeImage src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 220px, 45vw" className="transition-transform duration-300 group-hover:scale-[1.03]" />
                      {listed && (
                        <span className="absolute left-0 top-0 bg-leaf px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Listed</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-soil-muted">{p.localName ?? CATEGORY_LABELS[p.category]}</p>
                    </div>
                  </button>
                </li>
              );
            })}
      </ul>
      {data && items.length === 0 && (
        <p className="mt-6 text-center text-sm text-soil-muted">
          No match for “{q}”. Ask the Khet Se team to add it to the catalogue.
        </p>
      )}
    </div>
  );
}
