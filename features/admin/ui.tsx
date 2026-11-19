'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { VerificationStatus } from '@/types';

export function StatTile({ icon: Icon, label, value, hint, href, alert }: { icon: LucideIcon; label: string; value: ReactNode; hint?: string; href?: string; alert?: boolean }) {
  const body = (
    <>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-soil-muted">
        <Icon className={cn('h-4 w-4', alert ? 'text-turmeric' : 'text-leaf')} aria-hidden /> {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-soil-muted">{hint}</p>}
    </>
  );
  const cls = cn('block border bg-white p-5', alert ? 'border-turmeric' : 'border-line', href && 'hover:border-leaf');
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Square segmented filter, e.g. All / Customers / Farmers. */
export function Tabs<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[]; label: string }) {
  return (
    <div className="flex flex-wrap gap-1" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn('border px-3 py-1.5 text-sm font-medium', value === o.value ? 'border-leaf bg-leaf text-white' : 'border-line bg-white hover:border-leaf')}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 opacity-75">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <span className="px-2 text-sm text-soil-muted">
        Page {page} of {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}

const VERIFY: Record<VerificationStatus, { label: string; tone: BadgeTone }> = {
  unsubmitted: { label: 'Not submitted', tone: 'neutral' },
  pending: { label: 'Waiting for review', tone: 'amber' },
  verified: { label: 'Verified', tone: 'green' },
  rejected: { label: 'Rejected', tone: 'red' },
};
export const VerifyBadge = ({ status, what }: { status: VerificationStatus; what?: string }) => (
  <Badge tone={VERIFY[status].tone}>
    {what ? `${what}: ` : ''}
    {VERIFY[status].label}
  </Badge>
);

export const ROLE_LABEL = { customer: 'Customer', farmer: 'Farmer', delivery: 'Delivery partner', admin: 'Admin' } as const;

/** Square table wrapper that scrolls sideways on phones instead of breaking the page. */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line bg-cream text-xs uppercase tracking-wide text-soil-muted">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export const RowLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} className="inline-flex items-center gap-1 font-semibold text-leaf hover:underline">
    {children} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
  </Link>
);

/**
 * Confirms an admin action and asks for the reason, which goes into the audit trail (and,
 * for rejections and cancellations, is shown to the person affected).
 */
export function ReasonDialog({
  open,
  title,
  description,
  confirmLabel,
  danger,
  required = true,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  danger?: boolean;
  required?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<unknown>;
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const close = () => {
    setReason('');
    setError(null);
    onClose();
  };
  const submit = async () => {
    if (required && reason.trim().length < 3) return setError('Write a short reason (at least 3 characters).');
    setBusy(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      close();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onClose={close} title={title} description={description}>
      <div className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <label className="block text-sm">
          <span className="mb-1 block font-medium">{required ? 'Reason' : 'Note (optional)'}</span>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="Kept in the audit trail" autoFocus />
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={close} disabled={busy}>
            Back
          </Button>
          <Button className={danger ? 'bg-danger hover:bg-danger/90' : undefined} loading={busy} onClick={submit}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
