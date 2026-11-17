'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Package, UserRound } from 'lucide-react';
import { RequireRole } from '@/features/auth/RequireRole';
import { useAuth } from '@/features/auth/AuthProvider';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/account', label: 'Orders', icon: Package, match: (p: string) => p === '/account' || p.startsWith('/account/orders') },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin, match: (p: string) => p.startsWith('/account/addresses') },
  { href: '/account/profile', label: 'Profile', icon: UserRound, match: (p: string) => p.startsWith('/account/profile') },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  return (
    <RequireRole role="customer">
      <div className="section py-10 md:py-14">
        <p className="eyebrow">My account</p>
        <h1 className="mt-2 text-4xl font-semibold">Namaste, {user?.name.split(' ')[0]}</h1>
        <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-line" aria-label="Account">
          {TABS.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  '-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm',
                  active ? 'border-leaf font-semibold text-leaf-dark' : 'border-transparent text-soil-muted hover:text-soil',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8">{children}</div>
      </div>
    </RequireRole>
  );
}
