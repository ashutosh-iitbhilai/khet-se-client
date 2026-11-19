'use client';

import { ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/features/farmer/FarmerShell';
import { ProfileForm } from '@/features/farmer/ProfileForm';
import { FarmForm } from '@/features/farmer/FarmForm';
import { useFetch } from '@/hooks/useFetch';
import { farmerService } from '@/services/farmer.service';

export default function FarmProfilePage() {
  const { data, error, loading, reload, setData } = useFetch(['farmer', 'me'], () => farmerService.me());
  // Most farmers have one farm; the API supports more for later.
  const farm = data?.farms[0];

  return (
    <>
      <PageHeader title="Farm profile" description="What customers see about you and where your produce comes from." />

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && (
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      )}

      {data && (
        <div className="space-y-8">
          <section id="farm" className="scroll-mt-24 border border-line bg-white p-6 sm:p-8">
            <h2 className="font-sans text-lg font-semibold">{farm ? 'Your farm' : 'Register your farm'}</h2>
            <p className="mb-6 mt-1 text-sm text-soil-muted">
              {farm
                ? 'Keep your location and delivery area accurate — it decides which customers see you.'
                : 'Pin your farm on the map so nearby customers can find your produce.'}
            </p>
            <FarmForm
              farm={farm}
              onSaved={(f) => setData((d) => ({ ...d!, farms: farm ? d!.farms.map((x) => (x.id === f.id ? f : x)) : [f] }))}
            />
          </section>

          <section id="about" className="scroll-mt-24 border border-line bg-white p-6 sm:p-8">
            <h2 className="font-sans text-lg font-semibold">About you</h2>
            <p className="mb-6 mt-1 text-sm text-soil-muted">A short introduction builds trust with customers.</p>
            <ProfileForm farmer={data.farmer} onSaved={(f) => setData((d) => ({ ...d!, farmer: f }))} />
          </section>
        </div>
      )}
    </>
  );
}
