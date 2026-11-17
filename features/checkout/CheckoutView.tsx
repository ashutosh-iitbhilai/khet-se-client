'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Banknote, CreditCard, Plus, ShoppingBasket } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useCart } from '@/features/cart/CartProvider';
import { OrderSummary } from '@/features/cart/OrderSummary';
import { useQuote } from '@/features/cart/useQuote';
import { AddressForm, AddressText } from '@/features/account/AddressForm';
import { useFetch } from '@/hooks/useFetch';
import { ApiError } from '@/lib/api';
import { newKey } from '@/lib/orderLabels';
import { openRazorpay } from '@/lib/razorpay';
import { cn } from '@/lib/utils';
import { addressService, orderService, paymentService } from '@/services/order.service';
import type { Address, PaymentMethod } from '@/types';

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-3 font-sans text-base font-semibold">
        <span className="flex h-7 w-7 items-center justify-center bg-leaf text-sm text-white">{n}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function RadioCard({ checked, onSelect, disabled, children }: { checked: boolean; onSelect: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'border-leaf bg-sprout' : 'border-line hover:border-leaf/60',
      )}
    >
      <span className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border', checked ? 'border-leaf' : 'border-soil-muted')}>
        {checked && <span className="h-2 w-2 bg-leaf" />}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const cart = useCart();
  const addresses = useFetch(() => addressService.list());
  const methods = useFetch(() => paymentService.methods());

  const [addressId, setAddressId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('cod');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = addresses.data?.addresses ?? [];
  useEffect(() => {
    if (!addressId && list.length) setAddressId((list.find((a) => a.isDefault) ?? list[0]).id);
    if (addresses.data && list.length === 0) setAdding(true);
  }, [addresses.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const address = list.find((a) => a.id === addressId) ?? null;
  const at = address ? { lng: address.location.coordinates[0], lat: address.location.coordinates[1] } : null;
  const quote = useQuote(at);

  // One idempotency key per distinct submission: same cart + address + method ⇒ same key,
  // so a double tap or a retry after a timeout can never create two orders.
  const submissionKey = JSON.stringify({ i: cart.items.map((i) => [i.listing, i.quantity]), addressId, method });
  const keyRef = useRef<{ for: string; key: string } | null>(null);
  const idempotencyKey = useMemo(() => {
    if (keyRef.current?.for !== submissionKey) keyRef.current = { for: submissionKey, key: newKey() };
    return keyRef.current.key;
  }, [submissionKey]);

  if (!cart.ready) return <Skeleton className="h-96" />;
  if (cart.items.length === 0 && !placing) {
    return (
      <EmptyState
        icon={ShoppingBasket}
        title="Your basket is empty"
        action={
          <Button asChild>
            <Link href="/products">Start shopping</Link>
          </Button>
        }
      />
    );
  }

  const q = quote.data;
  const blocked = !address || !q || q.issues.length > 0 || quote.loading || placing;

  const placeOrder = async () => {
    if (!address || !q) return;
    setError(null);
    setPlacing(true);
    try {
      const res = await orderService.place(
        { items: cart.items.map((i) => ({ listing: i.listing, quantity: i.quantity })), addressId: address.id, paymentMethod: method, expectedTotal: q.grandTotal },
        idempotencyKey,
      );
      const orderId = res.order.id;
      cart.clear();

      if (res.payment) {
        try {
          const result = await openRazorpay(res.payment);
          if (result) {
            await paymentService.verify({
              orderId,
              razorpayOrderId: result.razorpay_order_id,
              razorpayPaymentId: result.razorpay_payment_id,
              signature: result.razorpay_signature,
            });
            router.push(`/account/orders/${orderId}?placed=1`);
          } else {
            router.push(`/account/orders/${orderId}?pay=1`);
          }
        } catch {
          router.push(`/account/orders/${orderId}?pay=1`);
        }
        return;
      }
      router.push(`/account/orders/${orderId}?placed=1`);
    } catch (err) {
      setPlacing(false);
      if (err instanceof ApiError && (err.code === 'PRICE_CHANGED' || err.code === 'CART_CHANGED')) {
        setError(err.message);
        void quote.reload();
      } else if (err instanceof ApiError && err.code === 'OUT_OF_STOCK') {
        setError(err.message);
        void quote.reload();
      } else {
        setError((err as Error).message);
      }
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <Step n={1} title="Delivery address">
          {addresses.error && <ErrorState error={addresses.error} onRetry={addresses.reload} />}
          {addresses.loading && !addresses.data && <Skeleton className="h-24" />}
          {list.length > 0 && !adding && (
            <div className="space-y-2" role="radiogroup" aria-label="Delivery address">
              {list.map((a: Address) => (
                <RadioCard key={a.id} checked={a.id === addressId} onSelect={() => setAddressId(a.id)}>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-soil-muted">{a.label}</span>
                  <AddressText a={a} />
                </RadioCard>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>
                <Plus /> Add a new address
              </Button>
            </div>
          )}
          {adding && (
            <AddressForm
              onSaved={(a) => {
                setAdding(false);
                addresses.setData((d) => ({ addresses: [a, ...(d?.addresses ?? [])] }));
                setAddressId(a.id);
              }}
              onCancel={list.length ? () => setAdding(false) : undefined}
            />
          )}
        </Step>

        <Step n={2} title="Payment">
          <div className="space-y-2" role="radiogroup" aria-label="Payment method">
            <RadioCard checked={method === 'cod'} onSelect={() => setMethod('cod')}>
              <span className="flex items-center gap-2 font-semibold">
                <Banknote className="h-4 w-4 text-leaf" aria-hidden /> Cash or UPI on delivery
              </span>
              <span className="mt-1 block text-sm text-soil-muted">Pay each farmer when they hand over your produce.</span>
            </RadioCard>
            <RadioCard checked={method === 'online'} onSelect={() => setMethod('online')} disabled={!methods.data?.online}>
              <span className="flex items-center gap-2 font-semibold">
                <CreditCard className="h-4 w-4 text-leaf" aria-hidden /> Pay online now
              </span>
              <span className="mt-1 block text-sm text-soil-muted">
                {methods.data?.online ? 'UPI, cards and net banking via Razorpay.' : 'Online payment isn’t available yet.'}
              </span>
            </RadioCard>
          </div>
        </Step>

        <Step n={3} title="Review">
          {quote.error && <ErrorState error={quote.error} onRetry={quote.reload} />}
          {q && q.issues.length > 0 && (
            <Alert>
              Some items can’t be delivered to this address as they are.{' '}
              <Link href="/cart" className="font-semibold underline">
                Review your basket
              </Link>
              <ul className="mt-2 list-disc pl-5">
                {q.issues.map((i) => (
                  <li key={i.listing}>{i.message}</li>
                ))}
              </ul>
            </Alert>
          )}
          {q && (
            <ul className="divide-y divide-line border border-line">
              {q.groups.map((g) => (
                <li key={g.farm} className="p-4">
                  <p className="text-sm font-semibold">{g.farmName}</p>
                  <ul className="mt-2 space-y-1 text-sm text-soil-muted">
                    {g.items.map((i) => (
                      <li key={i.listing} className="flex justify-between gap-3">
                        <span>
                          {i.productName} × {i.quantity} {i.unit}
                        </span>
                        <span className="text-soil">₹{i.lineTotal}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          {!address && !adding && <p className="text-sm text-soil-muted">Choose an address to see the final total.</p>}
        </Step>
      </div>

      <div>
        <OrderSummary quote={q} loading={quote.loading}>
          {error && (
            <div className="mb-3">
              <Alert>{error}</Alert>
            </div>
          )}
          <Button size="lg" className="w-full" disabled={blocked} loading={placing} onClick={placeOrder}>
            {method === 'online' ? 'Place order & pay' : 'Place order'}
          </Button>
          <p className="mt-3 text-xs leading-relaxed text-soil-muted">
            Each farmer confirms their part of your order. You’ll get a 4-digit code to share with the farmer at delivery.
          </p>
        </OrderSummary>
      </div>
    </div>
  );
}
