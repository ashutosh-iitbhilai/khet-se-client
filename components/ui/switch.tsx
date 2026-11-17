'use client';

import { cn } from '@/lib/utils';

interface SwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

/** Square toggle with label — large touch target. */
export function Switch({ id, checked, onChange, label, description }: SwitchProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4 border border-line p-4 hover:border-leaf/50">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-soil-muted">{description}</span>}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 border transition-colors', checked ? 'border-leaf bg-leaf' : 'border-line bg-sand')}
      >
        <span
          className={cn('absolute top-0.5 h-[18px] w-[18px] bg-white shadow-sm transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')}
        />
      </button>
    </label>
  );
}
