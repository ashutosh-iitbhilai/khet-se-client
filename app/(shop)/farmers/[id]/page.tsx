'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useCustomerLocation } from '@/features/location/LocationProvider';
import { FarmerProfileView } from '@/features/marketplace/FarmerProfileView';
import { useFetch } from '@/hooks/useFetch';
import { ApiError } from '@/lib/api';
import { marketplaceService } from '@/services/marketplace.service';

export default function FarmerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { location, ready } = useCustomerLocation();
  const { data, error, loading, reload } = useFetch(
    async () => (ready ? marketplaceService.farmerProfile(id, location ?? undefined) : null),
    [id, ready, location?.lat, location?.lng],
  );

  if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
    return (
      <div className="section py-16">
        <EmptyState
          icon={UserX}
          title="We couldn’t find this farmer"
          description="The profile may have been removed or the link is incorrect."
          action={
            <Button asChild>
              <Link href="/farmers">See farmers near you</Link>
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
        <Skeleton className="aspect-[16/10]" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }
  return <FarmerProfileView data={data} />;
}
