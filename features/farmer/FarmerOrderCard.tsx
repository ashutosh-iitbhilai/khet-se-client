'use client';

import { useState } from 'react';
import { Banknote, Check, CreditCard, MapPin, Navigation, Package, Phone, Truck, X } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SafeImage } from '@/components/ui/safe-image';
import { applyServerErrors } from '@/features/auth/applyServerErrors';
import { GROUP_STATUS, formatDateTime } from '@/lib/orderLabels';
import { formatKm, todayInput, unitLabel } from '@/lib/labels';
import { formatINR } from '@/lib/utils';
import { orderService } from '@/services/order.service';
import type { FarmerOrder, GroupStatus } from '@/types';

type Group = FarmerOrder['groups'][number];

/** One farm-group of a customer order, with the next action the farmer can take. */
export function FarmerOrderCard({ order, group, onChanged }: { order: FarmerOrder; group: Group; onChanged: () => void }) {
  const [busy, setBusy] = useState<GroupStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'idle' | 'reject' | 'cancel' | 'deliver'>('idle');
  const [note, setNote] = useState('');
  const [code, setCode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [lng, lat] = order.address.location.coordinates;
  const st = GROUP_STATUS[group.status];

  const move = async (status: GroupStatus, extra: { note?: string; code?: string; deliveryDate?: string } = {}) => {
    setError(null);
    setBusy(status);
    try {
      await orderService.updateStatus(order.id, { groupId: group.id, status, ...extra });
      setMode('idle');
      onChanged();
    } catch (err) {
      setError(applyServerErrors(err, () => undefined, []) ?? (err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="border border-line bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-cream px-5 py-3">
        <div>
          <p className="font-semibold">
            {order.orderNumber} <span className="font-normal text-soil-muted">· {formatDateTime(order.createdAt)}</span>
          </p>
          <p className="text-xs text-soil-muted">{group.farmName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">
            {order.paymentMethod === 'cod' ? <Banknote className="h-3 w-3" aria-hidden /> : <CreditCard className="h-3 w-3" aria-hidden />}
            {order.paymentMethod === 'online'
              ? 'Paid online'
              : group.paymentCollected
                ? `Collected ${formatINR(group.total)}`
                : ['rejected', 'cancelled'].includes(group.status)
                  ? 'Cash on delivery'
                  : `Collect ${formatINR(group.total)}`}
          </Badge>
          <Badge tone={st.tone}>{st.label}</Badge>
        </div>
      </header>

      <div className="grid gap-5 p-5 md:grid-cols-[1fr_280px]">
        <div>
          <ul className="divide-y divide-line border-y border-line">
            {group.items.map((i) => (
              <li key={i.inventory} className="flex items-center gap-3 py-2.5">
                <span className="relative h-11 w-11 shrink-0 overflow-hidden bg-sand">
                  <SafeImage src={i.image} alt="" fill sizes="44px" />
                </span>
                <p className="flex-1 text-sm">
                  <span className="font-semibold">
                    {i.quantity} {i.unit}
                  </span>{' '}
                  {i.productName}
                  {i.packSizeGrams ? <span className="text-soil-muted"> ({unitLabel(i.unit, i.packSizeGrams)})</span> : null}
                </p>
                <p className="text-sm">{formatINR(i.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-right text-sm">
            Items {formatINR(group.subtotal)} · Delivery {group.deliveryFee ? formatINR(group.deliveryFee) : 'free'} ·{' '}
            <strong>{formatINR(group.total)}</strong>
          </p>
          {group.cancelReason && <p className="mt-2 text-sm text-soil-muted">Reason: {group.cancelReason}</p>}
        </div>

        <div className="space-y-3 text-sm">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf" aria-hidden />
            <span>
              <strong>{order.address.name}</strong>
              <br />
              {order.address.line1}
              {order.address.landmark ? `, near ${order.address.landmark}` : ''}, {order.address.pincode}
              <br />
              <span className="text-soil-muted">{formatKm(group.distanceKm)} from your farm</span>
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:+91${order.address.phone}`} className="inline-flex items-center gap-1.5 border border-line px-3 py-2 hover:border-leaf">
              <Phone className="h-4 w-4 text-leaf" aria-hidden /> Call
            </a>
            <a
              href={`https://www.openstreetmap.org/directions?route=;${lat},${lng}#map=15/${lat}/${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-line px-3 py-2 hover:border-leaf"
            >
              <Navigation className="h-4 w-4 text-leaf" aria-hidden /> Directions
            </a>
          </div>
          {group.status === 'pending' && group.acceptBy && (
            <p className="font-medium text-turmeric">
              Accept or decline by {formatDateTime(group.acceptBy)} — after that it is cancelled automatically.
            </p>
          )}
          {group.scheduledFor && !['pending', 'delivered', 'rejected', 'cancelled'].includes(group.status) && (
            <p className="text-soil-muted">Deliver by {new Date(group.scheduledFor).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      {!['delivered', 'rejected', 'cancelled'].includes(group.status) && (
        <footer className="space-y-3 border-t border-line px-5 py-4">
          {error && <Alert>{error}</Alert>}

          {group.status === 'pending' && mode === 'idle' && (
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-soil-muted">Deliver on</span>
                <Input type="date" value={deliveryDate} min={todayInput()} onChange={(e) => setDeliveryDate(e.target.value)} className="h-11 w-44" />
              </label>
              <Button size="lg" loading={busy === 'accepted'} onClick={() => move('accepted', { deliveryDate })}>
                <Check /> Accept order
              </Button>
              <Button size="lg" variant="outline" onClick={() => setMode('reject')}>
                <X /> Can’t fulfil
              </Button>
            </div>
          )}

          {group.status === 'accepted' && mode === 'idle' && (
            <div className="flex flex-wrap gap-3">
              <Button size="lg" loading={busy === 'packed'} onClick={() => move('packed')}>
                <Package /> Mark packed
              </Button>
              <Button size="lg" variant="outline" loading={busy === 'out_for_delivery'} onClick={() => move('out_for_delivery')}>
                <Truck /> Out for delivery
              </Button>
              <Button size="lg" variant="ghost" onClick={() => setMode('cancel')}>
                Cancel
              </Button>
            </div>
          )}

          {group.status === 'packed' && mode === 'idle' && (
            <div className="flex flex-wrap gap-3">
              <Button size="lg" loading={busy === 'out_for_delivery'} onClick={() => move('out_for_delivery')}>
                <Truck /> Out for delivery
              </Button>
              <Button size="lg" variant="ghost" onClick={() => setMode('cancel')}>
                Cancel
              </Button>
            </div>
          )}

          {group.status === 'out_for_delivery' && group.codeLocked && (
            <Alert>
              Too many wrong codes — this delivery code is locked. Ask the customer to tap “Get a new code” on their order page, then
              enter the new one. Refresh this page after they do.
            </Alert>
          )}

          {group.status === 'out_for_delivery' && !group.codeLocked && (
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void move('delivered', { code });
              }}
            >
              <label className="text-sm">
                <span className="mb-1 block text-soil-muted">Customer’s 4-digit delivery code</span>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="••••"
                  className="h-12 w-36 text-center font-display text-2xl tracking-[0.4em]"
                  aria-label="Delivery code"
                />
              </label>
              <Button type="submit" size="lg" disabled={code.length !== 4} loading={busy === 'delivered'}>
                <Check /> Mark delivered
              </Button>
            </form>
          )}

          {(mode === 'reject' || mode === 'cancel') && (
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-soil-muted">Tell the customer why (optional)</span>
                <Input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="e.g. Harvest damaged by rain" />
              </label>
              <div className="flex gap-3">
                <Button
                  className="bg-danger hover:bg-danger/90"
                  loading={busy === 'rejected' || busy === 'cancelled'}
                  onClick={() => move(mode === 'reject' ? 'rejected' : 'cancelled', { note: note || undefined })}
                >
                  {mode === 'reject' ? 'Decline order' : 'Cancel order'}
                </Button>
                <Button variant="ghost" onClick={() => setMode('idle')}>
                  Back
                </Button>
              </div>
              <p className="text-xs text-soil-muted">The reserved stock goes back to your inventory automatically.</p>
            </div>
          )}
        </footer>
      )}
    </article>
  );
}
