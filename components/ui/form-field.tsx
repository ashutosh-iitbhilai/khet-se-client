import type { ReactNode } from 'react';
import { Label } from './label';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Label + control + hint/error, with ids wired for screen readers. */
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-soil-muted">{hint}</p>
      ) : null}
    </div>
  );
}
