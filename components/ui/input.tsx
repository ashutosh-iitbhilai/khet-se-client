import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, invalid, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      'flex h-11 w-full border border-line bg-white px-3.5 text-sm text-soil placeholder:text-soil-muted/70',
      'transition-colors focus-visible:border-leaf focus-visible:ring-1 focus-visible:ring-leaf focus-visible:ring-offset-0',
      'disabled:cursor-not-allowed disabled:bg-cream disabled:opacity-60',
      invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
