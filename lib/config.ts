export const APP_NAME = 'Khet Se';
export const APP_TAGLINE = 'Fresh from Local Farms to Your Home.';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');

/**
 * API base for server-side fetches (server components). Inside Docker/Kubernetes the public
 * URL may not be reachable from the web container, so it can be overridden with an internal one.
 */
export const SERVER_API_URL = (process.env.API_INTERNAL_URL ?? API_URL).replace(/\/$/, '');
