import Link from 'next/link';
import { MapPin, ShieldCheck, Truck } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils';
import { formatKm, unitLabel } from '@/lib/labels';
import { Rating } from './RatingStars';
import type { NearbyFarm } from '@/types';

/** Card for a nearby farm: photo, who grows it, how far, and a peek at what's fresh. */
export function FarmCard({ data, href }: { data: NearbyFarm; href?: string }) {
  const { farm, farmer, topListings } = data;
  const cover = farm.image ?? topListings[0]?.image ?? null;
  const distance = data.roadDistanceKm ?? data.distanceKm;

  const body = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-sand">
        <SafeImage
          src={cover ?? ''}
          alt={`${farm.name}`}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-0 top-0 inline-flex items-center gap-1 bg-white/95 px-2.5 py-1 text-xs font-semibold text-soil">
          <MapPin className="h-3.5 w-3.5 text-leaf" aria-hidden />
          {formatKm(distance)}
          {data.roadDistanceKm != null && <span className="font-normal text-soil-muted">by road</span>}
        </span>
        {farmer.organicVerified && (
          <span className="absolute right-0 top-0">
            <Badge tone="green" className="border-0 bg-leaf text-white">
              <ShieldCheck className="h-3 w-3" aria-hidden /> Organic verified
            </Badge>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-sans text-base font-semibold">{farm.name}</h3>
            <p className="truncate text-sm text-soil-muted">
              {farmer.name}
              {farm.village ? ` · ${farm.village}` : ''}
            </p>
          </div>
          <Rating avg={farmer.ratingAvg} count={farmer.ratingCount} />
        </div>

        {topListings.length > 0 && (
          <ul className="mb-4 mt-4 flex flex-wrap gap-1.5" aria-label="Available now">
            {topListings.map((l) => (
              <li key={l.id} className="border border-line bg-cream px-2 py-1 text-xs">
                {l.productName} <span className="text-soil-muted">{formatINR(l.price)}/{unitLabel(l.unit, l.packSizeGrams)}</span>
              </li>
            ))}
            {data.listingCount > topListings.length && (
              <li className="px-1 py-1 text-xs text-soil-muted">+{data.listingCount - topListings.length} more</li>
            )}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-xs text-soil-muted">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-leaf" aria-hidden />
            Delivers{farm.pickupAvailable ? ' · pickup available' : ''}
          </span>
          <span>
            from <strong className="text-soil">{formatINR(data.priceFrom)}</strong>
          </span>
        </div>
      </div>
    </>
  );

  const cls = 'group flex h-full flex-col border border-line bg-white transition-shadow hover:shadow-soft';
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <article className={cls}>{body}</article>
  );
}
