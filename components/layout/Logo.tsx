import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Square leaf mark + wordmark. */
export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn('inline-flex items-center gap-2.5', className)} aria-label="Khet Se home">
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center',
          inverted ? 'bg-white text-leaf' : 'bg-leaf text-white',
        )}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" strokeLinejoin="miter" />
          <path d="M5 19 13 11" />
        </svg>
      </span>
      <span className={cn('font-display text-xl font-semibold tracking-tight', inverted ? 'text-white' : 'text-soil')}>
        Khet Se
      </span>
    </Link>
  );
}
