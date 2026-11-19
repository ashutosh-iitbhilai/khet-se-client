'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Ban, CheckCircle2, MapPin, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { ROLE_LABEL, ReasonDialog, RowLink, Table, VerifyBadge } from '@/features/admin/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { useFetch } from '@/hooks/useFetch';
import { GROUP_STATUS, ORDER_STATUS, PAYMENT_STATUS, formatDateTime } from '@/lib/orderLabels';
import { formatINR } from '@/lib/utils';
import { adminService } from '@/services/admin.service';
import { ActionLog } from '@/features/admin/ActionLog';

export default function AdminUserPage() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const { data, error, loading, reload } = useFetch(['admin', 'user', id], () => adminService.user(id));
  const [dialog, setDialog] = useState<'suspend' | 'reactivate' | null>(null);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) return <Skeleton className="h-96" />;
  const u = data!.user;
  const canChange = u.role !== 'admin' && u.id !== me?.id;

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-soil-muted hover:text-leaf">
        <ArrowLeft className="h-4 w-4" /> People
      </Link>

      <section className="flex flex-wrap items-start justify-between gap-4 border border-line bg-white p-5">
        <div>
          <h1 className="text-3xl font-semibold">{u.name}</h1>
          <p className="mt-1 text-sm text-soil-muted">
            {ROLE_LABEL[u.role]} · joined {formatDateTime(u.createdAt)}
            {u.lastLoginAt ? ` · last login ${formatDateTime(u.lastLoginAt)}` : ''}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            {u.phone && (
              <a href={`tel:+91${u.phone}`} className="inline-flex items-center gap-1 hover:text-leaf">
                <Phone className="h-4 w-4 text-leaf" /> +91 {u.phone}
              </a>
            )}
            {u.email && <span className="text-soil-muted">{u.email}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={u.status === 'active' ? 'green' : 'red'}>{u.status}</Badge>
          {canChange &&
            (u.status === 'active' ? (
              <Button variant="outline" onClick={() => setDialog('suspend')}>
                <Ban /> Suspend
              </Button>
            ) : (
              <Button onClick={() => setDialog('reactivate')}>
                <CheckCircle2 /> Reactivate
              </Button>
            ))}
        </div>
      </section>

      {u.farmer && (
        <section className="border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-sans text-base font-semibold">Farmer</h2>
            <div className="flex gap-2">
              <VerifyBadge what="Profile" status={u.farmer.profileStatus} />
              <VerifyBadge what="Organic" status={u.farmer.organicCertification.status} />
              {(u.farmer.profileStatus === 'pending' || u.farmer.organicCertification.status === 'pending') && <RowLink href="/admin/verification">Review</RowLink>}
            </div>
          </div>
          {u.farmer.bio && <p className="mt-2 text-sm text-soil-muted [overflow-wrap:anywhere]">“{u.farmer.bio}”</p>}
          <p className="mt-2 text-sm">
            Rating {u.farmer.ratingAvg.toFixed(1)} ({u.farmer.ratingCount}) · {u.farmer.activeListings} active listings
            {u.farmer.organicCertification.certificateNumber && ` · certificate ${u.farmer.organicCertification.certificateNumber} (${u.farmer.organicCertification.issuer ?? 'issuer?'})`}
          </p>
          <div className="mt-3 space-y-1 text-sm">
            {u.farmer.farms.map((f) => (
              <p key={f.id} className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-leaf" aria-hidden />
                <span>
                  <strong>{f.name}</strong> — {[f.village, f.district].filter(Boolean).join(', ')} · delivers {f.deliveryRadiusKm} km
                  {!f.isActive && <Badge tone="red" className="ml-2">inactive</Badge>}
                  {!f.deliveryAvailable && <Badge tone="amber" className="ml-2">delivery off</Badge>}
                  <a className="ml-2 text-leaf hover:underline" target="_blank" rel="noopener noreferrer" href={`https://www.openstreetmap.org/?mlat=${f.location.lat}&mlon=${f.location.lng}#map=15/${f.location.lat}/${f.location.lng}`}>
                    map
                  </a>
                </span>
              </p>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {Object.entries(u.farmer.sales).map(([status, s]) => (
              <span key={status} className="border border-line px-3 py-1.5">
                {GROUP_STATUS[status as keyof typeof GROUP_STATUS]?.label ?? status}: {s!.groups} · {formatINR(s!.total)}
              </span>
            ))}
          </div>
        </section>
      )}

      {u.customer && (
        <section className="space-y-3">
          <p className="text-sm">
            <strong>{u.customer.totals.orders}</strong> orders · <strong>{formatINR(u.customer.totals.spent)}</strong> spent
          </p>
          <Table head={['Order', 'Total', 'Status', 'Payment', 'Placed', '']}>
            {u.customer.orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-2.5 font-semibold">{o.orderNumber}</td>
                <td className="px-4 py-2.5">{formatINR(o.grandTotal)}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge>
                </td>
                <td className="px-4 py-2.5 text-soil-muted">{PAYMENT_STATUS[o.paymentStatus]}</td>
                <td className="px-4 py-2.5 text-soil-muted">{formatDateTime(o.createdAt)}</td>
                <td className="px-4 py-2.5">
                  <RowLink href={`/admin/orders/${o.id}`}>Open</RowLink>
                </td>
              </tr>
            ))}
          </Table>
          <p className="text-sm text-soil-muted">Addresses: {u.customer.addresses.map((a) => `${a.line1}, ${a.city} ${a.pincode}`).join(' · ') || 'none'}</p>
        </section>
      )}

      {u.partner && (
        <section className="border border-line bg-white p-5 text-sm">
          <h2 className="font-sans text-base font-semibold">Delivery partner</h2>
          <p className="mt-2">
            {u.partner.vehicle} · based at {u.partner.base ?? 'not set'} · {u.partner.serviceRadiusKm} km work area · {u.partner.isOnline ? 'online' : 'offline'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(u.partner.jobs).map(([s, j]) => (
              <span key={s} className="border border-line px-3 py-1.5">
                {s.replace(/_/g, ' ')}: {j.count} · {formatINR(j.payout ?? 0)}
              </span>
            ))}
          </div>
        </section>
      )}

      <ActionLog actions={u.actions} />

      <ReasonDialog
        open={!!dialog}
        title={dialog === 'suspend' ? `Suspend ${u.name}?` : `Reactivate ${u.name}?`}
        description={dialog === 'suspend' ? 'They are signed out everywhere and cannot log in. A farmer’s produce leaves the marketplace.' : 'They can log in again.'}
        confirmLabel={dialog === 'suspend' ? 'Suspend account' : 'Reactivate account'}
        danger={dialog === 'suspend'}
        onClose={() => setDialog(null)}
        onConfirm={(reason) => adminService.setStatus(u.id, dialog === 'suspend' ? 'suspended' : 'active', reason)}
      />
    </div>
  );
}
