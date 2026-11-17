import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      'flex min-h-[96px] w-full border border-line bg-white px-3.5 py-2.5 text-sm text-soil placeholder:text-soil-muted/70',
      'focus-visible:border-leaf focus-visible:ring-1 focus-visible:ring-leaf focus-visible:ring-offset-0',
      invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
