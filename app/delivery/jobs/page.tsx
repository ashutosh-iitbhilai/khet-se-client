'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/DashboardShell';
import { JobList } from '@/features/delivery/JobList';

export default function FindDeliveriesPage() {
  const router = useRouter();
  return (
    <>
      <PageHeader title="Find deliveries" description="Open deliveries from farms in your work area, nearest pickup first. The first partner to accept gets it." />
      <JobList
        source="board"
        onAccepted={() => router.push('/delivery/active')}
        empty={{
          icon: Search,
          title: 'No open deliveries near you right now',
          description: 'This list refreshes on its own. Make sure you are online and your work area covers nearby farms.',
          action: (
            <Button asChild variant="outline">
              <Link href="/delivery/profile">Check work area</Link>
            </Button>
          ),
        }}
      />
    </>
  );
}
