'use client';

import type { ReactNode } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/states';
import { useCustomerLocation, type CustomerLocation } from '@/features/location/LocationProvider';
import type { GeoPageMeta } from '@/types';

export function LocationPrompt({ message }: { message?: string }) {
  const { openPicker } = useCustomerLocation();
  return (
    <div className="flex flex-col items-start gap-5 border border-line bg-cream p-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-sprout text-leaf">
          <MapPin className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <h3 className="font-sans text-base font-semibold">Where should we deliver?</h3>
          <p className="mt-1 max-w-md text-sm text-soil-muted">
            {message ?? 'Set your location to see farmers whose fields are closest to you, and what they harvested this week.'}
          </p>
        </div>
      </div>
      <Button onClick={openPicker}>
        <MapPin /> Set my location
      </Button>
    </div>
  );
}

/** Explains when the engine had to look further than the default radius. */
export function RadiusNote({ meta, what = 'farms' }: { meta?: GeoPageMeta; what?: string }) {
  if (!meta?.expanded) return null;
  return (
    <p className="mb-6 border-l-4 border-turmeric bg-amber-50 px-4 py-2.5 text-sm text-soil">
      Not many {what} deliver right next to you yet, so we’re showing {what} up to <strong>{meta.radiusKm} km</strong> away.
    </p>
  );
}

/** Renders children with the customer's location, or a prompt to set one. */
export function LocationGate({ children, message }: { children: (loc: CustomerLocation) => ReactNode; message?: string }) {
  const { location, ready } = useCustomerLocation();
  if (!ready) return <Skeleton className="h-40" />;
  if (!location) return <LocationPrompt message={message} />;
  return <>{children(location)}</>;
}
