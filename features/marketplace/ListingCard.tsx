import Link from 'next/link';
import { Leaf, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { formatINR } from '@/lib/utils';
import { formatKm, freshnessLabel, unitLabel } from '@/lib/labels';
import type { CardListing } from '@/types';
import { AddToCart } from '@/features/cart/AddToCart';

/**
 * Product card for a farmer's listing: image, name, price/unit, farmer, distance, availability.
 * `action` overrides the default add-to-cart control (pass `null` to hide it).
 */
export function ListingCard({ data, href, action }: { data: CardListing; href?: string; action?: ReactNode | null }) {
  const image = data.images[0] ?? data.product.image;
  const fresh = freshnessLabel(data);
  const low = data.quantityAvailable <= data.minOrderQty * 5;

  const media = (
    <div className="relative aspect-[4/3] overflow-hidden bg-sand">
      <SafeImage
        src={image}
        alt={data.product.name}
        fill
        sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
        className="transition-transform duration-500 group-hover:scale-[1.03]"
      />
      {data.farmer.organicVerified && (
        <span className="absolute left-0 top-0 inline-flex items-center gap-1 bg-leaf px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          <Leaf className="h-3 w-3" aria-hidden /> Organic
        </span>
      )}
    </div>
  );

  return (
    <article className="group flex h-full flex-col border border-line bg-white transition-shadow hover:shadow-soft">
      {href ? <Link href={href}>{media}</Link> : media}
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="font-sans text-sm font-semibold leading-snug">
          {href ? (
            <Link href={href} className="hover:text-leaf">
              {data.product.name}
            </Link>
          ) : (
            data.product.name
          )}
          {data.product.localName && <span className="font-normal text-soil-muted"> · {data.product.localName}</span>}
        </h3>
        <p className="mt-1">
          <span className="text-base font-semibold">{formatINR(data.price)}</span>
          <span className="text-xs text-soil-muted"> / {unitLabel(data.unit, data.packSizeGrams)}</span>
        </p>
        <p className="mt-2 truncate text-xs text-soil-muted">
          {data.farmer.name}
          {data.distanceKm != null && (
            <>
              {' · '}
              <MapPin className="-mt-0.5 inline h-3 w-3 text-leaf" aria-hidden /> {formatKm(data.distanceKm)}
            </>
          )}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2 text-xs">
          {fresh && <span className="text-leaf-dark">{fresh}</span>}
          <span className={low ? 'font-medium text-turmeric' : 'text-soil-muted'}>{low ? 'Few left' : 'In stock'}</span>
        </div>
        {action !== null && <div className="mt-auto pt-3">{action ?? <AddToCart listing={data} />}</div>}
      </div>
    </article>
  );
}
