'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/features/farmer/FarmerShell';
import { ListingForm } from '@/features/farmer/ListingForm';
import { useFetch } from '@/hooks/useFetch';
import { farmerService, inventoryService } from '@/services/farmer.service';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, error, loading, reload } = useFetch(async () => {
    const [{ item }, me] = await Promise.all([inventoryService.get(id), farmerService.me()]);
    return { item, farms: me.farms };
  }, [id]);

  return (
    <>
      <Link href="/farmer/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-soil-muted hover:text-leaf">
        <ArrowLeft className="h-4 w-4" /> My products
      </Link>
      <PageHeader title={data ? `Edit ${data.item.productName}` : 'Edit product'} />

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Skeleton className="h-[480px]" />}
      {data && (
        <div className="border border-line bg-white p-6 sm:p-8">
          <ListingForm
            product={data.item.product}
            farms={data.farms}
            item={data.item}
            onSaved={() => router.push('/farmer/products?saved=1')}
            onCancel={() => router.push('/farmer/products')}
          />
        </div>
      )}
    </>
  );
}
