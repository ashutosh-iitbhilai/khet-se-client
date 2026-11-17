import { Check, X } from 'lucide-react';
import { TRACK_LABELS, TRACK_STEPS, formatDateTime } from '@/lib/orderLabels';
import { cn } from '@/lib/utils';
import type { OrderGroup } from '@/types';

/** Horizontal step tracker for one farm's part of an order. */
export function OrderTracker({ group }: { group: OrderGroup }) {
  const stoppedAt = group.status === 'rejected' || group.status === 'cancelled' ? group.history.at(-1) : null;
  const reached = new Map(group.history.map((h) => [h.status, h.at]));
  const currentIdx = TRACK_STEPS.indexOf(group.status);

  if (stoppedAt) {
    return (
      <div className="flex items-start gap-3 border-l-4 border-danger bg-red-50 px-4 py-3 text-sm">
        <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
        <div>
          <p className="font-semibold text-danger">{group.status === 'rejected' ? 'The farmer couldn’t take this order' : 'Cancelled'}</p>
          <p className="text-soil-muted">
            {stoppedAt.note ?? group.cancelReason ?? ''} · {formatDateTime(stoppedAt.at)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol className="grid grid-cols-5" aria-label="Delivery progress">
      {TRACK_STEPS.map((s, i) => {
        const done = i <= currentIdx;
        const at = reached.get(s);
        return (
          <li key={s} className="relative flex flex-col items-center text-center" aria-current={i === currentIdx ? 'step' : undefined}>
            {i > 0 && <span className={cn('absolute right-1/2 top-3.5 h-0.5 w-full', i <= currentIdx ? 'bg-leaf' : 'bg-line')} aria-hidden />}
            <span
              className={cn(
                'relative z-10 flex h-7 w-7 items-center justify-center border-2 text-xs font-semibold',
                done ? 'border-leaf bg-leaf text-white' : 'border-line bg-white text-soil-muted',
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn('mt-2 text-[11px] font-medium leading-tight sm:text-xs', done ? 'text-soil' : 'text-soil-muted')}>{TRACK_LABELS[s]}</span>
            {at && <span className="mt-0.5 hidden text-[10px] text-soil-muted sm:block">{formatDateTime(at)}</span>}
          </li>
        );
      })}
    </ol>
  );
}
