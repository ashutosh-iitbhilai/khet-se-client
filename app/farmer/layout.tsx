import type { Metadata } from 'next';
import { RequireRole } from '@/features/auth/RequireRole';
import { FarmerShell } from '@/features/farmer/FarmerShell';

export const metadata: Metadata = { title: { default: 'Farmer dashboard', template: '%s · Farmer · Khet Se' } };

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="farmer">
      <FarmerShell>{children}</FarmerShell>
    </RequireRole>
  );
}
