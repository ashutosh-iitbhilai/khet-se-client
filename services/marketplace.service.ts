import { apiUrl } from '@/lib/config';
import { api, ApiError, type QueryParams } from '@/lib/api';
import type { FarmerProfile, GeoPageMeta, ListingDetail, NearbyFarm, NearbyListing } from '@/types';

export interface GeoPage<T> {
  items: T[];
  meta: GeoPageMeta;
}

/** Geo list endpoints return `{ data, meta }` with radius information in meta. */
async function geoPage<T>(path: string, query: QueryParams, signal?: AbortSignal): Promise<GeoPage<T>> {
  const url = apiUrl(path);
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  let res: Response;
  try {
    res = await fetch(url, { credentials: 'include', headers: { Accept: 'application/json' }, signal });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach Khet Se right now. Check your connection and try again.');
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new ApiError(res.status, json?.error?.code ?? 'UNKNOWN', json?.error?.message ?? 'Request failed', json?.error?.details);
  }
  return { items: json.data as T[], meta: json.meta as GeoPageMeta };
}

export interface FarmQuery extends QueryParams {
  lng: number;
  lat: number;
  radiusKm?: number;
  type?: 'fresh' | 'dry';
  category?: string;
  maxPrice?: number;
  organic?: boolean;
  sort?: 'recommended' | 'distance' | 'rating';
  page?: number;
  limit?: number;
}

export interface ListingQuery extends QueryParams {
  lng: number;
  lat: number;
  radiusKm?: number;
  type?: 'fresh' | 'dry';
  category?: string;
  q?: string;
  product?: string;
  farm?: string;
  maxPrice?: number;
  organic?: boolean;
  sort?: 'recommended' | 'distance' | 'price_asc' | 'price_desc' | 'freshness';
  page?: number;
  limit?: number;
}

export const marketplaceService = {
  nearbyFarms: (q: FarmQuery, signal?: AbortSignal) => geoPage<NearbyFarm>('/farmers/nearby', q, signal),
  recommendedFarms: (q: FarmQuery, signal?: AbortSignal) => geoPage<NearbyFarm>('/recommendations/farmers', q, signal),
  listings: (q: ListingQuery, signal?: AbortSignal) => geoPage<NearbyListing>('/inventory', q, signal),
  recommendedListings: (q: ListingQuery, signal?: AbortSignal) => geoPage<NearbyListing>('/recommendations/products', q, signal),
  listing: (id: string, at?: { lng: number; lat: number }) => api<{ item: ListingDetail }>(`/inventory/${id}`, { query: at }),
  farmerProfile: (id: string, at?: { lng: number; lat: number }) => api<FarmerProfile>(`/farmers/${id}`, { query: at }),
};
