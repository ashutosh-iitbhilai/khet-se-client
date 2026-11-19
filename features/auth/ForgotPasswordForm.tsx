'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import { applyServerErrors } from './applyServerErrors';
import { forgotPasswordSchema, type ForgotPasswordValues } from './schemas';

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { identifier: '' } });

  const onSubmit = async ({ identifier }: ForgotPasswordValues) => {
    setFormError(null);
    try {
      await authService.forgotPassword(identifier);
      setSentTo(identifier.trim());
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['identifier']));
    }
  };

  if (sentTo) {
    return (
      <div>
        <MailCheck className="h-10 w-10 text-leaf" aria-hidden />
        <h1 className="mt-4 text-3xl font-semibold">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-soil-muted">
          If <strong className="text-soil">{sentTo}</strong> belongs to a Khet Se account with an email address, we’ve emailed a link to
          choose a new password. The link works once and expires in 30 minutes.
        </p>
        <p className="mt-3 text-sm text-soil-muted">
          Nothing arrived after a few minutes? Check spam, or try again. Signed up with only a mobile number? Add an email in your
          account settings once you are back in, or contact support.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setSentTo(null)}>
            Try again
          </Button>
          <Button asChild>
            <Link href="/login">Back to log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-soil-muted hover:text-leaf">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to log in
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">Forgot your password?</h1>
      <p className="mt-2 text-sm text-soil-muted">Enter your mobile number or email. We’ll email a reset link to the address on your account.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <FormField id="identifier" label="Mobile number or email" error={errors.identifier?.message}>
          <Input
            id="identifier"
            type="text"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            placeholder="98765 43210 or you@example.com"
            invalid={!!errors.identifier}
            {...register('identifier')}
          />
        </FormField>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>
    </div>
  );
}
