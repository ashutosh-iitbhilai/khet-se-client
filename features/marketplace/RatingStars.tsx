import { Star } from 'lucide-react';

/** Compact "★ 4.7 (40)". Unrated farmers say "New" instead of showing a misleading 0. */
export function Rating({ avg, count }: { avg: number; count: number }) {
  if (!count) {
    return <span className="text-xs font-medium text-soil-muted">New on Khet Se</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs" aria-label={`Rated ${avg.toFixed(1)} out of 5 from ${count} ratings`}>
      <Star className="h-3.5 w-3.5 fill-turmeric text-turmeric" aria-hidden />
      <span className="font-semibold text-soil">{avg.toFixed(1)}</span>
      <span className="text-soil-muted">({count})</span>
    </span>
  );
}
