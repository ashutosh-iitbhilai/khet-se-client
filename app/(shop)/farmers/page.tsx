'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/states';
import { LocationGate } from '@/features/marketplace/LocationGate';
import { FarmerBrowser } from '@/features/marketplace/FarmerBrowser';

export default function FarmersPage() {
  return (
    <div className="section py-10 md:py-14">
      <p className="eyebrow">Farmers</p>
      <h1 className="mt-2 text-4xl font-semibold">Meet the farmers near you</h1>
      <p className="mt-2 max-w-2xl text-soil-muted">
        Every farm here delivers to your area. Compare how close they are, what they grow and how other customers rate them.
      </p>
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <LocationGate message="Set your delivery location to see farmers who deliver to you.">
            {(loc) => <FarmerBrowser location={loc} />}
          </LocationGate>
        </Suspense>
      </div>
    </div>
  );
}
