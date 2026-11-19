'use client';

import { BadgeCheck, Banknote, Bike, IndianRupee, PackageCheck, RotateCcw, ShoppingBag, Tractor, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/components/layout/DashboardShell';
import { RowLink, StatTile, Table } from '@/features/admin/ui';
import { useFetch } from '@/hooks/useFetch';
import { ORDER_STATUS, PAYMENT_STATUS, formatDateTime } from '@/lib/orderLabels';
import { formatINR } from '@/lib/utils';
import { adminService } from '@/services/admin.service';

export default function AdminOverviewPage() {
  const { data, error, loading, reload } = useFetch(['admin', 'overview'], () => adminService.overview(), { refetchInterval: 60_000 });
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) return <Skeleton className="h-96" />;
  const d = data!;
  const g = d.orders.groups;
  const pendingReviews = d.verification.profilesPending + d.verification.organicPending;

  return (
    <>
      <PageHeader title="Overview" description="Khet Se right now. Numbers refresh every minute." />

      <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wide text-soil-muted">Needs attention</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={BadgeCheck} label="Farmers to verify" value={pendingReviews} hint={`${d.verification.profilesPending} profiles · ${d.verification.organicPending} organic certificates`} href="/admin/verification" alert={pendingReviews > 0} />
        <StatTile icon={ShoppingBag} label="Waiting for farmers" value={g.pending ?? 0} hint="Orders not yet accepted" href="/admin/orders?status=placed" alert={(g.pending ?? 0) > 0} />
        <StatTile icon={Bike} label="Deliveries without a partner" value={d.deliveries.open} hint={`${d.deliveries.partnersOnline} partners online`} alert={d.deliveries.open > 0} />
        <StatTile icon={RotateCcw} label="Refunds owed" value={formatINR(d.money.refundsOutstanding)} hint={`${d.money.refundsOutstandingOrders} orders`} href="/admin/orders?refunds=true" alert={d.money.refundsOutstanding > 0} />
      </div>

      <h2 className="mb-3 mt-8 font-sans text-sm font-semibold uppercase tracking-wide text-soil-muted">Business</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={IndianRupee} label="Delivered, last 30 days" value={formatINR(d.money.deliveredLast30Days)} hint={`${d.money.ordersDeliveredLast30Days} orders`} />
        <StatTile icon={ShoppingBag} label="Orders" value={d.orders.today} hint={`today · ${d.orders.last7Days} in the last 7 days`} href="/admin/orders" />
        <StatTile icon={Banknote} label="Cash to collect" value={formatINR(d.money.codToCollect)} hint="On open cash-on-delivery orders" />
        <StatTile icon={PackageCheck} label="In progress" value={(g.accepted ?? 0) + (g.packed ?? 0) + (g.out_for_delivery ?? 0)} hint={`${g.out_for_delivery ?? 0} on the way · ${d.deliveries.assigned} with partners`} />
        <StatTile icon={Users} label="Customers" value={d.users.customers} href="/admin/users?role=customer" />
        <StatTile icon={Tractor} label="Farmers" value={d.users.farmers} href="/admin/users?role=farmer" />
        <StatTile icon={Bike} label="Delivery partners" value={d.users.partners} href="/admin/users?role=delivery" />
        <StatTile icon={Users} label="Suspended accounts" value={d.users.suspended} href="/admin/users?status=suspended" />
      </div>

      <h2 className="mb-3 mt-8 font-sans text-sm font-semibold uppercase tracking-wide text-soil-muted">Latest orders</h2>
      <Table head={['Order', 'Customer', 'Total', 'Status', 'Payment', 'Placed', '']}>
        {d.recentOrders.map((o) => (
          <tr key={o.id}>
            <td className="px-4 py-2.5 font-semibold">{o.orderNumber}</td>
            <td className="px-4 py-2.5">{o.customer}</td>
            <td className="px-4 py-2.5">{formatINR(o.total)}</td>
            <td className="px-4 py-2.5">
              <Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge>
            </td>
            <td className="px-4 py-2.5 text-soil-muted">{o.paymentMethod === 'cod' ? 'COD' : 'Online'} · {PAYMENT_STATUS[o.paymentStatus]}</td>
            <td className="px-4 py-2.5 text-soil-muted">{formatDateTime(o.createdAt)}</td>
            <td className="px-4 py-2.5">
              <RowLink href={`/admin/orders/${o.id}`}>Open</RowLink>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
