'use client';

import type { ReactNode } from 'react';
import { BadgeCheck, LayoutDashboard, ReceiptIndianRupee, ScrollText, ShoppingBag, Users } from 'lucide-react';
import { DashboardShell, type NavItem } from '@/components/layout/DashboardShell';

const NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/verification', label: 'Farmer Verification', icon: BadgeCheck },
  { href: '/admin/users', label: 'People', icon: Users },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/payments', label: 'Transactions', icon: ReceiptIndianRupee },
  { href: '/admin/audit', label: 'Audit Trail', icon: ScrollText },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell label="Admin" nav={NAV}>
      {children}
    </DashboardShell>
  );
}
