import { API_URL } from './config';

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type QueryParams = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  method?: Method;
  body?: unknown;
  query?: QueryParams;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface Envelope {
  success: true;
  data: unknown;
  meta?: PageMeta;
}

/**
 * Sessions use a 15-minute access cookie plus a longer-lived refresh cookie. When a request
 * comes back 401 we try one refresh and replay the request. Concurrent 401s share a single
 * refresh call, so the refresh token is rotated once, not once per request.
 */
const NO_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
let refreshing: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include', headers: { Accept: 'application/json' } })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function request(path: string, opts: RequestOptions = {}, retried = false): Promise<Envelope> {
  const url = new URL(`${API_URL}${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...opts.headers,
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach Khet Se right now. Check your connection and try again.');
  }

  if (res.status === 401 && !retried && !NO_REFRESH.some((p) => path.startsWith(p)) && (await refreshSession())) {
    return request(path, opts, true);
  }

  if (res.status === 204) return { success: true, data: null };

  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload?.success) {
    const e = payload?.error;
    throw new ApiError(res.status, e?.code ?? 'UNKNOWN', e?.message ?? `Request failed (${res.status})`, e?.details);
  }
  return payload as Envelope;
}

/**
 * Thin, typed wrapper around fetch for the Khet Se REST API.
 * Sends the httpOnly auth cookie (credentials: 'include') and unwraps `{ success, data }`.
 */
export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  return (await request(path, opts)).data as T;
}

/** For list endpoints that return `{ data: T[], meta }`. */
export async function apiPage<T>(path: string, opts: RequestOptions = {}): Promise<Paginated<T>> {
  const payload = await request(path, opts);
  return { items: payload.data as T[], meta: payload.meta as PageMeta };
}
