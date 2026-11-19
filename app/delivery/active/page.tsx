'use client';

import Link from 'next/link';
import { ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/DashboardShell';
import { JobList } from '@/features/delivery/JobList';

export default function MyDeliveriesPage() {
  return (
    <>
      <PageHeader title="My deliveries" description="Pick up from the farm, then ask the customer for their 4-digit code when you hand it over." />
      <JobList
        source="active"
        empty={{
          icon: ListChecks,
          title: 'No deliveries in progress',
          description: 'Accepted deliveries appear here until they are delivered.',
          action: (
            <Button asChild>
              <Link href="/delivery/jobs">Find deliveries</Link>
            </Button>
          ),
        }}
      />
    </>
  );
}
