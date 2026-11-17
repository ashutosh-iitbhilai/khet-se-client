'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { Eye, EyeOff, Package, Pencil, PlusSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { SafeImage } from '@/components/ui/safe-image';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/features/farmer/FarmerShell';
import { Pager, StatusTabs } from '@/features/farmer/ListingFilterBar';
import { useListingFilters } from '@/features/farmer/useListingFilters';
import { useFetch } from '@/hooks/useFetch';
import { inventoryService } from '@/services/farmer.service';
import { daysAgo, formatDate, UNIT_LABELS } from '@/lib/labels';
import { formatINR } from '@/lib/utils';
import type { InventoryItem } from '@/types';

export default function MyProductsPage() {
  return (
    <Suspense>
      <MyProducts />
    </Suspense>
  );
}

function MyProducts() {
  const { status, page, set, flash } = useListingFilters();
  const { data, error, loading, reload } = useFetch(() => inventoryService.mine({ status, page, limit: 20 }), [status, page]);
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="My products"
        description="Everything you sell on Khet Se."
        action={
          <Button asChild>
            <Link href="/farmer/products/new">
              <PlusSquare /> Add product
            </Link>
          </Button>
        }
      />

      {flash === 'added' && <div className="mb-5"><Alert tone="success">Listing published.</Alert></div>}
      {flash === 'saved' && <div className="mb-5"><Alert tone="success">Changes saved.</Alert></div>}
      {actionError && <div className="mb-5"><Alert>{actionError}</Alert></div>}

      <StatusTabs value={status} onChange={(s) => set({ status: s })} />

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && (
        <EmptyState
          icon={Package}
          title={status === 'all' ? 'No products yet' : 'Nothing here'}
          description={status === 'all' ? 'List your first vegetable — it takes about a minute.' : 'No products match this filter.'}
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
        <ul className={`divide-y divide-line border border-line bg-white ${loading ? 'opacity-60' : ''}`}>
          {data.items.map((item) => (
            <ProductRow key={item.id} item={item} onChanged={reload} onError={setActionError} />
          ))}
        </ul>
      )}

      <Pager meta={data?.meta} onPage={(p) => set({ page: p })} />
    </>
  );
}

function ProductRow({ item, onChanged, onError }: { item: InventoryItem; onChanged: () => void; onError: (m: string | null) => void }) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const age = daysAgo(item.harvestDate);
  const out = item.quantityAvailable <= 0;

  const run = async (fn: () => Promise<unknown>) => {
    onError(null);
    setBusy(true);
    try {
      await fn();
      onChanged();
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <li className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-sand">
          <SafeImage src={item.images[0] ?? item.product.image} alt={item.productName} fill sizes="64px" unoptimized={!!item.images[0]} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{item.productName}</p>
            {!item.isActive ? <Badge>Paused</Badge> : out ? <Badge tone="red">Out of stock</Badge> : <Badge tone="green">On sale</Badge>}
          </div>
          <p className="mt-0.5 text-sm">
            <strong>{formatINR(item.price)}</strong>
            <span className="text-soil-muted">
              {' '}/ {UNIT_LABELS[item.unit]}
              {item.packSizeGrams ? ` (${item.packSizeGrams} g)` : ''} · {item.quantityAvailable} {UNIT_LABELS[item.unit]} in stock
            </span>
          </p>
          <p className="text-xs text-soil-muted">
            {item.productType === 'fresh'
              ? `Harvested ${age === 0 ? 'today' : age === 1 ? 'yesterday' : `${age} days ago`}`
              : `Best before ${formatDate(item.expiryDate)}`}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {confirming ? (
          <>
            <span className="text-sm">Delete this listing?</span>
            <Button size="sm" className="bg-danger hover:bg-danger/90" loading={busy} onClick={() => run(() => inventoryService.remove(item.id))}>
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Keep
            </Button>
          </>
        ) : (
          <>
            <Button asChild size="sm" variant="outline">
              <Link href={`/farmer/products/${item.id}`}>
                <Pencil /> Edit
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => run(() => inventoryService.update(item.id, { isActive: !item.isActive }))}
            >
              {item.isActive ? <EyeOff /> : <Eye />}
              {item.isActive ? 'Pause' : 'Publish'}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setConfirming(true)} aria-label={`Delete ${item.productName}`}>
              <Trash2 className="text-soil-muted" />
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
