'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { Boxes, Check, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SafeImage } from '@/components/ui/safe-image';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/features/farmer/FarmerShell';
import { Pager, StatusTabs } from '@/features/farmer/ListingFilterBar';
import { useListingFilters } from '@/features/farmer/useListingFilters';
import { useFetch } from '@/hooks/useFetch';
import { inventoryService } from '@/services/farmer.service';
import { UNIT_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { InventoryItem } from '@/types';

export default function InventoryPage() {
  return (
    <Suspense>
      <Inventory />
    </Suspense>
  );
}

function Inventory() {
  const { status, page, set } = useListingFilters();
  const { data, error, loading, reload, setData } = useFetch(['inventory', 'mine', { status, page }], () => inventoryService.mine({ status, page, limit: 20 }));

  const replace = (updated: InventoryItem) =>
    setData((d) => ({ ...d!, items: d!.items.map((i) => (i.id === updated.id ? updated : i)) }));

  return (
    <>
      <PageHeader title="Inventory" description="Update how much you have left. Changes are live for customers immediately." />
      <StatusTabs value={status} onChange={(s) => set({ status: s })} />

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Skeleton className="h-72" />}

      {data && data.items.length === 0 && (
        <EmptyState
          icon={Boxes}
          title={status === 'all' ? 'No stock to manage yet' : 'Nothing here'}
          description={status === 'all' ? 'Add a product first, then update its stock here.' : 'No products match this filter.'}
          action={
            status === 'all' && (
              <Button asChild>
                <Link href="/farmer/products/new">Add product</Link>
              </Button>
            )
          }
        />
      )}

      {data && data.items.length > 0 && (
        <ul className="divide-y divide-line border border-line bg-white">
          {data.items.map((item) => (
            <StockRow key={item.id} item={item} onUpdated={replace} />
          ))}
        </ul>
      )}
      <Pager meta={data?.meta} onPage={(p) => set({ page: p })} />
    </>
  );
}

/** One row per listing: quick ± steps and a direct "set to" field. */
function StockRow({ item, onUpdated }: { item: InventoryItem; onUpdated: (i: InventoryItem) => void }) {
  const [value, setValue] = useState(String(item.quantityAvailable));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const step = item.unit === 'kg' ? 5 : item.unit === 'g' ? 100 : 1;
  const unit = UNIT_LABELS[item.unit];
  const changed = Number(value) !== item.quantityAvailable;

  const save = async (mode: 'set' | 'add', quantity: number) => {
    setError(null);
    setBusy(true);
    try {
      const { item: updated } = await inventoryService.adjustStock(item.id, mode, quantity);
      onUpdated(updated);
      setValue(String(updated.quantityAvailable));
      setSavedAt(Date.now());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-sand">
          <SafeImage src={item.images[0] ?? item.product.image} alt={item.productName} fill sizes="56px" unoptimized={!!item.images[0]} />
        </div>
        <div>
          <p className="font-semibold">{item.productName}</p>
          <p className={cn('text-sm', item.quantityAvailable <= 0 ? 'text-danger' : 'text-soil-muted')}>
            {item.quantityAvailable <= 0 ? 'Out of stock' : `${item.quantityAvailable} ${unit} left`}
            {item.quantityReserved > 0 && ` · ${item.quantityReserved} reserved in orders`}
            {!item.isActive && ' · paused'}
          </p>
        </div>
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(value);
          if (!Number.isFinite(n) || n < 0) return setError('Enter 0 or more');
          void save('set', n);
        }}
      >
        <Button type="button" variant="outline" size="icon" disabled={busy || item.quantityAvailable < step} onClick={() => save('add', -step)} aria-label={`Remove ${step} ${unit}`}>
          <Minus />
        </Button>
        <label className="sr-only" htmlFor={`qty-${item.id}`}>
          Stock for {item.productName} in {unit}
        </label>
        <Input
          id={`qty-${item.id}`}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-10 w-24 text-center text-base font-semibold"
        />
        <Button type="button" variant="outline" size="icon" disabled={busy} onClick={() => save('add', step)} aria-label={`Add ${step} ${unit}`}>
          <Plus />
        </Button>
        <Button type="submit" size="sm" className="h-10 w-20" disabled={busy || !changed} loading={busy && changed}>
          {savedAt && !changed ? <Check /> : 'Save'}
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-xs text-danger md:w-40">
          {error}
        </p>
      )}
    </li>
  );
}
