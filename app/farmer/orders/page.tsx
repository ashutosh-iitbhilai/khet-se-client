'use client';

import { useState } from 'react';
import { Inbox, Truck } from 'lucide-react';
import { PageHeader } from '@/features/farmer/FarmerShell';
import { FarmerOrderQueue } from '@/features/farmer/FarmerOrderQueue';
import { cn } from '@/lib/utils';

const TABS = [
  { view: 'incoming', label: 'New orders' },
  { view: 'active', label: 'To deliver' },
] as const;

export default function IncomingOrdersPage() {
  const [view, setView] = useState<'incoming' | 'active'>('incoming');
  return (
    <>
      <PageHeader title="Orders" description="Accept new orders, then pack and deliver them. Ask the customer for their 4-digit code on delivery." />
      <div className="mb-6 flex gap-1 border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.view}
            role="tab"
            aria-selected={view === t.view}
            onClick={() => setView(t.view)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm',
              view === t.view ? 'border-leaf font-semibold text-leaf-dark' : 'border-transparent text-soil-muted hover:text-soil',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {view === 'incoming' ? (
        <FarmerOrderQueue
          view="incoming"
          empty={{ icon: Inbox, title: 'No new orders', description: 'New orders from customers near you will appear here.' }}
        />
      ) : (
        <FarmerOrderQueue
          view="active"
          empty={{ icon: Truck, title: 'Nothing to deliver', description: 'Orders you accept move here until they are delivered.' }}
        />
      )}
    </>
  );
}
