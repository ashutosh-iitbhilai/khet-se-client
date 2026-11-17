import type { BadgeTone } from '@/components/ui/badge';
import type { GroupStatus, OrderStatus, PaymentStatus } from '@/types';

export const GROUP_STATUS: Record<GroupStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Waiting for farmer', tone: 'amber' },
  accepted: { label: 'Accepted', tone: 'green' },
  packed: { label: 'Packed', tone: 'green' },
  out_for_delivery: { label: 'Out for delivery', tone: 'green' },
  delivered: { label: 'Delivered', tone: 'neutral' },
  rejected: { label: 'Declined by farmer', tone: 'red' },
  cancelled: { label: 'Cancelled', tone: 'red' },
};

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
  placed: { label: 'Placed', tone: 'amber' },
  in_progress: { label: 'In progress', tone: 'green' },
  completed: { label: 'Completed', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'red' },
};

export const PAYMENT_STATUS: Record<PaymentStatus, string> = {
  cod_pending: 'Pay cash on delivery',
  pending: 'Payment not completed',
  paid: 'Paid',
  refund_pending: 'Refund due',
  cancelled: 'No payment needed',
};

/** The happy path shown as a tracker. */
export const TRACK_STEPS: GroupStatus[] = ['pending', 'accepted', 'packed', 'out_for_delivery', 'delivered'];
export const TRACK_LABELS: Record<string, string> = {
  pending: 'Placed',
  accepted: 'Accepted',
  packed: 'Packed',
  out_for_delivery: 'On the way',
  delivered: 'Delivered',
};

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Short id for idempotency keys. */
export const newKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
