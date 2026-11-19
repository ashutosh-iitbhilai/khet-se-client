'use client';

import { useEffect, useState } from 'react';
import { Crosshair, MapPin } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/components/layout/DashboardShell';
import { VEHICLE_LABEL } from '@/features/delivery/labels';
import { PlaceSearch } from '@/features/location/PlaceSearch';
import { useFetch } from '@/hooks/useFetch';
import { cn } from '@/lib/utils';
import { deliveryService } from '@/services/delivery.service';
import { VEHICLES, type Vehicle } from '@/types';

const RADII = [3, 5, 10, 15, 20, 30];

export default function WorkAreaPage() {
  const { data, error, loading, reload } = useFetch(['delivery', 'profile'], () => deliveryService.profile());
  const [vehicle, setVehicle] = useState<Vehicle>('bike');
  const [radius, setRadius] = useState(10);
  const [base, setBase] = useState<{ lng: number; lat: number; label: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!data) return;
    setVehicle(data.profile.vehicle);
    setRadius(data.profile.serviceRadiusKm);
    setBase(data.profile.base);
  }, [data]);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) return <Skeleton className="h-96" />;

  const useGps = () => {
    if (!navigator.geolocation) return setMessage({ tone: 'error', text: 'This device cannot share its location. Search for your area instead.' });
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBase({ lng: pos.coords.longitude, lat: pos.coords.latitude, label: 'My current location' });
        setLocating(false);
      },
      () => {
        setMessage({ tone: 'error', text: 'Could not get your location. Search for your area instead.' });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const save = async () => {
    setMessage(null);
    setSaving(true);
    try {
      await deliveryService.updateProfile({ vehicle, serviceRadiusKm: radius, ...(base ? { base } : {}) });
      setMessage({ tone: 'success', text: 'Saved. You’ll see deliveries from farms in this area.' });
    } catch (err) {
      setMessage({ tone: 'error', text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Work area & vehicle" description="We show you deliveries whose farm is within your work area." />
      <div className="max-w-2xl space-y-6">
        <section className="border border-line bg-white p-6">
          <h2 className="font-sans text-base font-semibold">Base location</h2>
          <p className="mt-1 text-sm text-soil-muted">Where you usually start from: your home or a market you wait near.</p>
          {base && (
            <p className="mt-4 flex items-center gap-2 border border-leaf bg-sprout px-3 py-2 text-sm">
              <MapPin className="h-4 w-4 text-leaf" aria-hidden /> {base.label || `${base.lat.toFixed(4)}, ${base.lng.toFixed(4)}`}
            </p>
          )}
          <div className="mt-4 space-y-3">
            <PlaceSearch onSelect={(p) => setBase({ lng: p.lng, lat: p.lat, label: p.label.split(',').slice(0, 2).join(',') })} />
            <Button variant="outline" onClick={useGps} loading={locating}>
              <Crosshair /> Use my current location
            </Button>
          </div>
        </section>

        <section className="border border-line bg-white p-6">
          <h2 className="font-sans text-base font-semibold">How far will you go for a pickup?</h2>
          <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Work area radius">
            {RADII.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={radius === r}
                onClick={() => setRadius(r)}
                className={cn('border px-4 py-2 text-sm font-medium', radius === r ? 'border-leaf bg-leaf text-white' : 'border-line bg-white hover:border-leaf')}
              >
                {r} km
              </button>
            ))}
          </div>
        </section>

        <section className="border border-line bg-white p-6">
          <h2 className="font-sans text-base font-semibold">Vehicle</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Vehicle">
            {VEHICLES.map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={vehicle === v}
                onClick={() => setVehicle(v)}
                className={cn('border px-3 py-3 text-sm font-medium', vehicle === v ? 'border-leaf bg-sprout text-leaf-dark' : 'border-line bg-white hover:border-leaf')}
              >
                {VEHICLE_LABEL[v]}
              </button>
            ))}
          </div>
        </section>

        {message && <Alert tone={message.tone}>{message.text}</Alert>}
        <Button size="lg" onClick={save} loading={saving} disabled={!base}>
          Save work area
        </Button>
      </div>
    </>
  );
}
