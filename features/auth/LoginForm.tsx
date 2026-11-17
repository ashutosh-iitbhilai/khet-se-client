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

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get('next');
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      const user = await login(values);
      // Only follow same-site relative redirects.
      router.push(next?.startsWith('/') && !next.startsWith('//') ? next : homeForRole(user.role));
      router.refresh();
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['email', 'password']));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm text-soil-muted">Log in to order fresh produce or manage your farm.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        {formError && <Alert>{formError}</Alert>}

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
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
