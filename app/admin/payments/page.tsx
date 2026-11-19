'use client';

import { useState } from 'react';
import { ReceiptIndianRupee } from 'lucide-react';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/components/layout/DashboardShell';
import { Pager, RowLink, Table, Tabs } from '@/features/admin/ui';
import { useFetch } from '@/hooks/useFetch';
import { formatDateTime } from '@/lib/orderLabels';
import { formatINR } from '@/lib/utils';
import { adminService } from '@/services/admin.service';

type Provider = 'any' | 'cod' | 'razorpay';
type Status = 'any' | 'created' | 'paid' | 'failed' | 'cancelled';

export default function PaymentsPage() {
  const [provider, setProvider] = useState<Provider>('any');
  const [status, setStatus] = useState<Status>('any');
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useFetch(['admin', 'payments', provider, status, page], () =>
    adminService.payments({ provider: provider === 'any' ? undefined : provider, status: status === 'any' ? undefined : status, page, limit: 30 }),
  );
  const totals = data?.meta.totals ?? [];
  const sum = (p: string, s: string) => totals.filter((t) => t.provider === p && t.status === s).reduce((a, t) => a + t.amount, 0);

  return (
    <>
      <PageHeader title="Transactions" description="Every payment record: cash on delivery and online (Razorpay)." />
      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        {[
          ['Cash collected', sum('cod', 'paid')],
          ['Cash to collect', sum('cod', 'created')],
          ['Paid online', sum('razorpay', 'paid')],
          ['Online not completed', sum('razorpay', 'created') + sum('razorpay', 'failed')],
        ].map(([label, amount]) => (
          <div key={label as string} className="border border-line bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-soil-muted">{label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{formatINR(amount as number)}</p>
          </div>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap gap-3">
        <Tabs label="Method" value={provider} onChange={(v) => (setProvider(v), setPage(1))} options={[{ value: 'any', label: 'All methods' }, { value: 'cod', label: 'Cash on delivery' }, { value: 'razorpay', label: 'Online' }]} />
        <Tabs label="Status" value={status} onChange={(v) => (setStatus(v), setPage(1))} options={[{ value: 'any', label: 'Any status' }, { value: 'paid', label: 'Paid' }, { value: 'created', label: 'Waiting' }, { value: 'failed', label: 'Failed' }, { value: 'cancelled', label: 'Cancelled' }]} />
      </div>
      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton className="h-80" />
      ) : !data?.items.length ? (
        <EmptyState icon={ReceiptIndianRupee} title="No transactions match" />
      ) : (
        <div className={loading ? 'opacity-60' : ''}>
          <Table head={['Order', 'Customer', 'Method', 'Amount', 'Status', 'Reference', 'Created', 'Paid', '']}>
            {data.items.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5 font-semibold">{p.orderNumber ?? '—'}</td>
                <td className="px-4 py-2.5">{p.customer ?? '—'}</td>
                <td className="px-4 py-2.5">{p.provider === 'cod' ? 'COD' : 'Razorpay'}</td>
                <td className="px-4 py-2.5">{formatINR(p.amount)}</td>
                <td className="px-4 py-2.5">{p.status}</td>
                <td className="px-4 py-2.5 text-xs text-soil-muted">{p.providerPaymentId ?? '—'}</td>
                <td className="px-4 py-2.5 text-soil-muted">{formatDateTime(p.createdAt)}</td>
                <td className="px-4 py-2.5 text-soil-muted">{p.paidAt ? formatDateTime(p.paidAt) : '—'}</td>
                <td className="px-4 py-2.5">{p.orderId && <RowLink href={`/admin/orders/${p.orderId}`}>Order</RowLink>}</td>
              </tr>
            ))}
          </Table>
          <Pager page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </div>
      )}
    </>
  );
}
