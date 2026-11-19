import { QueryClient, type QueryKey } from '@tanstack/react-query';
import { ApiError } from './api';

/**
 * Areas of cached data. Every query key starts with one of these, so a change in one place
 * can refresh every screen that shows related data.
 */
export type Area = 'me' | 'orders' | 'farmer' | 'inventory' | 'delivery' | 'market' | 'addresses' | 'catalogue' | 'config' | 'admin';

/** Which areas a successful change to an API path can affect. */
export function areasChangedBy(path: string): Area[] {
  // Admin decisions (verification, suspensions, cancellations, refunds) can affect every view.
  if (path.startsWith('/admin')) return ['admin', 'orders', 'farmer', 'delivery', 'inventory', 'market'];
  if (path.startsWith('/orders') || path.startsWith('/payments')) return ['orders', 'farmer', 'delivery', 'inventory', 'market', 'admin'];
  if (path.startsWith('/delivery')) return ['delivery', 'orders', 'farmer', 'admin'];
  if (path.startsWith('/inventory')) return ['inventory', 'farmer', 'market', 'admin'];
  if (path.startsWith('/farms') || path.startsWith('/farmers')) return ['farmer', 'market', 'admin'];
  if (path.startsWith('/addresses')) return ['addresses'];
  if (path.startsWith('/users')) return ['me'];
  return [];
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Shown instantly when revisited, then refreshed in the background.
        staleTime: 15_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        // Retry network hiccups and server errors, never "not found" / "not allowed" / validation.
        retry: (count, err) => count < 2 && !(err instanceof ApiError && err.status >= 400 && err.status < 500),
      },
    },
  });
}

export const keyOf = (area: Area, ...rest: unknown[]): QueryKey => [area, ...rest];
