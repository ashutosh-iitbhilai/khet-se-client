'use client';

import { formatDateTime } from '@/lib/orderLabels';
import type { AdminAction } from '@/services/admin.service';

export const ACTION_LABEL: Record<string, string> = {
  'farmer.profile.verified': 'Profile verified',
  'farmer.profile.rejected': 'Profile rejected',
  'farmer.organic.verified': 'Organic certificate verified',
  'farmer.organic.rejected': 'Organic certificate rejected',
  'user.suspended': 'Account suspended',
  'user.reactivated': 'Account reactivated',
  'order.group.cancelled': 'Order part cancelled',
  'order.refund.recorded': 'Refund recorded',
};
export const actionLabel = (a: string) => ACTION_LABEL[a] ?? a;

export function ActionLog({ actions }: { actions: AdminAction[] }) {
  if (!actions.length) return null;
  return (
    <section>
      <h2 className="mb-2 font-sans text-sm font-semibold uppercase tracking-wide text-soil-muted">Admin history</h2>
      <ul className="divide-y divide-line border border-line bg-white text-sm">
        {actions.map((a) => (
          <li key={a.id} className="px-4 py-2.5">
            <strong>{actionLabel(a.action)}</strong> by {a.by ?? 'admin'} · <span className="text-soil-muted">{formatDateTime(a.at)}</span>
            {a.note && <p className="text-soil-muted">“{a.note}”</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
