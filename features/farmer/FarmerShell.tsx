'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  Boxes,
  CheckCheck,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Package,
  PlusSquare,
  Settings,
  Tractor,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/features/auth/AuthProvider';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/farmer', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/farmer/products', label: 'My Products', icon: Package, exact: true },
  { href: '/farmer/products/new', label: 'Add Product', icon: PlusSquare, exact: true },
  { href: '/farmer/inventory', label: 'Inventory', icon: Boxes },
  { href: '/farmer/orders', label: 'Incoming Orders', icon: Inbox, exact: true },
  { href: '/farmer/orders/completed', label: 'Completed Orders', icon: CheckCheck },
  { href: '/farmer/farm', label: 'Farm Profile', icon: Tractor },
  { href: '/farmer/settings', label: 'Account Settings', icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function FarmerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Product edit pages (/farmer/products/<id>) highlight "My Products".
  const activeHref =
    NAV.find((n) => isActive(pathname, n.href, n.exact))?.href ??
    (pathname.startsWith('/farmer/products/') ? '/farmer/products' : undefined);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[256px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-line px-5">
          <Logo />
        </div>
        <p className="px-5 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-soil-muted">Farmer</p>
        <nav className="flex-1 space-y-0.5 px-3" aria-label="Farmer dashboard">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === activeHref;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 border-l-[3px] px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'border-leaf bg-sprout font-semibold text-leaf-dark'
                    : 'border-transparent text-soil hover:bg-cream',
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-0.5 border-t border-line p-3">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-soil-muted hover:bg-cream">
            <Home className="h-[18px] w-[18px]" /> View marketplace
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-soil-muted hover:bg-cream"
          >
            <LogOut className="h-[18px] w-[18px]" /> Log out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 border-b border-line bg-white lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Logo />
            <button type="button" onClick={handleLogout} className="p-2 text-soil-muted" aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-2 pb-2" aria-label="Farmer dashboard">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={href === activeHref ? 'page' : undefined}
                className={cn(
                  'whitespace-nowrap border px-3 py-1.5 text-xs font-medium',
                  href === activeHref ? 'border-leaf bg-leaf text-white' : 'border-line bg-white text-soil',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
          {user && <span className="sr-only">Signed in as {user.name}</span>}
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-soil-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
