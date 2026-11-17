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

const schema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  phone: z.string().trim().regex(/^([6-9]\d{9})?$/, 'Enter a valid 10-digit mobile number'),
});
type Values = z.infer<typeof schema>;

/** Name / mobile form shared by the customer account and the farmer dashboard. */
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
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' } });

  const onSubmit = async (v: Values) => {
    setFormError(null);
    setSaved(false);
    try {
      const { user: updated } = await userService.updateMe(v);
      updateUser(updated);
      reset({ name: updated.name, phone: updated.phone ?? '' });
      setSaved(true);
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['name', 'phone']));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {formError && <Alert>{formError}</Alert>}
      {saved && !isDirty && <Alert tone="success">Account details saved.</Alert>}
      <FormField id="email" label="Email" hint="Contact support to change your login email.">
        <Input id="email" value={user?.email ?? ''} disabled readOnly />
      </FormField>
      <FormField id="name" label="Full name" error={errors.name?.message}>
        <Input id="name" autoComplete="name" invalid={!!errors.name} {...register('name')} />
      </FormField>
      <FormField id="phone" label="Mobile number" error={errors.phone?.message}>
        <div className="flex">
          <span className="flex items-center border border-r-0 border-line bg-cream px-3 text-sm text-soil-muted">+91</span>
          <Input id="phone" type="tel" inputMode="numeric" maxLength={10} invalid={!!errors.phone} {...register('phone')} />
        </div>
      </FormField>
      <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
        Save changes
      </Button>
    </form>
  );
}
