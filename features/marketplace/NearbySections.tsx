'use client';

import Link from 'next/link';
import { ArrowRight, Sprout } from 'lucide-react';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useCustomerLocation, type CustomerLocation } from '@/features/location/LocationProvider';
import { useFetch } from '@/hooks/useFetch';
import { marketplaceService } from '@/services/marketplace.service';
import { FarmCard } from './FarmCard';
import { ListingCard } from './ListingCard';
import { LocationGate, RadiusNote } from './LocationGate';

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold md:text-4xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SeeAll({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf hover:underline">
      {label} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

function FarmsGrid({ location }: { location: CustomerLocation }) {
  const { data, error, loading, reload } = useFetch(['market', 'recommended-farms', location.lat, location.lng], () =>
    marketplaceService.recommendedFarms({ lng: location.lng, lat: location.lat, limit: 6 }),
  );

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="aspect-[4/5]" />
        ))}
      </div>
    );
  }
  if (!data?.items.length) {
    return (
      <EmptyState
        icon={Sprout}
        title={`No farms deliver to ${location.label} yet`}
        description="Khet Se is growing farm by farm. Try a different location, or check back soon."
      />
    );
  }
  return (
    <>
      <RadiusNote meta={data.meta} />
      <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
        {data.items.map((f) => (
          <FarmCard key={f.farm.id} data={f} href={`/farmers/${f.farmer.id}`} />
        ))}
      </div>
    </>
  );
}

function ListingsGrid({ location }: { location: CustomerLocation }) {
  const { data, error, loading, reload } = useFetch(['market', 'recommended-listings', location.lat, location.lng], () =>
    marketplaceService.recommendedListings({ lng: location.lng, lat: location.lat, limit: 8 }),
  );

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4]" />
        ))}
      </div>
    );
  }
  if (!data?.items.length) return null;
  return (
    <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 ${loading ? 'opacity-60' : ''}`}>
      {data.items.map((l) => (
        <ListingCard key={l.id} data={l} href={`/products/${l.id}`} />
      ))}
    </div>
  );
}

/** Homepage: farms near the customer, ranked by the recommendation engine. */
export function NearbyFarmsSection() {
  const { location } = useCustomerLocation();
  return (
    <section className="section py-16 md:py-20" aria-labelledby="nearby-farms">
      <SectionHeading eyebrow="Near you" title="Farmers near you">
        {location && <SeeAll href="/farmers" label="See all farmers" />}
      </SectionHeading>
      <LocationGate>{(loc) => <FarmsGrid location={loc} />}</LocationGate>
    </section>
  );
}

/** Homepage: best-scoring products across nearby farms. Hidden until a location is set. */
export function RecommendedProductsSection() {
  const { location } = useCustomerLocation();
  if (!location) return null;
  return (
    <section className="border-t border-line bg-cream" aria-labelledby="picked-for-you">
      <div className="section py-16 md:py-20">
        <SectionHeading eyebrow="Picked for you" title="Fresh this week, close to home">
          <SeeAll href="/products" label="Shop all products" />
        </SectionHeading>
        <ListingsGrid location={location} />
      </div>
    </section>
  );
}
