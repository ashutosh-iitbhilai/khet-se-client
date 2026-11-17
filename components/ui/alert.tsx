import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'success'; children: ReactNode }) {
  const Icon = tone === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 border-l-4 px-4 py-3 text-sm',
        tone === 'error' ? 'border-danger bg-red-50 text-danger' : 'border-leaf bg-sprout text-leaf-dark',
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
