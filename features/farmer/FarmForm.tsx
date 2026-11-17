'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Crosshair, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Alert } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/states';
import { applyServerErrors } from '@/features/auth/applyServerErrors';
import { farmService, type FarmPayload } from '@/services/farmer.service';
import { geoService, getCurrentPosition } from '@/services/geo.service';
import { PlaceSearch } from '@/features/location/PlaceSearch';
import { ImageListInput } from './ImageListInput';
import type { LatLng } from '@/components/map/MapPicker';
import type { Farm, GeoPlace } from '@/types';

// Leaflet touches `window`, so the map only renders in the browser.
const MapPicker = dynamic(() => import('@/components/map/MapPicker'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const schema = z.object({
  name: z.string().trim().min(2, 'Farm name is too short').max(100),
  description: z.string().trim().max(1500),
  city: z.string().trim().min(2, 'Which city do you deliver to?').max(60),
  line1: z.string().trim().min(3, 'Enter the farm address').max(200),
  village: z.string().trim().max(100),
  district: z.string().trim().max(100),
  state: z.string().trim().min(2, 'Enter the state').max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a 6-digit PIN code'),
  location: z.object({ lat: z.number(), lng: z.number() }, { required_error: 'Place the pin on your farm', invalid_type_error: 'Place the pin on your farm' }),
  areaAcres: z.union([z.literal(''), z.coerce.number().min(0).max(100000)]),
  deliveryRadiusKm: z.coerce.number().min(1, 'At least 1 km').max(50, 'At most 50 km'),
  deliveryAvailable: z.boolean(),
  pickupAvailable: z.boolean(),
  isActive: z.boolean(),
  images: z.array(z.string()).max(8),
});

type Values = z.infer<typeof schema>;

const titleCase = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function toValues(farm?: Farm): Values {
  return {
    name: farm?.name ?? '',
    description: farm?.description ?? '',
    city: farm ? titleCase(farm.city) : '',
    line1: farm?.address.line1 ?? '',
    village: farm?.address.village ?? '',
    district: farm?.address.district ?? '',
    state: farm?.address.state ?? '',
    pincode: farm?.address.pincode ?? '',
    location: farm ? { lng: farm.location.coordinates[0], lat: farm.location.coordinates[1] } : (undefined as unknown as LatLng),
    areaAcres: farm?.areaAcres ?? '',
    deliveryRadiusKm: farm?.deliveryRadiusKm ?? 8,
    deliveryAvailable: farm?.deliveryAvailable ?? true,
    pickupAvailable: farm?.pickupAvailable ?? false,
    isActive: farm?.isActive ?? true,
    images: farm?.images ?? [],
  };
}

export function FarmForm({ farm, onSaved }: { farm?: Farm; onSaved: (f: Farm) => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(farm) });

  const location = watch('location');
  const radius = watch('deliveryRadiusKm');

  /** Fill empty address fields from a geocoded place — never overwrite what the farmer typed. */
  const fillAddress = useCallback(
    (place: GeoPlace | null) => {
      if (!place) return;
      const fill = (field: keyof Values, v?: string) => {
        if (v && !getValues(field)) setValue(field, v as never, { shouldDirty: true, shouldValidate: true });
      };
      fill('line1', place.line1);
      fill('village', place.village);
      fill('district', place.district);
      fill('state', place.state);
      fill('city', place.city);
      if (place.pincode && /^\d{6}$/.test(place.pincode)) fill('pincode', place.pincode);
    },
    [getValues, setValue],
  );

  const placePin = useCallback(
    async (p: LatLng, lookup = true) => {
      setValue('location', { lat: Number(p.lat.toFixed(6)), lng: Number(p.lng.toFixed(6)) }, { shouldDirty: true, shouldValidate: true });
      if (!lookup) return;
      try {
        const { place } = await geoService.reverse(p.lat, p.lng);
        fillAddress(place);
      } catch {
        /* address lookup is a convenience; the pin is what matters */
      }
    },
    [setValue, fillAddress],
  );

  const useMyLocation = async () => {
    setGeoMsg(null);
    setLocating(true);
    try {
      await placePin(await getCurrentPosition());
    } catch (err) {
      setGeoMsg((err as Error).message);
    } finally {
      setLocating(false);
    }
  };

  const onSubmit = async (v: Values) => {
    setFormError(null);
    setSaved(false);
    const payload: FarmPayload = {
      name: v.name,
      description: v.description || undefined,
      city: v.city,
      address: {
        line1: v.line1,
        village: v.village || undefined,
        district: v.district || undefined,
        state: v.state,
        pincode: v.pincode,
      },
      location: v.location,
      areaAcres: v.areaAcres === '' ? undefined : v.areaAcres,
      images: v.images,
      deliveryRadiusKm: v.deliveryRadiusKm,
      deliveryAvailable: v.deliveryAvailable,
      pickupAvailable: v.pickupAvailable,
      isActive: v.isActive,
    };
    try {
      const { farm: result } = farm ? await farmService.update(farm.id, payload) : await farmService.create(payload);
      onSaved(result);
      reset(toValues(result));
      setSaved(true);
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['name', 'description', 'city', 'images', 'deliveryRadiusKm']));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {formError && <Alert>{formError}</Alert>}
      {saved && !isDirty && <Alert tone="success">Farm details saved. Customers nearby can now find you.</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="farm-name" label="Farm name" error={errors.name?.message}>
          <Input id="farm-name" placeholder="e.g. Hari Bhari Farm" invalid={!!errors.name} {...register('name')} />
        </FormField>
        <FormField id="areaAcres" label="Farm size (acres)" error={errors.areaAcres?.message}>
          <Input id="areaAcres" type="number" inputMode="decimal" step="0.1" min={0} {...register('areaAcres')} />
        </FormField>
      </div>

      <FormField id="farm-description" label="Describe your farm" error={errors.description?.message}>
        <Textarea id="farm-description" rows={3} placeholder="Soil, water source, what grows here in each season…" {...register('description')} />
      </FormField>

      {/* Location */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-medium">Farm location</p>
            <p className="text-xs text-soil-muted">Tap the map or drag the pin to the exact spot of your farm.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={useMyLocation} disabled={locating}>
            {locating ? <Loader2 className="animate-spin" /> : <Crosshair />}
            I’m at my farm now
          </Button>
        </div>
        <PlaceSearch onSelect={(p) => placePin({ lat: p.lat, lng: p.lng }, false).then(() => fillAddress(p))} />
        {geoMsg && <p className="text-xs text-danger">{geoMsg}</p>}
        <div className={`relative h-80 border ${errors.location ? 'border-danger' : 'border-line'}`}>
          <MapPicker value={location ?? null} onChange={(p) => placePin(p)} radiusKm={Number(radius) || undefined} />
        </div>
        <p className="flex items-center gap-1.5 text-xs text-soil-muted">
          <MapPin className="h-3.5 w-3.5 text-leaf" />
          {location ? `Pinned at ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'No pin yet'}
        </p>
        {errors.location && (
          <p role="alert" className="text-xs text-danger">
            {errors.location.message ?? 'Place the pin on your farm'}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="line1" label="Address" error={errors.line1?.message}>
          <Input id="line1" placeholder="Road, landmark" invalid={!!errors.line1} {...register('line1')} />
        </FormField>
        <FormField id="village" label="Village / locality">
          <Input id="village" {...register('village')} />
        </FormField>
        <FormField id="district" label="District">
          <Input id="district" {...register('district')} />
        </FormField>
        <FormField id="city" label="City you deliver to" error={errors.city?.message} hint="The nearest city whose customers you serve">
          <Input id="city" invalid={!!errors.city} {...register('city')} />
        </FormField>
        <FormField id="state" label="State" error={errors.state?.message}>
          <Input id="state" invalid={!!errors.state} {...register('state')} />
        </FormField>
        <FormField id="pincode" label="PIN code" error={errors.pincode?.message}>
          <Input id="pincode" inputMode="numeric" maxLength={6} invalid={!!errors.pincode} {...register('pincode')} />
        </FormField>
      </div>

      {/* Delivery */}
      <div className="space-y-3">
        <FormField
          id="deliveryRadiusKm"
          label={`Delivery distance: ${radius || 0} km`}
          error={errors.deliveryRadiusKm?.message}
          hint="Customers within this distance of your farm will see your products."
        >
          <input
            id="deliveryRadiusKm"
            type="range"
            min={1}
            max={30}
            step={1}
            className="w-full accent-leaf"
            {...register('deliveryRadiusKm', { valueAsNumber: true })}
          />
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            name="deliveryAvailable"
            render={({ field }) => (
              <Switch id="deliveryAvailable" checked={field.value} onChange={field.onChange} label="I deliver orders" description="Home delivery within your distance" />
            )}
          />
          <Controller
            control={control}
            name="pickupAvailable"
            render={({ field }) => (
              <Switch id="pickupAvailable" checked={field.value} onChange={field.onChange} label="Customers can pick up" description="Collect directly from the farm" />
            )}
          />
        </div>
        {farm && (
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Switch
                id="isActive"
                checked={field.value}
                onChange={field.onChange}
                label="Farm is open for orders"
                description="Turning this off hides all products from this farm."
              />
            )}
          />
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Farm photos</p>
        <Controller
          control={control}
          name="images"
          render={({ field }) => <ImageListInput kind="farm" max={8} value={field.value} onChange={(v) => field.onChange(v)} />}
        />
      </div>

      <Button type="submit" size="lg" loading={isSubmitting} disabled={farm ? !isDirty : false}>
        {farm ? 'Save farm details' : 'Register farm'}
      </Button>
    </form>
  );
}
