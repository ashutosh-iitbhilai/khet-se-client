import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-sand/70', className)} aria-hidden />;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center border border-dashed border-line bg-cream/60 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center bg-sprout text-leaf">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-4 font-sans text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-soil-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center border border-red-200 bg-red-50/60 px-6 py-10 text-center">
      <AlertTriangle className="h-6 w-6 text-danger" aria-hidden />
      <p className="mt-3 text-sm font-medium text-soil">{error.message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCw /> Try again
        </Button>
      )}
    </div>
  );
}
