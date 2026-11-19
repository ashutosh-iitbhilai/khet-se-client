'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api';
import { authService } from '@/services/auth.service';
import { useAuth } from './AuthProvider';
import { applyServerErrors } from './applyServerErrors';
import { resetPasswordSchema, type ResetPasswordValues } from './schemas';

export function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';
  const router = useRouter();
  const { updateUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [linkDead, setLinkDead] = useState(token.length < 20);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: '', confirm: '' } });

  const onSubmit = async ({ password }: ResetPasswordValues) => {
    setFormError(null);
    try {
      await authService.resetPassword(token, password);
      // Every session was ended on the server, this one included.
      updateUser(null);
      router.replace('/login?reset=1');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'INVALID_RESET_TOKEN') setLinkDead(true);
      else setFormError(applyServerErrors(err, setError, ['password']));
    }
  };

  if (linkDead) {
    return (
      <div>
        <h1 className="text-3xl font-semibold">This link has expired</h1>
        <p className="mt-3 text-sm text-soil-muted">
          Reset links work once and only for 30 minutes. Request a new one and use the latest email we send.
        </p>
        <Button asChild className="mt-8">
          <Link href="/forgot-password">Send a new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Choose a new password</h1>
      <p className="mt-2 text-sm text-soil-muted">You’ll be signed out on all devices and can log in with the new password.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <FormField id="password" label="New password" error={errors.password?.message} hint="At least 8 characters with a letter and a number.">
          <Input id="password" type="password" autoComplete="new-password" invalid={!!errors.password} {...register('password')} />
        </FormField>
        <FormField id="confirm" label="Confirm new password" error={errors.confirm?.message}>
          <Input id="confirm" type="password" autoComplete="new-password" invalid={!!errors.confirm} {...register('confirm')} />
        </FormField>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Save new password
        </Button>
      </form>
    </div>
  );
}
