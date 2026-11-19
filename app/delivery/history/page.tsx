'use client';

import { History } from 'lucide-react';
import { PageHeader } from '@/components/layout/DashboardShell';
import { JobList } from '@/features/delivery/JobList';

export default function DeliveryHistoryPage() {
  return (
    <>
      <PageHeader title="History & earnings" description="Completed and cancelled deliveries, newest first. The amount on each card is what you earned." />
      <JobList source="history" empty={{ icon: History, title: 'No deliveries yet', description: 'Your completed deliveries will be listed here.' }} />
    </>
  );
}
