'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingBasket, Tractor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { homeForRole, useAuth } from './AuthProvider';
import { registerSchema, type RegisterValues } from './schemas';
import { applyServerErrors } from './applyServerErrors';

const ROLE_OPTIONS = [
  { value: 'customer', label: 'I want to buy', hint: 'Fresh produce delivered', icon: ShoppingBasket },
  { value: 'farmer', label: 'I am a farmer', hint: 'Sell my harvest', icon: Tractor },
] as const;

export function RegisterForm() {
  const { register: signUp } = useAuth();
  const router = useRouter();
  const initialRole = useSearchParams().get('role') === 'farmer' ? 'farmer' : 'customer';
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: initialRole, name: '', email: '', phone: '', password: '' },
  });
  const role = watch('role');

  const onSubmit = async (values: RegisterValues) => {
    setFormError(null);
    try {
      const user = await signUp({ ...values, phone: values.phone || undefined });
      router.push(homeForRole(user.role));
      router.refresh();
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['name', 'email', 'phone', 'password', 'role']));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold">Create your account</h1>
      <p className="mt-2 text-sm text-soil-muted">Join Khet Se — it takes less than a minute.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        {formError && <Alert>{formError}</Alert>}

        <fieldset>
          <legend className="mb-2 text-sm font-medium">How will you use Khet Se?</legend>
          <div className="grid grid-cols-2 gap-3" role="radiogroup">
            {ROLE_OPTIONS.map(({ value, label, hint, icon: Icon }) => {
              const active = role === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setValue('role', value, { shouldValidate: true })}
                  className={cn(
                    'flex flex-col items-start gap-2 border p-4 text-left transition-colors',
                    active ? 'border-leaf bg-sprout' : 'border-line hover:border-leaf/60',
                  )}
                >
                  <Icon className={cn('h-5 w-5', active ? 'text-leaf' : 'text-soil-muted')} aria-hidden />
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs text-soil-muted">{hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <FormField id="name" label={role === 'farmer' ? 'Your full name' : 'Full name'} error={errors.name?.message}>
          <Input id="name" autoComplete="name" invalid={!!errors.name} {...register('name')} />
        </FormField>

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField
          id="phone"
          label="Mobile number"
          error={errors.phone?.message}
          hint={role === 'farmer' ? 'Customers and our team will reach you on this number.' : 'Optional — for delivery updates.'}
        >
          <div className="flex">
            <span className="flex items-center border border-r-0 border-line bg-cream px-3 text-sm text-soil-muted">
              +91
            </span>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel-national"
              invalid={!!errors.phone}
              {...register('phone')}
            />
          </div>
        </FormField>

        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
          hint="At least 8 characters with a letter and a number."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            invalid={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {role === 'farmer' ? 'Create farmer account' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-soil-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-leaf hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
