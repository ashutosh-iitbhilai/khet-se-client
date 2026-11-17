'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, Boxes, Check, CircleSlash, Inbox, Package, PlusSquare, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/features/farmer/FarmerShell';
import { useAuth } from '@/features/auth/AuthProvider';
import { useFetch } from '@/hooks/useFetch';
import { farmerService } from '@/services/farmer.service';
import { STATUS_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { VerificationStatus } from '@/types';

const statusTone = (s: VerificationStatus) =>
  s === 'verified' ? 'green' : s === 'rejected' ? 'red' : s === 'pending' ? 'amber' : 'neutral';

export default function FarmerOverviewPage() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useFetch(() => farmerService.overview());

  const steps = data
    ? [
        { done: data.profileComplete, label: 'Tell customers about yourself', href: '/farmer/farm#about' },
        { done: data.farmCount > 0, label: 'Pin your farm on the map', href: '/farmer/farm#farm' },
        { done: data.listings.total > 0, label: 'List your first product', href: '/farmer/products/new' },
      ]
    : [];
  const allDone = steps.length > 0 && steps.every((s) => s.done);

  return (
    <>
      <PageHeader
        title={`Namaste, ${user?.name.split(' ')[0] ?? 'farmer'}`}
        description="Here’s how your farm is doing on Khet Se."
        action={
          <Button asChild>
            <Link href="/farmer/products/new">
              <PlusSquare /> Add product
            </Link>
          </Button>
        }
      />

      {error && <ErrorState error={error} onRetry={reload} />}

      {loading && !data && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {data && (
        <div className="space-y-8">
          {!allDone && (
            <section className="border border-line bg-white p-6">
              <h2 className="font-sans text-base font-semibold">Get your farm ready</h2>
              <p className="mt-1 text-sm text-soil-muted">Complete these steps so customers nearby can find you.</p>
              <ol className="mt-5 divide-y divide-line border-y border-line">
                {steps.map((s, i) => (
                  <li key={s.label}>
                    <Link href={s.href} className="flex items-center gap-4 py-3.5 hover:bg-cream">
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center border text-sm font-semibold',
                          s.done ? 'border-leaf bg-leaf text-white' : 'border-line text-soil-muted',
                        )}
                      >
                        {s.done ? <Check className="h-4 w-4" /> : i + 1}
                      </span>
                      <span className={cn('flex-1 text-sm', s.done && 'text-soil-muted line-through')}>{s.label}</span>
                      {!s.done && <ArrowRight className="h-4 w-4 text-leaf" />}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {data.orders.pending > 0 && (
            <Link href="/farmer/orders" className="flex items-center justify-between gap-4 border border-leaf bg-sprout px-5 py-4 hover:bg-sprout/70">
              <span className="flex items-center gap-3">
                <Inbox className="h-5 w-5 text-leaf" aria-hidden />
                <span>
                  <strong>
                    {data.orders.pending} new {data.orders.pending === 1 ? 'order' : 'orders'}
                  </strong>{' '}
                  waiting for you to accept
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-leaf" aria-hidden />
            </Link>
          )}

          <section className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Truck} label="Orders to deliver" value={data.orders.active} href="/farmer/orders" />
            <Stat icon={Package} label="Products on sale" value={data.listings.active} href="/farmer/products?status=active" />
            <Stat
              icon={AlertTriangle}
              label="Running low"
              value={data.listings.lowStock}
              href="/farmer/inventory?status=low"
              warn={data.listings.lowStock > 0}
            />
            <Stat
              icon={CircleSlash}
              label="Out of stock"
              value={data.listings.outOfStock}
              href="/farmer/inventory?status=out"
              warn={data.listings.outOfStock > 0}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="border border-line bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-soil-muted">Profile verification</p>
              <div className="mt-3 flex items-center justify-between">
                <Badge tone={statusTone(data.profileStatus)}>{STATUS_LABELS[data.profileStatus]}</Badge>
                <span className="text-xs text-soil-muted">Checked by the Khet Se team</span>
              </div>
            </div>
            <div className="border border-line bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-soil-muted">Organic certification</p>
              <div className="mt-3 flex items-center justify-between">
                <Badge tone={statusTone(data.organicStatus)}>{STATUS_LABELS[data.organicStatus]}</Badge>
                <Link href="/farmer/farm#organic" className="text-xs font-semibold text-leaf hover:underline">
                  {data.organicStatus === 'unsubmitted' ? 'Add certificate' : 'View details'}
                </Link>
              </div>
            </div>
          </section>

          <section className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/farmer/inventory">
                <Boxes /> Update stock
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/farmer/products">
                <Package /> Manage products
              </Link>
            </Button>
          </section>
        </div>
      )}
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  href,
  warn,
}: {
  icon: typeof Package;
  label: string;
  value: number;
  href: string;
  warn?: boolean;
}) {
  return (
    <Link href={href} className="group bg-white p-5 hover:bg-cream">
      <Icon className={cn('h-5 w-5', warn ? 'text-turmeric' : 'text-leaf')} aria-hidden />
      <p className="mt-4 font-display text-4xl font-semibold">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-sm text-soil-muted group-hover:text-leaf">
        {label} <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
      </p>
    </Link>
  );
}
