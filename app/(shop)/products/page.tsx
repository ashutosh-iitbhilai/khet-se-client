'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/states';
import { LocationGate } from '@/features/marketplace/LocationGate';
import { ProductBrowser } from '@/features/marketplace/ProductBrowser';

export default function ProductsPage() {
  return (
    <div className="section py-10 md:py-14">
      <p className="eyebrow">Shop</p>
      <h1 className="mt-2 text-4xl font-semibold">Fresh & dry produce near you</h1>
      <p className="mt-2 text-soil-muted">Straight from local farms — every listing shows who grew it and how far away they are.</p>
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <LocationGate message="Set your delivery location to see what farms near you are selling today.">
            {(loc) => <ProductBrowser location={loc} />}
          </LocationGate>
        </Suspense>
      </div>
    </div>
  );
}
