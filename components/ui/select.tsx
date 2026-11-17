import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

/** Native select (best on low-end phones), styled to match inputs. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, invalid, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-11 w-full appearance-none border border-line bg-white pl-3.5 pr-9 text-sm text-soil',
        'focus-visible:border-leaf focus-visible:ring-1 focus-visible:ring-leaf focus-visible:ring-offset-0',
        invalid && 'border-danger',
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-muted" aria-hidden />
  </div>
));
Select.displayName = 'Select';
