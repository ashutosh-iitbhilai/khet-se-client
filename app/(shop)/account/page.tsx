'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useFetch } from '@/hooks/useFetch';
import { ORDER_STATUS, PAYMENT_STATUS, formatDateTime } from '@/lib/orderLabels';
import { formatINR } from '@/lib/utils';
import { orderService } from '@/services/order.service';

export default function MyOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useFetch(() => orderService.mine(page, 10), [page]);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }
  if (!data?.items.length) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="When you order from local farms, you can track every delivery here."
        action={
          <Button asChild>
            <Link href="/products">Start shopping</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {data.items.map((o) => {
          const st = ORDER_STATUS[o.status];
          const thumbs = o.groups.flatMap((g) => g.items).slice(0, 4);
          return (
            <li key={o.id}>
              <Link href={`/account/orders/${o.id}`} className="flex flex-col gap-4 border border-line bg-white p-4 hover:border-leaf sm:flex-row sm:items-center">
                <div className="flex -space-x-2">
                  {thumbs.map((i, idx) => (
                    <span key={idx} className="relative h-14 w-14 overflow-hidden border-2 border-white bg-sand">
                      <SafeImage src={i.image} alt="" fill sizes="56px" />
                    </span>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{o.orderNumber}</span>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-soil-muted">
                    {formatDateTime(o.createdAt)} · {o.groups.map((g) => g.farmName).join(', ')}
                  </p>
                  <p className="text-xs text-soil-muted">{PAYMENT_STATUS[o.paymentStatus]}</p>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  {formatINR(o.grandTotal)}
                  <ChevronRight className="h-4 w-4 text-soil-muted" aria-hidden />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {data.meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
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
