'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Crosshair, Loader2, MapPin } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/states';
import { geoService, getCurrentPosition } from '@/services/geo.service';
import { PlaceSearch } from './PlaceSearch';
import type { CustomerLocation } from './LocationProvider';
import type { GeoPlace } from '@/types';

const MapPicker = dynamic(() => import('@/components/map/MapPicker'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

/** "Shankar Nagar, Raipur" from a geocoder result. */
export function shortLabel(place: GeoPlace | null, fallback: { lat: number; lng: number }) {
  if (place) {
    const first = place.village ?? place.line1?.split(',')[0] ?? place.label.split(',')[0]?.trim();
    const parts = [first, place.city ?? place.district].filter(Boolean);
    if (parts.length) return [...new Set(parts)].join(', ');
    return place.label.split(',').slice(0, 2).join(',').trim();
  }
  return `${fallback.lat.toFixed(4)}, ${fallback.lng.toFixed(4)}`;
}

interface Props {
  open: boolean;
  initial: CustomerLocation | null;
  onClose: () => void;
  onConfirm: (l: CustomerLocation) => void;
}

export function LocationDialog({ open, initial, onClose, onConfirm }: Props) {
  const [draft, setDraft] = useState<CustomerLocation | null>(initial);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset to the saved location each time the dialog opens.
  useEffect(() => {
    if (open) {
      setDraft(initial);
      setError(null);
    }
  }, [open, initial]);

  /** Sets the pin immediately, then fills in a readable label in the background. */
  const setPoint = async (lat: number, lng: number, source: CustomerLocation['source']) => {
    setDraft({ lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, source });
    setResolving(true);
    try {
      const { place } = await geoService.reverse(lat, lng);
      setDraft((d) => (d && d.lat === lat && d.lng === lng ? { ...d, label: shortLabel(place, { lat, lng }) } : d));
    } catch {
      /* keep the coordinate label */
    } finally {
      setResolving(false);
    }
  };

  const useGps = async () => {
    setError(null);
    setLocating(true);
    try {
      const p = await getCurrentPosition();
      await setPoint(p.lat, p.lng, 'gps');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLocating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Where should we deliver?"
      description="We’ll show farms whose delivery area reaches you."
    >
      <div className="space-y-4">
        <Button type="button" variant="outline" className="w-full" onClick={useGps} disabled={locating}>
          {locating ? <Loader2 className="animate-spin" /> : <Crosshair />}
          Use my current location
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-soil-muted">
          <span className="h-px flex-1 bg-line" /> or search <span className="h-px flex-1 bg-line" />
        </div>

        <PlaceSearch
          onSelect={(p) => setDraft({ lat: p.lat, lng: p.lng, label: shortLabel(p, p), source: 'search' })}
        />

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div className="h-56 border border-line">
          {open && <MapPicker value={draft} onChange={(p) => setPoint(p.lat, p.lng, 'map')} />}
        </div>
        <p className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf" aria-hidden />
          {draft ? (
            <span>
              <strong>{draft.label}</strong>
              {resolving && <span className="text-soil-muted"> · finding address…</span>}
              <span className="block text-xs text-soil-muted">Tap the map or drag the pin to adjust.</span>
            </span>
          ) : (
            <span className="text-soil-muted">Choose a location above or tap the map.</span>
          )}
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!draft} onClick={() => draft && onConfirm(draft)}>
            Deliver here
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
