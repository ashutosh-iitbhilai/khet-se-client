'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, ShoppingBasket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCustomerLocation } from '@/features/location/LocationProvider';
import { LocationPrompt } from '@/features/marketplace/LocationGate';
import { formatINR } from '@/lib/utils';
import { unitLabel } from '@/lib/labels';
import type { QuoteIssue } from '@/types';
import { stepFor, useCart, type CartItem } from './CartProvider';
import { QuantityStepper } from './QuantityStepper';
import { OrderSummary } from './OrderSummary';
import { useQuote } from './useQuote';

function IssueNote({ issue, item }: { issue: QuoteIssue; item: CartItem }) {
  const { setQuantity, remove } = useCart();
  const canShrink = issue.code === 'INSUFFICIENT_STOCK' && issue.maxQuantity && issue.maxQuantity >= item.snapshot.minOrderQty;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-l-4 border-turmeric bg-amber-50 px-3 py-2 text-xs">
      <AlertTriangle className="h-3.5 w-3.5 text-turmeric" aria-hidden />
      <span>{issue.message}</span>
      {canShrink ? (
        <button type="button" className="font-semibold text-leaf underline" onClick={() => setQuantity(item.listing, issue.maxQuantity!)}>
          Use {issue.maxQuantity}
        </button>
      ) : (
        <button type="button" className="font-semibold text-danger underline" onClick={() => remove(item.listing)}>
          Remove
        </button>
      )}
    </div>
  );
}

export function CartView() {
  const { items, ready, setQuantity } = useCart();
  const { user } = useAuth();
  const { location, ready: locReady } = useCustomerLocation();
  const router = useRouter();
  const { data: quote, error, loading, reload } = useQuote(location);

  if (!ready || !locReady) return <Skeleton className="h-80" />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBasket}
        title="Your basket is empty"
        description="Fresh vegetables from farms near you are a few taps away."
        action={
          <Button asChild>
            <Link href="/products">Start shopping</Link>
          </Button>
        }
      />
    );
  }

  // Group by farm, keeping the order items were added.
  const byFarm = new Map<string, CartItem[]>();
  for (const i of items) byFarm.set(i.snapshot.farmId, [...(byFarm.get(i.snapshot.farmId) ?? []), i]);
  const issueFor = (listing: string) => quote?.issues.find((x) => x.listing === listing);
  const hasIssues = Boolean(quote?.issues.length);

  const goCheckout = () => router.push(user ? '/checkout' : '/login?next=/checkout');

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {!location && <LocationPrompt message="Set your delivery location so we can check which farms deliver to you and work out delivery fees." />}

        {[...byFarm.entries()].map(([farmId, farmItems]) => (
          <section key={farmId} className="border border-line bg-white">
            <header className="flex items-center justify-between border-b border-line bg-cream px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{farmItems[0].snapshot.farmName}</p>
                <p className="text-xs text-soil-muted">by {farmItems[0].snapshot.farmerName} · delivered separately by the farmer</p>
              </div>
            </header>
            <ul className="divide-y divide-line">
              {farmItems.map((item) => {
                const s = item.snapshot;
                const issue = issueFor(item.listing);
                const quoted = quote?.groups.flatMap((g) => g.items).find((q) => q.listing === item.listing);
                const price = quoted?.price ?? s.price;
                return (
                  <li key={item.listing} className="flex gap-4 p-4">
                    <Link href={`/products/${item.listing}`} className="relative h-20 w-20 shrink-0 overflow-hidden bg-sand">
                      <SafeImage src={s.image} alt={s.productName} fill sizes="80px" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <Link href={`/products/${item.listing}`} className="font-semibold hover:text-leaf">
                            {s.productName}
                          </Link>
                          <p className="text-sm text-soil-muted">
                            {formatINR(price)} / {unitLabel(s.unit, s.packSizeGrams)}
                            {quoted && quoted.price !== s.price && <span className="ml-1 font-medium text-turmeric">(price updated)</span>}
                          </p>
                        </div>
                        <p className="font-semibold">{formatINR(price * item.quantity)}</p>
                      </div>
                      <div className="mt-3">
                        <QuantityStepper
                          value={item.quantity}
                          unit={s.unit}
                          step={stepFor(s.unit)}
                          min={Math.max(s.minOrderQty, stepFor(s.unit))}
                          max={issue?.maxQuantity ?? s.maxQuantity}
                          onChange={(v) => setQuantity(item.listing, v)}
                          label={s.productName}
                        />
                      </div>
                      {issue && <IssueNote issue={issue} item={item} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <div>
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : (
          <OrderSummary quote={quote} loading={loading}>
            {hasIssues && <p className="mb-3 text-sm text-turmeric">Fix the highlighted items to continue.</p>}
            <Button size="lg" className="w-full" disabled={!location || !quote || hasIssues || loading} onClick={goCheckout}>
              {user ? 'Checkout' : 'Log in to checkout'} <ArrowRight />
            </Button>
            {user && user.role !== 'customer' && (
              <p className="mt-3 text-xs text-soil-muted">You’re signed in as a {user.role}. Use a customer account to place orders.</p>
            )}
          </OrderSummary>
        )}
      </div>
    </div>
  );
}
