'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useFetch } from '@/hooks/useFetch';
import { deliveryService } from '@/services/delivery.service';
import type { DeliveryJob } from '@/types';
import { JobCard } from './JobCard';

type Source = 'board' | 'active' | 'history';

/** A paged list of jobs. The board refreshes itself so new requests appear without reloading. */
export function JobList({
  source,
  empty,
  onAccepted,
}: {
  source: Source;
  empty: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode };
  onAccepted?: (job: DeliveryJob) => void;
}) {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useFetch(
    ['delivery', 'jobs', source, page],
    () => (source === 'board' ? deliveryService.available(page) : deliveryService.mine(source === 'active' ? 'active' : 'completed', page)),
    // The board refreshes like a live feed; active jobs pick up changes made by the farmer.
    { refetchInterval: source === 'board' ? 20_000 : source === 'active' ? 30_000 : undefined },
  );

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }
  if (!data?.items.length) return <EmptyState icon={empty.icon} title={empty.title} description={empty.description} action={empty.action} />;

  return (
    <div className={`space-y-4 ${loading ? 'opacity-60' : ''}`}>
      {data.items.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          mode={source}
          onChanged={(accepted) => {
            if (accepted && source === 'board') onAccepted?.(accepted);
            void reload();
          }}
        />
      ))}
      {data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="px-3 text-sm text-soil-muted">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <Button variant="outline" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
