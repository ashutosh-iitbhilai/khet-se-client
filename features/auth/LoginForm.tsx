'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Alert } from '@/components/ui/alert';
import { homeForRole, useAuth } from './AuthProvider';
import { loginSchema, type LoginValues } from './schemas';
import { applyServerErrors } from './applyServerErrors';
import { GoogleButton, SIGN_IN_ERRORS } from './GoogleButton';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');
  const errorCode = params.get('error');
  const [formError, setFormError] = useState<string | null>(errorCode ? (SIGN_IN_ERRORS[errorCode] ?? SIGN_IN_ERRORS.google_failed!) : null);
  const reset = params.get('reset') === '1';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { identifier: '', password: '' } });

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      const user = await login(values);
      // Only follow same-site relative redirects.
      router.push(next?.startsWith('/') && !next.startsWith('//') ? next : homeForRole(user.role));
      router.refresh();
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['identifier', 'password']));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm text-soil-muted">Log in to order fresh produce or manage your farm.</p>

      <GoogleButton next={next} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        {reset && !formError && <Alert tone="success">Your password has been changed. Log in with the new one.</Alert>}
        {formError && <Alert>{formError}</Alert>}

        <FormField id="identifier" label="Mobile number or email" error={errors.identifier?.message}>
          <Input
            id="identifier"
            type="text"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="98765 43210 or you@example.com"
            invalid={!!errors.identifier}
            aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            {...register('identifier')}
          />
        </FormField>

        <FormField id="password" label="Password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </FormField>
        <div className="-mt-3 text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-leaf hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-soil-muted">
        New to Khet Se?{' '}
        <Link href="/register" className="font-semibold text-leaf hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
