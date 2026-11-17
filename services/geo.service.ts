import { api } from '@/lib/api';
import type { GeoPlace } from '@/types';

export const geoService = {
  search: (q: string, signal?: AbortSignal) => api<{ places: GeoPlace[] }>('/geo/search', { query: { q }, signal }),
  reverse: (lat: number, lng: number) => api<{ place: GeoPlace | null }>('/geo/reverse', { query: { lat, lng } }),
};

/** Browser GPS as a promise. Rejects with a human-readable message. */
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Your browser does not support location.'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) =>
        reject(
          new Error(
            err.code === err.PERMISSION_DENIED
              ? 'Location permission was denied. You can search or tap the map instead.'
              : 'Could not get your location. Try again or tap the map.',
          ),
        ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}
