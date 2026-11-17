'use client';

import { CheckCheck } from 'lucide-react';
import { PageHeader } from '@/features/farmer/FarmerShell';
import { FarmerOrderQueue } from '@/features/farmer/FarmerOrderQueue';

export default function CompletedOrdersPage() {
  return (
    <>
      <PageHeader title="Completed orders" description="Delivered, declined and cancelled orders." />
      <FarmerOrderQueue
        view="completed"
        empty={{ icon: CheckCheck, title: 'No completed orders yet', description: 'Orders you deliver will be listed here.' }}
      />
    </>
  );
}
