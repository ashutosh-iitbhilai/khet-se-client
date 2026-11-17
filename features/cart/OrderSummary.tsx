import type { ReactNode } from 'react';
import { Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/states';
import { formatINR } from '@/lib/utils';
import { formatKm } from '@/lib/labels';
import type { Quote } from '@/types';

/** Totals box shared by cart and checkout. */
export function OrderSummary({ quote, loading, children }: { quote: Quote | null | undefined; loading?: boolean; children?: ReactNode }) {
  return (
    <aside className="border border-line bg-white p-5 lg:sticky lg:top-24">
      <h2 className="font-sans text-base font-semibold">Order summary</h2>
      {!quote ? (
        loading ? (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-8" />
          </div>
        ) : null
      ) : (
        <div className={loading ? 'opacity-60' : ''}>
          <ul className="mt-4 space-y-3 border-b border-line pb-4 text-sm">
            {quote.groups.map((g) => (
              <li key={g.farm}>
                <div className="flex justify-between gap-3">
                  <span className="truncate font-medium">{g.farmName}</span>
                  <span>{formatINR(g.subtotal)}</span>
                </div>
                <div className="mt-0.5 flex justify-between gap-3 text-xs text-soil-muted">
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" aria-hidden /> Delivery · {formatKm(g.distanceKm)}
                  </span>
                  <span className={g.deliveryFee === 0 ? 'font-medium text-leaf' : ''}>{g.deliveryFee === 0 ? 'Free' : formatINR(g.deliveryFee)}</span>
                </div>
                {g.deliveryFee > 0 && g.subtotal < quote.freeDeliveryAbove && (
                  <p className="mt-1 text-[11px] text-soil-muted">
                    Add {formatINR(quote.freeDeliveryAbove - g.subtotal)} more from this farm for free delivery
                  </p>
                )}
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-soil-muted">Items</dt>
              <dd>{formatINR(quote.itemsTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-soil-muted">Delivery</dt>
              <dd>{quote.deliveryTotal === 0 ? 'Free' : formatINR(quote.deliveryTotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
              <dt>Total</dt>
              <dd>{formatINR(quote.grandTotal)}</dd>
            </div>
          </dl>
        </div>
      )}
      {children && <div className="mt-5">{children}</div>}
    </aside>
  );
}
