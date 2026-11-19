'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CalendarDays, ChevronRight, CircleAlert, Clock, Leaf, MapPin, Package, Scale, Truck } from 'lucide-react';
import { Gallery } from '@/components/ui/gallery';
import { Skeleton } from '@/components/ui/states';
import { useFetch } from '@/hooks/useFetch';
import { useCustomerLocation } from '@/features/location/LocationProvider';
import { marketplaceService } from '@/services/marketplace.service';
import { categoryLabel } from '@/lib/categories';
import { formatDate, formatKm, freshnessLabel, unitLabel, UNIT_LABELS } from '@/lib/labels';
import { formatINR } from '@/lib/utils';
import type { ListingDetail } from '@/types';
import { FarmerBadges } from './FarmerBadges';
import { AddToCart } from '@/features/cart/AddToCart';
import { ListingCard } from './ListingCard';
import { Rating } from './RatingStars';
import { SectionHeading } from './NearbySections';

const FarmMap = dynamic(() => import('@/components/map/FarmMap'), { ssr: false, loading: () => <Skeleton className="h-full w-full" /> });

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex gap-3 border-b border-line py-3 last:border-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" aria-hidden />
      <div className="flex flex-1 flex-wrap justify-between gap-x-4 text-sm">
        <span className="text-soil-muted">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

function DeliveryNote({ item, hasLocation }: { item: ListingDetail; hasLocation: boolean }) {
  if (!hasLocation) {
    return <p className="text-sm text-soil-muted">Set your delivery location to check if this farm delivers to you.</p>;
  }
  if (item.deliversToYou) {
    return (
      <p className="flex items-center gap-2 text-sm text-leaf-dark">
        <Truck className="h-4 w-4" aria-hidden /> Delivers to you · farm is {formatKm(item.distanceKm ?? 0)} away
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 text-sm text-turmeric">
      <CircleAlert className="h-4 w-4" aria-hidden />
      This farm is {formatKm(item.distanceKm ?? 0)} away and delivers within {item.farmDetails.deliveryRadiusKm} km
      {item.farmDetails.pickupAvailable ? ' — farm pickup is available.' : '.'}
    </p>
  );
}

export function ListingDetailView({ item }: { item: ListingDetail }) {
  const { location } = useCustomerLocation();
  const isFresh = item.product.type === 'fresh';
  const unit = unitLabel(item.unit, item.packSizeGrams);
  const fresh = freshnessLabel(item);

  return (
    <div className="section py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-soil-muted">
        <Link href="/products" className="hover:text-leaf">Shop</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href={`/products?category=${item.product.category}`} className="hover:text-leaf">
          {categoryLabel(item.product.category)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-soil">{item.product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <Gallery images={[...item.images, item.product.image]} alt={item.product.name} />

        <div>
          {item.farmer.organicVerified && (
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-leaf">
              <Leaf className="h-3.5 w-3.5" aria-hidden /> From an organic-verified farm
            </p>
          )}
          <h1 className="text-4xl font-semibold">{item.product.name}</h1>
          {item.product.localName && <p className="mt-1 text-lg text-soil-muted">{item.product.localName}</p>}

          <p className="mt-5">
            <span className="font-display text-4xl font-semibold">{formatINR(item.price)}</span>
            <span className="text-soil-muted"> / {unit}</span>
          </p>
          {fresh && <p className="mt-2 text-sm font-medium text-leaf-dark">{fresh}</p>}

          <div className="mt-5 border-y border-line py-4">
            <DeliveryNote item={item} hasLocation={!!location} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <AddToCart listing={item} size="lg" className="sm:w-auto sm:min-w-[220px]" />
            <Link href="/cart" className="text-sm font-semibold text-leaf hover:underline">
              View cart
            </Link>
          </div>

          {/* Farmer */}
          <Link
            href={`/farmers/${item.farmer.id}`}
            className="mt-6 flex items-center justify-between gap-4 border border-line bg-white p-4 hover:border-leaf"
          >
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-soil-muted">Grown by</p>
              <p className="truncate font-semibold">{item.farmer.name}</p>
              <p className="truncate text-sm text-soil-muted">
                {item.farm.name}
                {item.farm.village ? ` · ${item.farm.village}` : ''}
              </p>
              <div className="mt-2">
                <FarmerBadges organic={item.farmer.organicVerified} profile={item.farmer.profileVerified} />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Rating avg={item.farmer.ratingAvg} count={item.farmer.ratingCount} />
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-leaf">
                View farm <ChevronRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </Link>

          {/* Facts */}
          <div className="mt-6">
            {isFresh ? (
              <Fact icon={CalendarDays} label="Harvested on" value={formatDate(item.harvestDate)} />
            ) : (
              <>
                <Fact icon={CalendarDays} label="Dried / packed on" value={formatDate(item.processedDate)} />
                <Fact icon={Clock} label="Best before" value={formatDate(item.expiryDate)} />
                {item.packaging && <Fact icon={Package} label="Packaging" value={item.packaging} />}
              </>
            )}
            <Fact icon={Scale} label="Smallest order" value={`${item.minOrderQty} ${UNIT_LABELS[item.unit]}`} />
            <Fact
              icon={Package}
              label="Available"
              value={item.quantityAvailable <= item.minOrderQty * 5 ? `Only ${item.quantityAvailable} ${UNIT_LABELS[item.unit]} left` : 'In stock'}
            />
          </div>

          {(item.description || item.productDescription) && (
            <div className="mt-6 space-y-2 text-sm leading-relaxed text-soil">
              {item.description && <p>{item.description}</p>}
              {item.productDescription && <p className="text-soil-muted">{item.productDescription}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Where it grows */}
      <section className="mt-16">
        <SectionHeading eyebrow="Where it grows" title={item.farm.name}>
          <p className="flex items-center gap-1.5 text-sm text-soil-muted">
            <MapPin className="h-4 w-4 text-leaf" aria-hidden />
            {[item.farmDetails.village, item.farmDetails.district, item.farmDetails.state].filter(Boolean).join(', ')}
          </p>
        </SectionHeading>
        <div className="h-80 border border-line">
          <FarmMap
            farm={{ ...item.farmDetails.location, name: item.farm.name }}
            deliveryRadiusKm={item.farmDetails.deliveryRadiusKm}
            customer={location}
          />
        </div>
      </section>

      <AlsoSoldBy item={item} />
      <MoreFromFarm item={item} />
    </div>
  );
}

/** Other farmers near the customer selling the same catalogue product. */
function AlsoSoldBy({ item }: { item: ListingDetail }) {
  const { location } = useCustomerLocation();
  const { data } = useFetch(['market', 'also-sold-by', item.id, location?.lat, location?.lng], async () =>
    location
      ? (await marketplaceService.listings({ lng: location.lng, lat: location.lat, product: item.product.id, limit: 8 })).items.filter(
          (l) => l.id !== item.id,
        )
      : [],
  );
  if (!data?.length) return null;
  return (
    <section className="mt-16">
      <SectionHeading eyebrow="Compare" title={`${item.product.name} from other farms`} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data.slice(0, 4).map((l) => (
          <ListingCard key={l.id} data={l} href={`/products/${l.id}`} />
        ))}
      </div>
    </section>
  );
}

function MoreFromFarm({ item }: { item: ListingDetail }) {
  const { location } = useCustomerLocation();
  const { data } = useFetch(['market', 'more-from-farm', item.id, location?.lat, location?.lng], async () => {
    const profile = await marketplaceService.farmerProfile(item.farmer.id, location ?? undefined);
    return profile.listings.filter((l) => l.farm.id === item.farm.id && l.id !== item.id);
  });
  if (!data?.length) return null;
  return (
    <section className="mt-16">
      <SectionHeading eyebrow="Same farm" title={`More from ${item.farm.name}`} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data.slice(0, 4).map((l) => (
          <ListingCard key={l.id} data={l} href={`/products/${l.id}`} />
        ))}
      </div>
    </section>
  );
}
