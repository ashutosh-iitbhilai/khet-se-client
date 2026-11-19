import type { BadgeTone } from '@/components/ui/badge';
import type { JobStatus, Vehicle } from '@/types';

export const VEHICLE_LABEL: Record<Vehicle, string> = {
  bicycle: 'Bicycle',
  bike: 'Motorbike',
  scooter: 'Scooter',
  auto: 'Auto rickshaw',
  van: 'Van',
};

export const JOB_STATUS: Record<JobStatus, { label: string; tone: BadgeTone }> = {
  scheduled: { label: 'Scheduled', tone: 'neutral' },
  requested: { label: 'Open', tone: 'neutral' },
  assigned: { label: 'Go to pickup', tone: 'amber' },
  out_for_delivery: { label: 'On the way', tone: 'amber' },
  delivered: { label: 'Delivered', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'red' },
};

/** OpenStreetMap directions to a point (from the device's location when the map app asks). */
export const directionsTo = (p: { lng: number; lat: number }) =>
  `https://www.openstreetmap.org/directions?route=;${p.lat},${p.lng}#map=15/${p.lat}/${p.lng}`;
