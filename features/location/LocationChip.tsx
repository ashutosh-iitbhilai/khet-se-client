'use client';

import { ChevronDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomerLocation } from './LocationProvider';

/** Navbar button showing the current delivery location; opens the picker. */
export function LocationChip({ className }: { className?: string }) {
  const { location, ready, openPicker } = useCustomerLocation();

  return (
    <button
      type="button"
      onClick={openPicker}
      className={cn(
        'inline-flex max-w-[220px] items-center gap-1.5 border border-line px-3 py-1.5 text-left text-xs hover:border-leaf',
        className,
      )}
      aria-label={location ? `Delivery location: ${location.label}. Change` : 'Set delivery location'}
    >
      <MapPin className="h-3.5 w-3.5 shrink-0 text-leaf" aria-hidden />
      {!ready ? (
        <span className="h-3 w-24 animate-pulse bg-sand" />
      ) : location ? (
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-wide text-soil-muted">Deliver to</span>
          <span className="block truncate font-semibold text-soil">{location.label}</span>
        </span>
      ) : (
        <span className="text-soil-muted">Set delivery location</span>
      )}
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-soil-muted" aria-hidden />
    </button>
  );
}
