'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { ArrowLeft, CalendarDays, Clock, KeyRound, PackageX, Phone } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { AddressText } from '@/features/account/AddressForm';
import { OrderTracker } from '@/features/account/OrderTracker';
import { useFetch } from '@/hooks/useFetch';
import { ApiError } from '@/lib/api';
import { GROUP_STATUS, ORDER_STATUS, PAYMENT_STATUS, formatDateTime } from '@/lib/orderLabels';
import { openRazorpay } from '@/lib/razorpay';
import { formatINR } from '@/lib/utils';
import { formatKm, unitLabel } from '@/lib/labels';
import { orderService, paymentService } from '@/services/order.service';
import { groupId, type Order, type OrderGroup } from '@/types';

export default function OrderPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <OrderDetail />
    </Suspense>
  );
}

function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const { data, error, loading, reload, setData } = useFetch(() => orderService.get(id), [id]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
    return <EmptyState icon={PackageX} title="Order not found" action={<Button asChild><Link href="/account">My orders</Link></Button>} />;
  }
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) return <Skeleton className="h-96" />;
  const order = data!.order;
  const st = ORDER_STATUS[order.status];
  const setOrder = (o: Order) => setData({ order: o });

  const pay = async () => {
    setActionError(null);
    setPaying(true);
    try {
      const { payment } = await paymentService.retry(order.id);
      const result = await openRazorpay(payment);
      if (result) {
        const res = await paymentService.verify({
          orderId: order.id,
          razorpayOrderId: result.razorpay_order_id,
          razorpayPaymentId: result.razorpay_payment_id,
          signature: result.razorpay_signature,
        });
        if (res.order) setOrder(res.order);
      }
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div>
      <Link href="/account" className="mb-4 inline-flex items-center gap-1.5 text-sm text-soil-muted hover:text-leaf">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      {params.get('placed') && order.status !== 'cancelled' && (
        <div className="mb-6">
          <Alert tone="success">
            Order placed! Each farmer will confirm their part shortly. Keep the delivery code(s) below handy.
          </Alert>
        </div>
      )}
      {order.paymentStatus === 'pending' && (
        <div className="mb-6 flex flex-col gap-3 border border-turmeric bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            <strong>Payment not completed.</strong> Your items are held until{' '}
            {order.reservationExpiresAt ? formatDateTime(order.reservationExpiresAt) : 'shortly'}; after that the order is cancelled.
          </p>
          <Button onClick={pay} loading={paying}>
            Complete payment
          </Button>
        </div>
      )}
      {actionError && (
        <div className="mb-6">
          <Alert>{actionError}</Alert>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Order {order.orderNumber}</h2>
          <p className="text-sm text-soil-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <Badge tone={st.tone} className="text-xs">
          {st.label}
        </Badge>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {order.groups.map((g) => (
            <GroupCard key={groupId(g)} order={order} group={g} onChange={setOrder} onError={setActionError} />
          ))}
        </div>

        <aside className="space-y-5">
          <section className="border border-line bg-white p-5">
            <h3 className="font-sans text-sm font-semibold">Delivering to</h3>
            <div className="mt-2">
              <AddressText a={order.address} />
            </div>
          </section>
          <section className="border border-line bg-white p-5 text-sm">
            <h3 className="font-sans font-semibold">Payment</h3>
            <p className="mt-1 text-soil-muted">
              {order.paymentMethod === 'cod' ? 'Cash / UPI on delivery' : 'Online'} · {PAYMENT_STATUS[order.paymentStatus]}
            </p>
            {order.refundDue > 0 && (
              <p className="mt-2 border-l-4 border-turmeric bg-amber-50 px-3 py-2">
                {formatINR(order.refundDue)} will be refunded for the part that couldn’t be delivered.
              </p>
            )}
            <dl className="mt-4 space-y-1.5">
              <div className="flex justify-between">
                <dt className="text-soil-muted">Items</dt>
                <dd>{formatINR(order.itemsTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-soil-muted">Delivery</dt>
                <dd>{order.deliveryTotal ? formatINR(order.deliveryTotal) : 'Free'}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatINR(order.grandTotal)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

function GroupCard({ order, group, onChange, onError }: { order: Order; group: OrderGroup; onChange: (o: Order) => void; onError: (m: string | null) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const st = GROUP_STATUS[group.status];
  const showCode = ['pending', 'accepted', 'packed', 'out_for_delivery'].includes(group.status) && order.paymentStatus !== 'pending';

  const [renewing, setRenewing] = useState(false);

  const cancel = async () => {
    onError(null);
    setBusy(true);
    try {
      onChange((await orderService.cancel(order.id, groupId(group))).order);
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  const renewCode = async () => {
    onError(null);
    setRenewing(true);
    try {
      onChange((await orderService.newCode(order.id, groupId(group))).order);
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setRenewing(false);
    }
  };

  return (
    <section className="border border-line bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-cream px-5 py-3">
        <div>
          <p className="font-semibold">{group.farmName}</p>
          <p className="text-xs text-soil-muted">
            {group.farmerName} · {formatKm(group.distanceKm)} away
          </p>
        </div>
        <Badge tone={st.tone}>{st.label}</Badge>
      </header>

      <div className="space-y-5 p-5">
        <OrderTracker group={group} />

        {group.status === 'pending' && group.acceptBy && (
          <p className="flex items-center gap-2 text-sm text-soil-muted">
            <Clock className="h-4 w-4 text-turmeric" aria-hidden />
            Waiting for {group.farmerName} to confirm — by {formatDateTime(group.acceptBy)}. If they don’t, this part is cancelled
            automatically{order.paymentMethod === 'online' ? ' and refunded' : ''}.
          </p>
        )}

        {group.codeLocked && showCode && (
          <div className="flex flex-col gap-3 border-l-4 border-danger bg-red-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              <strong>Your delivery code was locked</strong> after too many wrong attempts. If you are with the farmer now, get a new
              code and share it with them.
            </p>
            <Button size="sm" onClick={renewCode} loading={renewing}>
              Get a new code
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {showCode && group.handoverCode && (
            <div className="flex items-center gap-3 border border-leaf bg-sprout px-4 py-2.5">
              <KeyRound className="h-5 w-5 text-leaf" aria-hidden />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-leaf-dark">Delivery code</p>
                <p className="font-display text-2xl font-semibold tracking-[0.3em] text-leaf-dark">{group.handoverCode}</p>
              </div>
            </div>
          )}
          {group.scheduledFor && ['accepted', 'packed', 'out_for_delivery'].includes(group.status) && (
            <div className="flex items-center gap-2 border border-line px-4 py-2.5 text-sm">
              <CalendarDays className="h-4 w-4 text-leaf" aria-hidden />
              Expected {new Date(group.scheduledFor).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          )}
          {group.farmerPhone && ['accepted', 'packed', 'out_for_delivery'].includes(group.status) && (
            <a href={`tel:+91${group.farmerPhone}`} className="flex items-center gap-2 border border-line px-4 py-2.5 text-sm hover:border-leaf">
              <Phone className="h-4 w-4 text-leaf" aria-hidden /> Call farmer
            </a>
          )}
        </div>
        {showCode && <p className="-mt-2 text-xs text-soil-muted">Share this code with the farmer only when you receive your produce.</p>}

        <ul className="divide-y divide-line border-y border-line">
          {group.items.map((i) => (
            <li key={i.inventory} className="flex items-center gap-3 py-3">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden bg-sand">
                <SafeImage src={i.image} alt="" fill sizes="48px" />
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">{i.productName}</p>
                <p className="text-soil-muted">
                  {i.quantity} × {formatINR(i.price)} / {unitLabel(i.unit, i.packSizeGrams)}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatINR(i.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-soil-muted">
            Items {formatINR(group.subtotal)} · Delivery {group.deliveryFee ? formatINR(group.deliveryFee) : 'free'} ·{' '}
            <strong className="text-soil">Total {formatINR(group.total)}</strong>
          </span>
          {group.status === 'pending' &&
            (confirming ? (
              <span className="flex items-center gap-2">
                Cancel this part?
                <Button size="sm" className="bg-danger hover:bg-danger/90" loading={busy} onClick={cancel}>
                  Yes, cancel
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                  Keep
                </Button>
              </span>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
                Cancel
              </Button>
            ))}
        </div>
      </div>
    </section>
  );
}
