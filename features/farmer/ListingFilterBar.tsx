'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PageMeta } from '@/lib/api';
import { STATUS_FILTERS, type StatusFilter } from './useListingFilters';

export function StatusTabs({ value, onChange }: { value: StatusFilter; onChange: (v: StatusFilter) => void }) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line" role="tablist">
      {STATUS_FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          role="tab"
          aria-selected={value === f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            '-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm',
            value === f.value ? 'border-leaf font-semibold text-leaf-dark' : 'border-transparent text-soil-muted hover:text-soil',
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function Pager({ meta, onPage }: { meta?: PageMeta; onPage: (p: number) => void }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-between text-sm text-soil-muted">
      <span>
        Page {meta.page} of {meta.totalPages} · {meta.total} products
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} aria-label="Previous page">
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)} aria-label="Next page">
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
