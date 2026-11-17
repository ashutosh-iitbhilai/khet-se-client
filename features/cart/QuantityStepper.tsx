'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UNIT_LABELS } from '@/lib/labels';
import type { Unit } from '@/types';

interface Props {
  value: number;
  unit: Unit;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  size?: 'sm' | 'lg';
  label: string;
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ''));

/** Square −/＋ control. Going below the minimum removes the item (bin icon makes that clear). */
export function QuantityStepper({ value, unit, step, min, max, onChange, size = 'sm', label }: Props) {
  const atMin = value - step < min - 1e-9;
  const atMax = value + step > max + 1e-9;
  const h = size === 'lg' ? 'h-12' : 'h-9';
  const w = size === 'lg' ? 'w-12' : 'w-9';

  return (
    <div className={cn('inline-flex items-stretch border border-leaf', h)} role="group" aria-label={`Quantity of ${label}`}>
      <button
        type="button"
        onClick={() => onChange(atMin ? 0 : value - step)}
        className={cn('flex items-center justify-center text-leaf hover:bg-sprout', w)}
        aria-label={atMin ? `Remove ${label} from cart` : `Decrease ${label}`}
      >
        {atMin ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
      </button>
      <span className={cn('flex min-w-[64px] items-center justify-center border-x border-leaf bg-sprout px-2 text-sm font-semibold text-leaf-dark', size === 'lg' && 'min-w-[96px] text-base')} aria-live="polite">
        {fmt(value)} {UNIT_LABELS[unit]}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={atMax}
        className={cn('flex items-center justify-center text-leaf hover:bg-sprout disabled:cursor-not-allowed disabled:opacity-40', w)}
        aria-label={`Increase ${label}`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
