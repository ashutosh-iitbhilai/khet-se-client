'use client';

import { useEffect, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useFetch } from '@/hooks/useFetch';
import { useUrlState } from '@/hooks/useUrlState';
import { marketplaceService, type ListingQuery } from '@/services/marketplace.service';
import { CATEGORIES, categoryLabel, categoryType } from '@/lib/categories';
import type { CustomerLocation } from '@/features/location/LocationProvider';
import { ListingCard } from './ListingCard';
import { RadiusNote } from './LocationGate';
import { ChipGroup, ClearFilters, DISTANCE_OPTIONS, PRICE_OPTIONS, PillSelect, ToggleChip } from './Filters';

const DEFAULTS = {
  q: '',
  type: 'all',
  category: '',
  sort: 'recommended',
  maxPrice: 'any',
  radius: 'auto',
  organic: false,
  page: 1,
};

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'distance', label: 'Nearest first' },
  { value: 'freshness', label: 'Freshest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

const PAGE_SIZE = 24;

/** /products — every listing that can be delivered to the customer, with filters in the URL. */
export function ProductBrowser({ location }: { location: CustomerLocation }) {
  const [f, set, reset] = useUrlState(DEFAULTS);
  const [search, setSearch] = useState(f.q);
  useEffect(() => setSearch(f.q), [f.q]);

  // A category implies its type (e.g. arriving from a homepage category tile).
  const type = f.category ? (categoryType(f.category) ?? f.type) : f.type;

  const query: ListingQuery = {
    lng: location.lng,
    lat: location.lat,
    q: f.q || undefined,
    type: type === 'all' ? undefined : (type as 'fresh' | 'dry'),
    category: f.category || undefined,
    sort: f.sort as ListingQuery['sort'],
    maxPrice: f.maxPrice === 'any' ? undefined : Number(f.maxPrice),
    radiusKm: f.radius === 'auto' ? undefined : Number(f.radius),
    organic: f.organic || undefined,
    page: f.page,
    limit: PAGE_SIZE,
  };
  const { data, error, loading, reload } = useFetch(['market', 'listings', query], () => marketplaceService.listings(query));

  const filtered = Boolean(f.q || f.category || type !== 'all' || f.maxPrice !== 'any' || f.radius !== 'auto' || f.organic);
  const categoryOptions = type === 'all' ? [] : CATEGORIES[type as 'fresh' | 'dry'];

  return (
    <div>
      {/* Search */}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          set({ q: search.trim() });
        }}
        className="flex max-w-xl"
      >
        <label htmlFor="product-search" className="sr-only">
          Search vegetables
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-muted" />
          <input
            id="product-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tomato, palak, dried chilli…"
            className="h-12 w-full border border-r-0 border-line bg-white pl-10 pr-3 text-base focus-visible:border-leaf focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <Button type="submit" size="lg">
          Search
        </Button>
      </form>

      {/* Type + category */}
      <div className="mt-6 space-y-3">
        <ChipGroup
          label="Product type"
          value={type}
          onChange={(v) => set({ type: v, category: '' })}
          options={[
            { value: 'all', label: 'All produce' },
            { value: 'fresh', label: 'Fresh vegetables' },
            { value: 'dry', label: 'Dry products' },
          ]}
        />
        {categoryOptions.length > 0 && (
          <ChipGroup
            label="Category"
            value={f.category}
            onChange={(v) => set({ category: v })}
            options={[{ value: '', label: 'All' }, ...categoryOptions.map((c) => ({ value: c.slug, label: c.label }))]}
          />
        )}
      </div>

      {/* Refinements */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-y border-line py-3">
        <PillSelect id="sort" label="Sort" value={f.sort} options={SORTS} onChange={(v) => set({ sort: v })} />
        <PillSelect id="distance" label="Distance" value={f.radius} options={DISTANCE_OPTIONS} onChange={(v) => set({ radius: v })} />
        <PillSelect id="price" label="Price" value={f.maxPrice} options={PRICE_OPTIONS} onChange={(v) => set({ maxPrice: v })} />
        <ToggleChip pressed={f.organic} onChange={(v) => set({ organic: v })}>
          Organic verified only
        </ToggleChip>
        {filtered && <ClearFilters onClick={reset} />}
      </div>

      {/* Results */}
      <div className="mt-6" aria-live="polite">
        {data && (
          <p className="mb-4 text-sm text-soil-muted">
            {data.meta.total} {data.meta.total === 1 ? 'product' : 'products'}
            {f.q && ` matching “${f.q}”`}
            {f.category && ` in ${categoryLabel(f.category)}`} delivering to {location.label}
          </p>
        )}
        <RadiusNote meta={data?.meta} what="farms" />

        {error && <ErrorState error={error} onRetry={reload} />}

        {loading && !data && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        )}

        {data && data.items.length === 0 && (
          <EmptyState
            icon={SearchX}
            title="Nothing matches right now"
            description={
              filtered
                ? 'Try removing a filter, searching for something else, or widening the distance.'
                : 'No farms deliver to this location yet. Try another address.'
            }
            action={filtered ? <Button variant="outline" onClick={reset}>Clear filters</Button> : undefined}
          />
        )}

        {data && data.items.length > 0 && (
          <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((l) => (
              <ListingCard key={l.id} data={l} href={`/products/${l.id}`} />
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
