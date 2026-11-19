'use client';

import { useState } from 'react';
import { ArrowDown, Banknote, Check, Navigation, Package, Phone, Store, Undo2, UserRound } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/orderLabels';
import { formatKm } from '@/lib/labels';
import { formatINR } from '@/lib/utils';
import { deliveryService } from '@/services/delivery.service';
import type { DeliveryJob } from '@/types';
import { JOB_STATUS, directionsTo } from './labels';

type Mode = 'board' | 'active' | 'history';

/**
 * One delivery, from the partner's side. On the job board it shows only areas and pay; once
 * accepted it shows contacts, directions and the next step (pick up → enter customer's code).
 */
export function JobCard({ job, mode, onChanged }: { job: DeliveryJob; mode: Mode; onChanged: (accepted?: DeliveryJob) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const st = JOB_STATUS[job.status];

  const run = async (name: string, fn: () => Promise<unknown>) => {
    setError(null);
    setBusy(name);
    try {
      const res = (await fn()) as { job?: DeliveryJob } | undefined;
      onChanged(res?.job);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="border border-line bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-cream px-5 py-3">
        <div>
          <p className="font-semibold">
            {formatINR(job.payout)} <span className="font-normal text-soil-muted">· {formatKm(job.tripKm)} trip</span>
          </p>
          <p className="text-xs text-soil-muted">
            {job.orderNumber} · {job.itemCount} {job.itemCount === 1 ? 'item' : 'items'}
            {mode === 'board' && job.pickupDistanceKm !== undefined ? ` · pickup ${formatKm(job.pickupDistanceKm)} from your base` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {job.codAmount > 0 && job.status !== 'cancelled' && (
            <Badge tone={job.status === 'delivered' ? 'neutral' : 'amber'}>
              <Banknote className="h-3 w-3" aria-hidden /> {job.status === 'delivered' ? 'Collected' : 'Collect'} {formatINR(job.codAmount)}
            </Badge>
          )}
          {mode !== 'board' && <Badge tone={st.tone}>{st.label}</Badge>}
        </div>
      </header>

      <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
        <Stop
          icon={Store}
          title="Pick up"
          name={job.pickup.farmName}
          lines={[job.pickup.line1, job.pickup.area].filter(Boolean) as string[]}
          person={job.pickup.farmerName}
          phone={job.pickup.farmerPhone}
          to={mode === 'active' && job.status === 'assigned' ? job.pickup.location : undefined}
        />
        <ArrowDown className="mx-auto h-5 w-5 text-soil-muted sm:mt-6 sm:-rotate-90" aria-hidden />
        <Stop
          icon={UserRound}
          title="Deliver to"
          name={job.drop.name ?? job.drop.area}
          lines={[job.drop.line1, job.drop.name ? job.drop.area : undefined].filter(Boolean) as string[]}
          phone={job.drop.phone}
          to={mode === 'active' && job.status === 'out_for_delivery' ? job.drop.location : undefined}
        />
      </div>

      {job.items && mode === 'active' && (
        <p className="flex items-start gap-2 border-t border-line px-5 py-3 text-sm text-soil-muted">
          <Package className="mt-0.5 h-4 w-4 shrink-0 text-leaf" aria-hidden />
          {job.items.map((i) => `${i.quantity} ${i.unit} ${i.name}`).join(' · ')}
        </p>
      )}

      {mode === 'history' && (
        <p className="border-t border-line px-5 py-3 text-xs text-soil-muted">
          {job.status === 'delivered' && job.deliveredAt ? `Delivered ${formatDateTime(job.deliveredAt)}` : 'Cancelled by the farm'}
        </p>
      )}

      {mode !== 'history' && (
        <footer className="space-y-3 border-t border-line px-5 py-4">
          {error && <Alert>{error}</Alert>}

          {mode === 'board' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-soil-muted">
                Ready {formatDateTime(job.scheduledFor)}. You’ll see phone numbers and exact addresses after you accept.
              </p>
              <Button size="lg" loading={busy === 'accept'} onClick={() => run('accept', () => deliveryService.accept(job.id))}>
                <Check /> Accept delivery
              </Button>
            </div>
          )}

          {mode === 'active' && job.status === 'assigned' && (
            <div className="flex flex-wrap gap-3">
              <Button size="lg" loading={busy === 'pickup'} onClick={() => run('pickup', () => deliveryService.pickUp(job.id))}>
                <Package /> I’ve picked it up
              </Button>
              <Button variant="ghost" loading={busy === 'release'} onClick={() => run('release', () => deliveryService.release(job.id))}>
                <Undo2 /> Give back
              </Button>
            </div>
          )}

          {mode === 'active' && job.status === 'out_for_delivery' && (
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void run('deliver', () => deliveryService.deliver(job.id, code));
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
              <Button type="submit" size="lg" disabled={code.length !== 4} loading={busy === 'deliver'}>
                <Check /> {job.codAmount > 0 ? `Cash collected · Delivered` : 'Mark delivered'}
              </Button>
            </form>
          )}
        </footer>
      )}
    </article>
  );
}

function Stop({
  icon: Icon,
  title,
  name,
  lines,
  person,
  phone,
  to,
}: {
  icon: typeof Store;
  title: string;
  name: string;
  lines: string[];
  person?: string;
  phone?: string;
  to?: { lng: number; lat: number };
}) {
  return (
    <div className="text-sm">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-soil-muted">
        <Icon className="h-3.5 w-3.5 text-leaf" aria-hidden /> {title}
      </p>
      <p className="mt-1 font-semibold">{name}</p>
      {lines.map((l) => (
        <p key={l} className="text-soil-muted">
          {l}
        </p>
      ))}
      {person && <p className="text-soil-muted">{person}</p>}
      {(phone || to) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {phone && (
            <a href={`tel:+91${phone}`} className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 hover:border-leaf">
              <Phone className="h-4 w-4 text-leaf" aria-hidden /> Call
            </a>
          )}
          {to && (
            <a
              href={directionsTo(to)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 hover:border-leaf"
            >
              <Navigation className="h-4 w-4 text-leaf" aria-hidden /> Directions
            </a>
          )}
        </div>
      )}
    </div>
  );
}
