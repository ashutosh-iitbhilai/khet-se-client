'use client';

import type { ReactNode } from 'react';
import { Boxes, CheckCheck, Inbox, LayoutDashboard, Package, PlusSquare, Settings, Tractor } from 'lucide-react';
import { DashboardShell, type NavItem } from '@/components/layout/DashboardShell';

export { PageHeader } from '@/components/layout/DashboardShell';

const NAV: NavItem[] = [
  { href: '/farmer', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/farmer/products', label: 'My Products', icon: Package, exact: true },
  { href: '/farmer/products/new', label: 'Add Product', icon: PlusSquare, exact: true },
  { href: '/farmer/inventory', label: 'Inventory', icon: Boxes },
  { href: '/farmer/orders', label: 'Incoming Orders', icon: Inbox, exact: true },
  { href: '/farmer/orders/completed', label: 'Completed Orders', icon: CheckCheck },
  { href: '/farmer/farm', label: 'Farm Profile', icon: Tractor },
  { href: '/farmer/settings', label: 'Account Settings', icon: Settings },
];

// Product edit pages (/farmer/products/<id>) highlight "My Products".
const fallback = (pathname: string) => (pathname.startsWith('/farmer/products/') ? '/farmer/products' : undefined);

export function FarmerShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell label="Farmer" nav={NAV} fallbackActive={fallback}>
      {children}
    </DashboardShell>
  );
}
