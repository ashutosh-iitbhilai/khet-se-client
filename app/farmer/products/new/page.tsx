'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/features/farmer/FarmerShell';
import { ProductPicker } from '@/features/farmer/ProductPicker';
import { ListingForm } from '@/features/farmer/ListingForm';
import { useFetch } from '@/hooks/useFetch';
import { farmerService, inventoryService } from '@/services/farmer.service';
import type { Product } from '@/types';

export default function AddProductPage() {
  const router = useRouter();
  const [picked, setPicked] = useState<Product | null>(null);

  const { data, error, loading, reload } = useFetch(async () => {
    const [me, listings] = await Promise.all([farmerService.me(), inventoryService.mine({ limit: 50 })]);
    return { farms: me.farms, listings: listings.items };
  });

  const listedIds = useMemo(
    () => new Set((data?.listings ?? []).map((l) => (typeof l.product === 'string' ? l.product : l.product.id))),
    [data],
  );

  const existing = picked && data?.farms.length === 1 ? data.listings.find((l) => l.product.id === picked.id) : undefined;

  return (
    <>
      <PageHeader
        title="Add product"
        description={picked ? 'Set your price, stock and freshness.' : 'Step 1 of 2 — what are you selling?'}
      />

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Skeleton className="h-96" />}

      {data && data.farms.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="Register your farm first"
          description="Customers find products by how close the farm is, so we need your farm’s location before you can list."
          action={
            <Button asChild>
              <Link href="/farmer/farm#farm">Register my farm</Link>
            </Button>
          }
        />
      )}

      {data && data.farms.length > 0 && !picked && <ProductPicker onPick={setPicked} listedIds={listedIds} />}

      {data && picked && existing && (
        <div className="border border-line bg-white p-6 sm:p-8">
          <p className="text-sm">
            You already sell <strong>{picked.name}</strong>. Update that listing instead of creating a second one.
          </p>
          <div className="mt-4 flex gap-3">
            <Button asChild>
              <Link href={`/farmer/products/${existing.id}`}>Edit {picked.name}</Link>
            </Button>
            <Button variant="ghost" onClick={() => setPicked(null)}>
              Choose another product
            </Button>
          </div>
        </div>
      )}

      {data && picked && !existing && (
        <div className="border border-line bg-white p-6 sm:p-8">
          <ListingForm
            product={picked}
            farms={data.farms}
            onSaved={() => router.push('/farmer/products?added=1')}
            onCancel={() => setPicked(null)}
          />
        </div>
      )}
    </>
  );
}
