export const APP_NAME = 'Khet Se';
export const APP_TAGLINE = 'Fresh from Local Farms to Your Home.';

/**
 * Where the browser calls the API. Either a full URL (http://localhost:5000/api in development)
 * or a path on this site ("/api") when the web server proxies the API (see API_PROXY_TARGET in
 * next.config.ts), which keeps one address and one open port in production.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');

/** Absolute URL for an API path, whether API_URL is a full URL or a path on this site. */
export const apiUrl = (path: string) => new URL(`${API_URL}${path}`, typeof window === 'undefined' ? 'http://localhost' : window.location.origin);

/**
 * API base for server-side fetches (server components). Inside Docker/Kubernetes the public
 * URL may not be reachable from the web container, so it can be overridden with an internal one.
 */
export const SERVER_API_URL = (process.env.API_INTERNAL_URL ?? API_URL).replace(/\/$/, '');
