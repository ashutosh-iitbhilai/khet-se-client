'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthProvider';
import type { UserRole } from '@/types';

const ROLE_NAMES: Record<UserRole, string> = { customer: 'customer', farmer: 'farmer', delivery: 'delivery partner', admin: 'admin' };

/**
 * Client-side gate for role dashboards. The API enforces the same rules,
 * so this is about UX (redirect to login), not security.
 */
export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-soil-muted">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (user.role !== role) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <Lock className="h-8 w-8 text-leaf" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold">This area is for {ROLE_NAMES[role]}s</h1>
        <p className="mt-2 max-w-sm text-sm text-soil-muted">
          You’re signed in as a {ROLE_NAMES[user.role]}. Use a {ROLE_NAMES[role]} account to open this page.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Go to home</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
