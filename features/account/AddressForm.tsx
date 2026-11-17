'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCustomerLocation } from '@/features/location/LocationProvider';
import { ChipGroup } from '@/features/marketplace/Filters';
import { applyServerErrors } from '@/features/auth/applyServerErrors';
import { addressService } from '@/services/order.service';
import type { Address } from '@/types';

const schema = z.object({
  label: z.enum(['home', 'work', 'other']),
  name: z.string().trim().min(2, 'Enter the receiver’s name').max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  line1: z.string().trim().min(5, 'Enter house / flat number and street').max(200),
  landmark: z.string().trim().max(120),
  city: z.string().trim().min(2, 'Enter the city').max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a 6-digit PIN code'),
});
type Values = z.infer<typeof schema>;

/**
 * Saves a delivery address. The map pin comes from the delivery location the customer
 * chose (navbar / picker), so farm reach is checked against exactly that point.
 */
export function AddressForm({ address, onSaved, onCancel }: { address?: Address; onSaved: (a: Address) => void; onCancel?: () => void }) {
  const { user } = useAuth();
  const { location, openPicker } = useCustomerLocation();
  const [formError, setFormError] = useState<string | null>(null);
  const pin = address && !location ? { lng: address.location.coordinates[0], lat: address.location.coordinates[1], label: 'Saved pin' } : location;

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: address?.label ?? 'home',
      name: address?.name ?? user?.name ?? '',
      phone: address?.phone ?? user?.phone ?? '',
      line1: address?.line1 ?? '',
      landmark: address?.landmark ?? '',
      city: address?.city ?? location?.label.split(',').at(-1)?.trim() ?? '',
      pincode: address?.pincode ?? '',
    },
  });

  const onSubmit = async (v: Values) => {
    if (!pin) return setFormError('Set the delivery pin on the map first.');
    setFormError(null);
    const body = { ...v, landmark: v.landmark || undefined, location: { lng: pin.lng, lat: pin.lat } };
    try {
      const res = address ? await addressService.update(address.id, body) : await addressService.create(body);
      onSaved(res.address);
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['name', 'phone', 'line1', 'landmark', 'city', 'pincode']));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {formError && <Alert>{formError}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-cream px-4 py-3 text-sm">
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-leaf" aria-hidden />
          {pin ? (
            <span>
              Delivery pin: <strong>{pin.label}</strong>
            </span>
          ) : (
            <span className="text-soil-muted">No delivery pin set</span>
          )}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={openPicker}>
          {pin ? 'Change pin' : 'Set pin'}
        </Button>
      </div>

      <ChipGroup
        label="Address type"
        value={watch('label')}
        onChange={(v) => setValue('label', v)}
        options={[
          { value: 'home', label: 'Home' },
          { value: 'work', label: 'Work' },
          { value: 'other', label: 'Other' },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="addr-name" label="Receiver’s name" error={errors.name?.message}>
          <Input id="addr-name" autoComplete="name" invalid={!!errors.name} {...register('name')} />
        </FormField>
        <FormField id="addr-phone" label="Mobile number" error={errors.phone?.message} hint="The farmer calls this number on delivery.">
          <Input id="addr-phone" type="tel" inputMode="numeric" maxLength={10} invalid={!!errors.phone} {...register('phone')} />
        </FormField>
      </div>
      <FormField id="addr-line1" label="House / flat, street, area" error={errors.line1?.message}>
        <Input id="addr-line1" autoComplete="street-address" invalid={!!errors.line1} {...register('line1')} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="addr-landmark" label="Landmark (optional)" error={errors.landmark?.message}>
          <Input id="addr-landmark" {...register('landmark')} />
        </FormField>
        <FormField id="addr-city" label="City" error={errors.city?.message}>
          <Input id="addr-city" autoComplete="address-level2" invalid={!!errors.city} {...register('city')} />
        </FormField>
        <FormField id="addr-pincode" label="PIN code" error={errors.pincode?.message}>
          <Input id="addr-pincode" inputMode="numeric" maxLength={6} autoComplete="postal-code" invalid={!!errors.pincode} {...register('pincode')} />
        </FormField>
      </div>
      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting}>
          {address ? 'Save address' : 'Add address'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function AddressText({ a }: { a: Pick<Address, 'name' | 'phone' | 'line1' | 'landmark' | 'city' | 'pincode'> }) {
  return (
    <span className="block text-sm leading-relaxed">
      <strong>{a.name}</strong> · +91 {a.phone}
      <br />
      {a.line1}
      {a.landmark ? `, near ${a.landmark}` : ''}, {a.city} {a.pincode}
    </span>
  );
}
