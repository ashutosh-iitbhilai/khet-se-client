'use client';

import { Check, ChevronDown, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Single-select row of square chips. */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    // Phones: one swipeable row instead of many wrapped lines; wider screens wrap.
    <div
      role="radiogroup"
      aria-label={label}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'shrink-0 whitespace-nowrap border px-3.5 py-2 text-sm transition-colors',
              active ? 'border-leaf bg-leaf text-white' : 'border-line bg-white text-soil hover:border-leaf/60',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Compact labelled native select, styled as a square pill. */
export function PillSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label htmlFor={id} className="relative inline-flex items-center border border-line bg-white text-sm hover:border-leaf/60">
      <span className="pl-3 text-soil-muted">{label}:</span>
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-10 cursor-pointer appearance-none bg-transparent pl-1.5 pr-8 font-medium text-soil focus-visible:ring-0 focus-visible:ring-offset-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-soil-muted" aria-hidden />
    </label>
  );
}

/** On/off filter chip, e.g. "Organic verified only". */
export function ToggleChip({ pressed, onChange, children }: { pressed: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onChange(!pressed)}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 border px-3.5 text-sm transition-colors',
        pressed ? 'border-leaf bg-sprout font-medium text-leaf-dark' : 'border-line bg-white text-soil hover:border-leaf/60',
      )}
    >
      {pressed && <Check className="h-4 w-4" aria-hidden />}
      {children}
    </button>
  );
}

export function ClearFilters({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-10 items-center gap-1 px-2 text-sm text-soil-muted hover:text-danger">
      <X className="h-4 w-4" aria-hidden /> Clear filters
    </button>
  );
}

export const DISTANCE_OPTIONS = [
  { value: 'auto', label: 'Best match' },
  { value: '3', label: 'Within 3 km' },
  { value: '5', label: 'Within 5 km' },
  { value: '10', label: 'Within 10 km' },
  { value: '15', label: 'Within 15 km' },
  { value: '25', label: 'Within 25 km' },
];

export const PRICE_OPTIONS = [
  { value: 'any', label: 'Any price' },
  { value: '25', label: 'Up to ₹25' },
  { value: '50', label: 'Up to ₹50' },
  { value: '100', label: 'Up to ₹100' },
  { value: '200', label: 'Up to ₹200' },
];
