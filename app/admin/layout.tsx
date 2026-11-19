import type { Metadata } from 'next';
import { RequireRole } from '@/features/auth/RequireRole';
import { AdminShell } from '@/features/admin/AdminShell';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s · Admin · Khet Se' }, robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="admin">
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  );
}
