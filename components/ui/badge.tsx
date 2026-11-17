import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const tones = {
  green: 'bg-sprout text-leaf-dark border-leaf/20',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  red: 'bg-red-50 text-danger border-red-200',
  neutral: 'bg-cream text-soil-muted border-line',
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = 'neutral', className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', tones[tone], className)}>
      {children}
    </span>
  );
}
