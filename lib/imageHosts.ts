/** Hosts configured in next.config.ts `images.remotePatterns` (kept in sync by a unit test). */
export const OPTIMIZED_HOSTS = ['images.unsplash.com', 'res.cloudinary.com', 'upload.wikimedia.org'] as const;

/**
 * Whether next/image may optimise this source. Local paths and configured hosts can;
 * farmer-pasted links from anywhere else are shown unoptimised instead of erroring.
 */
export function canOptimize(src: unknown): boolean {
  if (typeof src !== 'string') return true; // static import
  if (src.startsWith('/')) return true;
  try {
    return (OPTIMIZED_HOSTS as readonly string[]).includes(new URL(src).hostname);
  } catch {
    return false;
  }
}
