'use client';

import type { ReactNode } from 'react';
import { History, LayoutDashboard, ListChecks, MapPinned, Search, Settings } from 'lucide-react';
import { DashboardShell, type NavItem } from '@/components/layout/DashboardShell';

const NAV: NavItem[] = [
  { href: '/delivery', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/delivery/jobs', label: 'Find Deliveries', icon: Search },
  { href: '/delivery/active', label: 'My Deliveries', icon: ListChecks },
  { href: '/delivery/history', label: 'History & Earnings', icon: History },
  { href: '/delivery/profile', label: 'Work Area & Vehicle', icon: MapPinned },
  { href: '/delivery/settings', label: 'Account Settings', icon: Settings },
];

export function DeliveryShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell label="Delivery partner" nav={NAV}>
      {children}
    </DashboardShell>
  );
}
