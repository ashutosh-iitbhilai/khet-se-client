'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Bike, KeyRound, Phone, RotateCcw, X } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { ActionLog } from '@/features/admin/ActionLog';
import { ReasonDialog, Table } from '@/features/admin/ui';
import { useFetch } from '@/hooks/useFetch';
import { GROUP_STATUS, ORDER_STATUS, PAYMENT_STATUS, formatDateTime } from '@/lib/orderLabels';
import { formatINR } from '@/lib/utils';
import { adminService } from '@/services/admin.service';
import { groupId } from '@/types';

export default function AdminOrderPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, reload } = useFetch(['admin', 'order', id], () => adminService.order(id), { refetchInterval: 30_000 });
  const [cancelling, setCancelling] = useState<{ id: string; farm: string } | null>(null);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) return <Skeleton className="h-96" />;
  const d = data!;
  const o = d.order;
  const st = ORDER_STATUS[o.status];

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-soil-muted hover:text-leaf">
        <ArrowLeft className="h-4 w-4" /> Orders
      </Link>

      <section className="flex flex-wrap items-start justify-between gap-4 border border-line bg-white p-5">
        <div>
          <h1 className="text-3xl font-semibold">Order {o.orderNumber}</h1>
          <p className="mt-1 text-sm text-soil-muted">
            Placed {formatDateTime(o.createdAt)} · {o.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online'} · {PAYMENT_STATUS[o.paymentStatus]}
          </p>
          {d.customer && (
            <p className="mt-2 text-sm">
              <Link href={`/admin/users/${d.customer.id}`} className="font-semibold hover:text-leaf">
                {d.customer.name}
              </Link>
              {d.customer.phone && (
                <a href={`tel:+91${d.customer.phone}`} className="ml-3 inline-flex items-center gap-1 hover:text-leaf">
                  <Phone className="h-4 w-4 text-leaf" /> +91 {d.customer.phone}
                </a>
              )}
              {d.customer.status !== 'active' && <Badge tone="red" className="ml-2">suspended</Badge>}
            </p>
          )}
          <p className="mt-1 text-sm text-soil-muted">
            Deliver to {o.address.name}, {o.address.line1}
            {o.address.landmark ? `, ${o.address.landmark}` : ''}, {o.address.city} {o.address.pincode} · {o.address.phone}
          </p>
        </div>
        <div className="text-right">
          <Badge tone={st.tone}>{st.label}</Badge>
          <p className="mt-2 font-display text-3xl font-semibold">{formatINR(o.grandTotal)}</p>
          <p className="text-xs text-soil-muted">
            items {formatINR(o.itemsTotal)} · delivery {formatINR(o.deliveryTotal)}
          </p>
        </div>
      </section>

      {o.groups.map((g) => {
        const gid = groupId(g);
        const delivery = d.deliveries.find((x) => x.group === gid);
        const open = ['pending', 'accepted', 'packed', 'out_for_delivery'].includes(g.status);
        return (
          <section key={gid} className="border border-line bg-white">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-cream px-5 py-3">
              <div>
                <p className="font-semibold">{g.farmName}</p>
                <p className="text-xs text-soil-muted">
                  {g.farmerName} {g.farmerPhone ? `· ${g.farmerPhone}` : ''} · {g.distanceKm} km
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={GROUP_STATUS[g.status].tone}>{GROUP_STATUS[g.status].label}</Badge>
                {open && (
                  <Button size="sm" variant="outline" onClick={() => setCancelling({ id: gid, farm: g.farmName })}>
                    <X /> Cancel this part
                  </Button>
                )}
              </div>
            </header>
            <div className="grid gap-4 p-5 text-sm md:grid-cols-[1fr_260px]">
              <div>
                <ul className="divide-y divide-line border-y border-line">
                  {g.items.map((i) => (
                    <li key={i.inventory} className="flex justify-between py-2">
                      <span>
                        {i.quantity} {i.unit} {i.productName}
                      </span>
                      <span>{formatINR(i.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-right">
                  Items {formatINR(g.subtotal)} · Delivery {formatINR(g.deliveryFee)} · <strong>{formatINR(g.total)}</strong>
                </p>
                {g.cancelReason && <p className="mt-2 text-soil-muted">Reason: {g.cancelReason}</p>}
                <ol className="mt-3 space-y-1 text-xs text-soil-muted">
                  {g.history.map((h, k) => (
                    <li key={k}>
                      {formatDateTime(h.at)} — {GROUP_STATUS[h.status].label} (by {h.by}){h.note ? `: ${h.note}` : ''}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="space-y-2">
                {g.handoverCode && open && (
                  <p className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-leaf" /> Code <strong className="tracking-widest">{g.handoverCode}</strong>
                    {g.codeLocked && <Badge tone="red">locked</Badge>}
                  </p>
                )}
                {delivery && (
                  <p className="flex items-start gap-2">
                    <Bike className="mt-0.5 h-4 w-4 text-leaf" />
                    <span>
                      {delivery.mode === 'partner' ? (delivery.partner ? `${delivery.partner} (${delivery.partnerPhone ?? 'no phone'})` : 'Waiting for a partner') : 'Farmer delivers'}
                      <span className="block text-xs text-soil-muted">
                        {delivery.status.replace(/_/g, ' ')}
                        {delivery.payout ? ` · payout ${formatINR(delivery.payout)}` : ''}
                        {delivery.deliveredAt ? ` · delivered ${formatDateTime(delivery.deliveredAt)}` : ''}
                      </span>
                    </span>
                  </p>
                )}
                <p className="text-xs text-soil-muted">{g.paymentCollected ? 'Cash collected' : o.paymentMethod === 'cod' ? 'Cash not yet collected' : ''}</p>
              </div>
            </div>
          </section>
        );
      })}

      <section className="space-y-3">
        <h2 className="font-sans text-sm font-semibold uppercase tracking-wide text-soil-muted">Payments</h2>
        <Table head={['Method', 'Amount', 'Status', 'Reference', 'Created', 'Paid']}>
          {d.payments.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-2.5">{p.provider === 'cod' ? 'Cash on delivery' : 'Razorpay'}</td>
              <td className="px-4 py-2.5">{formatINR(p.amount)}</td>
              <td className="px-4 py-2.5">{p.status}</td>
              <td className="px-4 py-2.5 text-xs text-soil-muted">{p.providerPaymentId ?? '—'}</td>
              <td className="px-4 py-2.5 text-soil-muted">{formatDateTime(p.createdAt)}</td>
              <td className="px-4 py-2.5 text-soil-muted">{p.paidAt ? formatDateTime(p.paidAt) : '—'}</td>
            </tr>
          ))}
        </Table>
        <RefundPanel orderId={o.id} refundDue={o.refundDue} outstanding={d.refundOutstanding} settled={d.refundsSettled} />
      </section>

      <ActionLog actions={d.actions} />

      <ReasonDialog
        open={!!cancelling}
        title={`Cancel ${cancelling?.farm ?? ''}’s part of this order?`}
        description="Stock goes back to the farm, and the customer and farmer see your reason. Paid online orders become a refund owed."
        confirmLabel="Cancel this part"
        danger
        onClose={() => setCancelling(null)}
        onConfirm={(note) => adminService.cancelGroup(o.id, cancelling!.id, note)}
      />
    </div>
  );
}

function RefundPanel({ orderId, refundDue, outstanding, settled }: { orderId: string; refundDue: number; outstanding: number; settled: { amount: number; reference?: string; note?: string; at: string }[] }) {
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (refundDue <= 0) return null;

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await adminService.recordRefund(orderId, { amount: Number(amount), reference: reference || undefined, note: 'Refund paid outside the app' });
      setAmount('');
      setReference('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-line bg-white p-5 text-sm">
      <h3 className="flex items-center gap-2 font-sans font-semibold">
        <RotateCcw className="h-4 w-4 text-leaf" /> Refund
      </h3>
      <p className="mt-1">
        Owed {formatINR(refundDue)} · paid back {formatINR(refundDue - outstanding)} ·{' '}
        <strong className={outstanding > 0 ? 'text-danger' : 'text-leaf'}>{outstanding > 0 ? `${formatINR(outstanding)} still owed` : 'fully refunded'}</strong>
      </p>
      {settled.map((s, i) => (
        <p key={i} className="text-xs text-soil-muted">
          {formatDateTime(s.at)}: {formatINR(s.amount)} {s.reference ? `(ref ${s.reference})` : ''}
        </p>
      ))}
      {outstanding > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-soil-muted">Refund the customer from the Razorpay dashboard first, then record it here.</p>
          {error && <Alert>{error}</Alert>}
          <div className="flex flex-wrap gap-2">
            <Input type="number" min={1} max={outstanding} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Amount (max ${outstanding})`} className="w-44" aria-label="Refund amount" />
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Razorpay refund id" className="w-56" aria-label="Refund reference" />
            <Button onClick={submit} loading={busy} disabled={!Number(amount)}>
              Record refund
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
