'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/features/auth/AuthProvider';
import { applyServerErrors } from '@/features/auth/applyServerErrors';
import { userService } from '@/services/farmer.service';
import { normalizePhone } from '@/features/auth/schemas';

const schema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  phone: z
    .string()
    .trim()
    .refine((v) => /^[6-9]\d{9}$/.test(normalizePhone(v)), 'Enter a valid 10-digit mobile number'),
  email: z.string().trim().email('Enter a valid email').or(z.literal('')),
});
type Values = z.infer<typeof schema>;

/** Name, mobile and email: shared by the customer account and the farmer and partner dashboards. */
export function AccountDetailsForm() {
  const { user, updateUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '' } });

  const onSubmit = async (v: Values) => {
    setFormError(null);
    setSaved(false);
    try {
      const { user: updated } = await userService.updateMe({ ...v, phone: normalizePhone(v.phone) });
      updateUser(updated);
      reset({ name: updated.name, phone: updated.phone ?? '', email: updated.email ?? '' });
      setSaved(true);
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['name', 'phone', 'email']));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {formError && <Alert>{formError}</Alert>}
      {saved && !isDirty && <Alert tone="success">Account details saved.</Alert>}
      <FormField id="name" label="Full name" error={errors.name?.message}>
        <Input id="name" autoComplete="name" invalid={!!errors.name} {...register('name')} />
      </FormField>
      <FormField id="phone" label="Mobile number" error={errors.phone?.message} hint="You log in with this number.">
        <div className="flex">
          <span className="flex items-center border border-r-0 border-line bg-cream px-3 text-sm text-soil-muted">+91</span>
          <Input id="phone" type="tel" inputMode="numeric" maxLength={17} invalid={!!errors.phone} {...register('phone')} />
        </div>
      </FormField>
      <FormField id="email" label="Email (optional)" error={errors.email?.message} hint="You can also log in with it, and we send password-reset links here.">
        <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" invalid={!!errors.email} {...register('email')} />
      </FormField>
      <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
        Save changes
      </Button>
    </form>
  );
}
