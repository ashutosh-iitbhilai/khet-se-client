'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useCustomerLocation } from '@/features/location/LocationProvider';
import { ListingDetailView } from '@/features/marketplace/ListingDetailView';
import { useFetch } from '@/hooks/useFetch';
import { ApiError } from '@/lib/api';
import { marketplaceService } from '@/services/marketplace.service';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { location, ready } = useCustomerLocation();

  const { data, error, loading, reload } = useFetch(
    async () => (ready ? marketplaceService.listing(id, location ?? undefined) : null),
    [id, ready, location?.lat, location?.lng],
  );

  if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
    return (
      <div className="section py-16">
        <EmptyState
          icon={PackageX}
          title="This product is no longer available"
          description="The farmer may have sold out or paused this listing."
          action={
            <Button asChild>
              <Link href="/products">Browse other produce</Link>
            </Button>
          }
        />
      </div>
    );
  }
  if (error) {
    return (
      <div className="section py-16">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (loading || !data) {
    return (
      <div className="section grid gap-10 py-12 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3]" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }
  return <ListingDetailView item={data.item} />;
}
