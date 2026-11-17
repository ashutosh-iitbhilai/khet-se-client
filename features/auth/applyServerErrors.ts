import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/lib/api';

/**
 * Maps API validation details onto form fields.
 * Returns a message for the form-level alert (or null if everything was mapped).
 */
export function applyServerErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
): string | null {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.';
  let unmapped = false;
  for (const d of err.details ?? []) {
    if (fields.includes(d.field)) setError(d.field as Path<T>, { message: d.message });
    else unmapped = true;
  }
  return err.details?.length && !unmapped ? null : err.message;
}
