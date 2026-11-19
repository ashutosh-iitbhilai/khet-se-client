import type { Metadata } from 'next';
import { RequireRole } from '@/features/auth/RequireRole';
import { DeliveryShell } from '@/features/delivery/DeliveryShell';

export const metadata: Metadata = { title: { default: 'Delivery partner', template: '%s · Delivery · Khet Se' } };

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="delivery">
      <DeliveryShell>{children}</DeliveryShell>
    </RequireRole>
  );
}
