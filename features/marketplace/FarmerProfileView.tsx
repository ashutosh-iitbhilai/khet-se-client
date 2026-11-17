'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { CalendarDays, CircleAlert, Languages, MapPin, Ruler, Sprout, Star, Store, Truck } from 'lucide-react';
import { Gallery } from '@/components/ui/gallery';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { useCustomerLocation } from '@/features/location/LocationProvider';
import { formatKm, PRACTICE_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { FarmerProfile } from '@/types';
import { FarmerBadges } from './FarmerBadges';
import { ListingCard } from './ListingCard';
import { Rating } from './RatingStars';
import { ChipGroup } from './Filters';
import { SectionHeading } from './NearbySections';

const FarmMap = dynamic(() => import('@/components/map/FarmMap'), { ssr: false, loading: () => <Skeleton className="h-full w-full" /> });

export function FarmerProfileView({ data }: { data: FarmerProfile }) {
  const { farmer, farms, listings } = data;
  const { location } = useCustomerLocation();
  const [farmIdx, setFarmIdx] = useState(0);
  const [type, setType] = useState<'all' | 'fresh' | 'dry'>('all');
  const farm = farms[farmIdx];

  const shown = listings.filter((l) => type === 'all' || l.product.type === type);
  const hasBoth = listings.some((l) => l.product.type === 'fresh') && listings.some((l) => l.product.type === 'dry');
  const memberSince = new Date(farmer.memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  if (!farm) {
    return (
      <div className="section py-16">
        <EmptyState icon={Sprout} title={`${farmer.name} isn’t taking orders right now`} description="Their farm is paused. Check back soon." />
      </div>
    );
  }

  return (
    <div className="section py-8 md:py-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <Gallery images={farm.images.length ? farm.images : listings.slice(0, 3).map((l) => l.product.image)} alt={farm.name} aspect="aspect-[16/10]" />

        <div>
          <p className="eyebrow">{farmer.name}’s farm</p>
          <h1 className="mt-2 text-4xl font-semibold">{farm.name}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-soil-muted">
            <MapPin className="h-4 w-4 text-leaf" aria-hidden />
            {[farm.village, farm.district, farm.state].filter(Boolean).join(', ')}
            {farm.distanceKm != null && <span className="font-medium text-soil"> · {formatKm(farm.distanceKm)} from you</span>}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <FarmerBadges organic={farmer.organicVerified} profile={farmer.profileVerified} issuer={farmer.organicIssuer} />
          </div>

          {farmer.bio && <p className="mt-5 leading-relaxed">{farmer.bio}</p>}
          {farm.description && <p className="mt-3 text-sm leading-relaxed text-soil-muted">{farm.description}</p>}

          {farm.deliversToYou === false && (
            <p className="mt-5 flex items-start gap-2 border-l-4 border-turmeric bg-amber-50 px-4 py-2.5 text-sm">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-turmeric" aria-hidden />
              This farm delivers within {farm.deliveryRadiusKm} km, so it doesn’t reach your location.
              {farm.pickupAvailable ? ' You can still pick up from the farm.' : ''}
            </p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-px border border-line bg-line text-sm">
            <Stat icon={Star} label="Rating">
              <Rating avg={farmer.ratingAvg} count={farmer.ratingCount} />
            </Stat>
            <Stat icon={CalendarDays} label="Farming for">
              {farmer.experienceYears != null ? `${farmer.experienceYears} years` : '—'}
            </Stat>
            <Stat icon={Truck} label="Delivers within">
              {farm.deliveryAvailable ? `${farm.deliveryRadiusKm} km` : 'No delivery'}
              {farm.pickupAvailable && <span className="text-soil-muted"> · pickup</span>}
            </Stat>
            <Stat icon={Ruler} label="Farm size">
              {farm.areaAcres ? `${farm.areaAcres} acres` : '—'}
            </Stat>
            {farmer.languages.length > 0 && (
              <Stat icon={Languages} label="Speaks">
                {farmer.languages.join(', ')}
              </Stat>
            )}
            <Stat icon={Store} label="On Khet Se since">
              {memberSince}
            </Stat>
          </dl>

          {farmer.practices.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Farming practices">
              {farmer.practices.map((p) => (
                <li key={p} className="border border-leaf/30 bg-sprout px-2.5 py-1 text-xs font-medium text-leaf-dark">
                  {PRACTICE_LABELS[p]}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {farms.length > 1 && (
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Farms">
          {farms.map((f, i) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={i === farmIdx}
              onClick={() => setFarmIdx(i)}
              className={cn('border px-3.5 py-2 text-sm', i === farmIdx ? 'border-leaf bg-leaf text-white' : 'border-line hover:border-leaf/60')}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      <section className="mt-16">
        <SectionHeading eyebrow="Available now" title={`From ${farmer.name.split(' ')[0]}’s fields`}>
          {hasBoth && (
            <ChipGroup
              label="Product type"
              value={type}
              onChange={setType}
              options={[
                { value: 'all', label: 'All' },
                { value: 'fresh', label: 'Fresh' },
                { value: 'dry', label: 'Dry' },
              ]}
            />
          )}
        </SectionHeading>
        {shown.length === 0 ? (
          <EmptyState icon={Sprout} title="Nothing in stock right now" description="This farmer’s next harvest will appear here." />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((l) => (
              <ListingCard key={l.id} data={l} href={`/products/${l.id}`} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <SectionHeading eyebrow="Location" title="Where the farm is" />
        <div className="h-80 border border-line">
          <FarmMap farm={{ ...farm.location, name: farm.name }} deliveryRadiusKm={farm.deliveryRadiusKm} customer={location} />
        </div>
        <p className="mt-2 text-xs text-soil-muted">The shaded circle is the farm’s delivery area.</p>
      </section>

      <section className="mt-16 border border-line bg-cream p-8">
        <h2 className="font-sans text-lg font-semibold">Ratings & reviews</h2>
        <div className="mt-3 flex items-center gap-4">
          <Rating avg={farmer.ratingAvg} count={farmer.ratingCount} />
        </div>
        <p className="mt-3 text-sm text-soil-muted">
          Written reviews open once ordering launches. Only customers who received an order from this farm will be able to review it.
        </p>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, children }: { icon: typeof Star; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-3.5">
      <dt className="flex items-center gap-1.5 text-xs text-soil-muted">
        <Icon className="h-3.5 w-3.5 text-leaf" aria-hidden /> {label}
      </dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}
