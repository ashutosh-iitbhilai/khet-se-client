'use client';

import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { Tractor } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { useUrlState } from '@/hooks/useUrlState';
import { marketplaceService, type FarmQuery } from '@/services/marketplace.service';
import { CATEGORIES, categoryType } from '@/lib/categories';
import type { CustomerLocation } from '@/features/location/LocationProvider';
import { FarmCard } from './FarmCard';
import { RadiusNote } from './LocationGate';
import { ChipGroup, ClearFilters, DISTANCE_OPTIONS, PRICE_OPTIONS, PillSelect, ToggleChip } from './Filters';

const DEFAULTS = { sort: 'recommended', radius: 'auto', category: '', maxPrice: 'any', organic: false, page: 1 };

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'distance', label: 'Nearest first' },
  { value: 'rating', label: 'Top rated' },
];

const PAGE_SIZE = 12;

/** /farmers — discover farms that deliver to the customer. */
export function FarmerBrowser({ location }: { location: CustomerLocation }) {
  const [f, set, reset] = useUrlState(DEFAULTS);

  const query: FarmQuery = {
    lng: location.lng,
    lat: location.lat,
    sort: f.sort as FarmQuery['sort'],
    radiusKm: f.radius === 'auto' ? undefined : Number(f.radius),
    category: f.category || undefined,
    type: categoryType(f.category),
    maxPrice: f.maxPrice === 'any' ? undefined : Number(f.maxPrice),
    organic: f.organic || undefined,
    page: f.page,
    limit: PAGE_SIZE,
  };
  const { data, error, loading, reload } = useFetch(
    () => marketplaceService.nearbyFarms(query),
    [location.lat, location.lng, f.sort, f.radius, f.category, f.maxPrice, f.organic, f.page],
  );
  const filtered = Boolean(f.category || f.radius !== 'auto' || f.maxPrice !== 'any' || f.organic);

  return (
    <div>
      <ChipGroup
        label="What they sell"
        value={f.category}
        onChange={(v) => set({ category: v })}
        options={[
          { value: '', label: 'Everything' },
          ...CATEGORIES.fresh.map((c) => ({ value: c.slug, label: c.label })),
          ...CATEGORIES.dry.map((c) => ({ value: c.slug, label: c.label })),
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2 border-y border-line py-3">
        <PillSelect id="farm-sort" label="Sort" value={f.sort} options={SORTS} onChange={(v) => set({ sort: v })} />
        <PillSelect id="farm-distance" label="Distance" value={f.radius} options={DISTANCE_OPTIONS} onChange={(v) => set({ radius: v })} />
        <PillSelect id="farm-price" label="Price" value={f.maxPrice} options={PRICE_OPTIONS} onChange={(v) => set({ maxPrice: v })} />
        <ToggleChip pressed={f.organic} onChange={(v) => set({ organic: v })}>
          Organic verified only
        </ToggleChip>
        {filtered && <ClearFilters onClick={reset} />}
      </div>

      <div className="mt-6" aria-live="polite">
        {data && (
          <p className="mb-4 text-sm text-soil-muted">
            {data.meta.total} {data.meta.total === 1 ? 'farm delivers' : 'farms deliver'} to {location.label}
          </p>
        )}
        <RadiusNote meta={data?.meta} />
        {error && <ErrorState error={error} onRetry={reload} />}
        {loading && !data && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="aspect-[4/5]" />
            ))}
          </div>
        )}
        {data && data.items.length === 0 && (
          <EmptyState
            icon={Tractor}
            title="No farms match"
            description={filtered ? 'Try removing a filter or widening the distance.' : 'No farms deliver to this location yet.'}
            action={filtered ? <Button variant="outline" onClick={reset}>Clear filters</Button> : undefined}
          />
        )}
        {data && data.items.length > 0 && (
          <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((farm) => (
              <FarmCard key={farm.farm.id} data={farm} href={`/farmers/${farm.farmer.id}`} />
            ))}
          </div>
        )}
        {data && data.meta.totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
            <Button variant="outline" disabled={f.page <= 1} onClick={() => set({ page: f.page - 1 })}>
              Previous
            </Button>
            <span className="px-3 text-sm text-soil-muted">
              Page {data.meta.page} of {data.meta.totalPages}
            </span>
            <Button variant="outline" disabled={f.page >= data.meta.totalPages} onClick={() => set({ page: f.page + 1 })}>
              Next
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
}
