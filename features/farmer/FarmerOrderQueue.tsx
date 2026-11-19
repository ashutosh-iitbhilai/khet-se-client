'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useFetch } from '@/hooks/useFetch';
import { orderService } from '@/services/order.service';
import { FarmerOrderCard } from './FarmerOrderCard';

export function FarmerOrderQueue({
  view,
  empty,
}: {
  view: 'incoming' | 'active' | 'completed';
  empty: { icon: LucideIcon; title: string; description: string };
}) {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useFetch(['orders', 'farmer-queue', view, page], () => orderService.farmerQueue(view, page), {
    // New orders and partner pickups show up without reloading.
    refetchInterval: view === 'completed' ? undefined : 30_000,
  });

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    );
  }
  if (!data?.items.length) return <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />;

  return (
    <div className={`space-y-4 ${loading ? 'opacity-60' : ''}`}>
      {data.items.flatMap((o) => o.groups.map((g) => <FarmerOrderCard key={g.id} order={o} group={g} onChanged={reload} />))}
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
