'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/components/layout/DashboardShell';
import { Pager, RowLink, Table, Tabs } from '@/features/admin/ui';
import { useFetch } from '@/hooks/useFetch';
import { GROUP_STATUS, ORDER_STATUS, PAYMENT_STATUS, formatDateTime } from '@/lib/orderLabels';
import { formatINR } from '@/lib/utils';
import { adminService } from '@/services/admin.service';

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Orders />
    </Suspense>
  );
}

type View = 'all' | 'placed' | 'in_progress' | 'completed' | 'cancelled' | 'refunds';

function Orders() {
  const params = useSearchParams();
  const router = useRouter();
  const view: View = params.get('refunds') === 'true' ? 'refunds' : ((params.get('status') as View) ?? 'all');
  const method = params.get('method') ?? '';
  const q = params.get('q') ?? '';
  const page = Number(params.get('page') ?? 1);
  const [text, setText] = useState(q);

  const go = (next: { view?: View; method?: string; q?: string; page?: number }) => {
    const v = next.view ?? view;
    const p = new URLSearchParams();
    if (v === 'refunds') p.set('refunds', 'true');
    else if (v !== 'all') p.set('status', v);
    const m = next.method ?? method;
    if (m) p.set('method', m);
    const s = next.q ?? q;
    if (s) p.set('q', s);
    const pg = next.page ?? page;
    if (pg > 1) p.set('page', String(pg));
    router.replace(`/admin/orders${p.size ? `?${p}` : ''}`);
  };

  const { data, error, loading, reload } = useFetch(['admin', 'orders', view, method, q, page], () =>
    adminService.orders({
      status: view !== 'all' && view !== 'refunds' ? view : undefined,
      refunds: view === 'refunds' || undefined,
      paymentMethod: method || undefined,
      q: q || undefined,
      page,
      limit: 25,
    }),
  );

  return (
    <>
      <PageHeader title="Orders" description="Every order on Khet Se. Search by order number, customer name or mobile number." />
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          go({ q: text.trim(), page: 1 });
        }}
      >
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="KS261119-ABCDE, name or mobile" aria-label="Search orders" className="max-w-sm" />
        <Button type="submit">
          <Search /> Search
        </Button>
      </form>
      <div className="mb-5 flex flex-wrap gap-3">
        <Tabs
          label="Status"
          value={view}
          onChange={(v) => go({ view: v, page: 1 })}
          options={[
            { value: 'all', label: 'All' },
            { value: 'placed', label: 'Waiting for farmers' },
            { value: 'in_progress', label: 'In progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'refunds', label: 'Refunds owed' },
          ]}
        />
        <Tabs
          label="Payment"
          value={(method || 'any') as 'any' | 'cod' | 'online'}
          onChange={(m) => go({ method: m === 'any' ? '' : m, page: 1 })}
          options={[
            { value: 'any', label: 'Any payment' },
            { value: 'cod', label: 'Cash on delivery' },
            { value: 'online', label: 'Online' },
          ]}
        />
      </div>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton className="h-80" />
      ) : !data?.items.length ? (
        <EmptyState icon={ShoppingBag} title="No orders match" description="Try another search or clear the filters." />
      ) : (
        <div className={loading ? 'opacity-60' : ''}>
          <p className="mb-2 text-sm text-soil-muted">{data.meta.total} orders</p>
          <Table head={['Order', 'Customer', 'Farms', 'Total', 'Status', 'Payment', 'Placed', '']}>
            {data.items.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-2.5 font-semibold">{o.orderNumber}</td>
                <td className="px-4 py-2.5">
                  {o.customer.name}
                  <span className="block text-xs text-soil-muted">{o.customer.phone}</span>
                </td>
                <td className="px-4 py-2.5">
                  {o.farms.map((f) => (
                    <span key={f.name} className="block text-xs">
                      {f.name} · <span className="text-soil-muted">{GROUP_STATUS[f.status].label}</span>
                    </span>
                  ))}
                </td>
                <td className="px-4 py-2.5">{formatINR(o.total)}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge>
                </td>
                <td className="px-4 py-2.5 text-xs text-soil-muted">
                  {o.paymentMethod === 'cod' ? 'COD' : 'Online'} · {PAYMENT_STATUS[o.paymentStatus]}
                  {o.refundOutstanding > 0 && <span className="block font-semibold text-danger">Owes {formatINR(o.refundOutstanding)}</span>}
                </td>
                <td className="px-4 py-2.5 text-soil-muted">{formatDateTime(o.createdAt)}</td>
                <td className="px-4 py-2.5">
                  <RowLink href={`/admin/orders/${o.id}`}>Open</RowLink>
                </td>
              </tr>
            ))}
          </Table>
          <Pager page={page} totalPages={data.meta.totalPages} onChange={(p) => go({ page: p })} />
        </div>
      )}
    </>
  );
}
