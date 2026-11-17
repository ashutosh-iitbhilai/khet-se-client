'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';
import { Alert } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { SafeImage } from '@/components/ui/safe-image';
import { applyServerErrors } from '@/features/auth/applyServerErrors';
import { inventoryService, type ListingPayload } from '@/services/farmer.service';
import { todayInput, toDateInput, UNIT_LABELS } from '@/lib/labels';
import { formatINR } from '@/lib/utils';
import { UNITS, type Farm, type InventoryItem, type Product, type ProductType } from '@/types';

const num = (msg: string) => z.coerce.number({ invalid_type_error: msg });

const baseSchema = z.object({
  farm: z.string(),
  price: num('Enter a price').min(1, 'Price must be at least ₹1').max(100000),
  unit: z.enum(UNITS),
  packSizeGrams: z.union([z.literal(''), z.coerce.number().int().min(1).max(50000)]),
  quantityAvailable: num('Enter how much you have').min(0, 'Cannot be negative').max(100000),
  minOrderQty: num('Enter a minimum').min(0.1, 'At least 0.1').max(1000),
  harvestDate: z.string(),
  processedDate: z.string(),
  expiryDate: z.string(),
  packaging: z.string().trim().max(120),
  description: z.string().trim().max(600),
  images: z.array(z.string()).max(6),
  organicClaim: z.boolean(),
  isActive: z.boolean(),
});
type Values = z.infer<typeof baseSchema>;

/** Same fresh/dry rules as the API, so farmers get instant feedback. */
function schemaFor(type: ProductType, needsFarm: boolean) {
  return baseSchema.superRefine((v, ctx) => {
    const today = todayInput();
    if (needsFarm && !v.farm) ctx.addIssue({ code: 'custom', path: ['farm'], message: 'Choose a farm' });
    if (type === 'fresh') {
      if (!v.harvestDate) ctx.addIssue({ code: 'custom', path: ['harvestDate'], message: 'When was it harvested?' });
      else if (v.harvestDate > today) ctx.addIssue({ code: 'custom', path: ['harvestDate'], message: 'Cannot be in the future' });
    } else {
      if (!v.processedDate) ctx.addIssue({ code: 'custom', path: ['processedDate'], message: 'When was it dried / packed?' });
      else if (v.processedDate > today) ctx.addIssue({ code: 'custom', path: ['processedDate'], message: 'Cannot be in the future' });
      if (!v.expiryDate) ctx.addIssue({ code: 'custom', path: ['expiryDate'], message: 'Enter a best-before date' });
      else if (v.expiryDate <= today) ctx.addIssue({ code: 'custom', path: ['expiryDate'], message: 'Must be in the future' });
      else if (v.processedDate && v.expiryDate <= v.processedDate)
        ctx.addIssue({ code: 'custom', path: ['expiryDate'], message: 'Must be after the processing date' });
    }
    if (v.unit === 'packet' && v.packSizeGrams === '')
      ctx.addIssue({ code: 'custom', path: ['packSizeGrams'], message: 'Enter the packet weight' });
  });
}

interface ListingFormProps {
  product: Pick<Product, 'id' | 'name' | 'localName' | 'image' | 'type' | 'defaultUnit'>;
  farms: Farm[];
  /** When editing an existing listing. */
  item?: InventoryItem;
  onSaved: (item: InventoryItem) => void;
  onCancel?: () => void;
}

export function ListingForm({ product, farms, item, onSaved, onCancel }: ListingFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const isFresh = product.type === 'fresh';
  const needsFarm = !item && farms.length > 1;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schemaFor(product.type, needsFarm)),
    defaultValues: {
      farm: item ? '' : farms.length === 1 ? farms[0].id : '',
      price: item?.price ?? ('' as unknown as number),
      unit: item?.unit ?? product.defaultUnit,
      packSizeGrams: item?.packSizeGrams ?? '',
      quantityAvailable: item?.quantityAvailable ?? ('' as unknown as number),
      minOrderQty: item?.minOrderQty ?? 1,
      harvestDate: item ? toDateInput(item.harvestDate) : isFresh ? todayInput() : '',
      processedDate: toDateInput(item?.processedDate),
      expiryDate: toDateInput(item?.expiryDate),
      packaging: item?.packaging ?? '',
      description: item?.description ?? '',
      images: item?.images ?? [],
      organicClaim: item?.organicClaim ?? true,
      isActive: item?.isActive ?? true,
    },
  });

  const unit = watch('unit');
  const price = Number(watch('price')) || 0;

  const onSubmit = async (v: Values) => {
    setFormError(null);
    const common = {
      price: v.price,
      unit: v.unit,
      packSizeGrams: v.unit === 'packet' && v.packSizeGrams !== '' ? v.packSizeGrams : undefined,
      quantityAvailable: v.quantityAvailable,
      minOrderQty: v.minOrderQty,
      ...(isFresh
        ? { harvestDate: v.harvestDate }
        : { processedDate: v.processedDate, expiryDate: v.expiryDate, packaging: v.packaging || undefined }),
      description: v.description || undefined,
      images: v.images,
      organicClaim: v.organicClaim,
      isActive: v.isActive,
    };
    try {
      const res = item
        ? await inventoryService.update(item.id, common)
        : await inventoryService.create({ ...common, product: product.id, farm: v.farm || undefined } as ListingPayload);
      onSaved(res.item);
    } catch (err) {
      setFormError(
        applyServerErrors(err, setError, [
          'farm', 'price', 'unit', 'packSizeGrams', 'quantityAvailable', 'minOrderQty',
          'harvestDate', 'processedDate', 'expiryDate', 'packaging', 'description',
        ]),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="flex items-center gap-4 border border-line bg-cream p-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-sand">
          <SafeImage src={product.image} alt={product.name} fill sizes="64px" />
        </div>
        <div>
          <p className="font-semibold">{product.name}</p>
          <p className="text-xs text-soil-muted">
            {product.localName ? `${product.localName} · ` : ''}
            {isFresh ? 'Fresh vegetable' : 'Dry product'}
          </p>
        </div>
      </div>

      {formError && <Alert>{formError}</Alert>}

      {needsFarm && (
        <FormField id="farm" label="Which farm is this from?" error={errors.farm?.message}>
          <Select id="farm" invalid={!!errors.farm} {...register('farm')}>
            <option value="">Choose a farm</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
        </FormField>
      )}

      {/* Price — large inputs for easy entry on a phone */}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="price" label="Price (₹)" error={errors.price?.message}>
          <div className="flex">
            <span className="flex items-center border border-r-0 border-line bg-cream px-3 text-lg text-soil-muted">₹</span>
            <Input id="price" type="number" inputMode="decimal" step="0.5" min={1} className="h-12 text-lg" invalid={!!errors.price} {...register('price')} />
          </div>
        </FormField>
        <FormField id="unit" label="Per" error={errors.unit?.message}>
          <Select id="unit" className="h-12 text-base" {...register('unit')}>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {UNIT_LABELS[u]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {unit === 'packet' && (
        <FormField id="packSizeGrams" label="Packet weight (grams)" error={errors.packSizeGrams?.message} hint="e.g. 100, 250, 500">
          <Input id="packSizeGrams" type="number" inputMode="numeric" min={1} invalid={!!errors.packSizeGrams} {...register('packSizeGrams')} />
        </FormField>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="quantityAvailable" label={`Stock available (${UNIT_LABELS[unit]})`} error={errors.quantityAvailable?.message}>
          <Input id="quantityAvailable" type="number" inputMode="decimal" step="0.5" min={0} className="h-12 text-lg" invalid={!!errors.quantityAvailable} {...register('quantityAvailable')} />
        </FormField>
        <FormField id="minOrderQty" label={`Smallest order (${UNIT_LABELS[unit]})`} error={errors.minOrderQty?.message}>
          <Input id="minOrderQty" type="number" inputMode="decimal" step="0.25" min={0.1} className="h-12 text-lg" invalid={!!errors.minOrderQty} {...register('minOrderQty')} />
        </FormField>
      </div>

      {price > 0 && (
        <p className="border-l-4 border-leaf bg-sprout px-4 py-2.5 text-sm text-leaf-dark">
          Customers will see <strong>{formatINR(price)}</strong> per {UNIT_LABELS[unit]}.
        </p>
      )}

      {/* Freshness */}
      {isFresh ? (
        <FormField id="harvestDate" label="Harvest date" error={errors.harvestDate?.message} hint="Fresher produce is shown higher to customers.">
          <Input id="harvestDate" type="date" max={todayInput()} invalid={!!errors.harvestDate} {...register('harvestDate')} />
        </FormField>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="processedDate" label="Dried / packed on" error={errors.processedDate?.message}>
            <Input id="processedDate" type="date" max={todayInput()} invalid={!!errors.processedDate} {...register('processedDate')} />
          </FormField>
          <FormField id="expiryDate" label="Best before" error={errors.expiryDate?.message}>
            <Input id="expiryDate" type="date" min={todayInput()} invalid={!!errors.expiryDate} {...register('expiryDate')} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField id="packaging" label="Packaging" error={errors.packaging?.message} hint="e.g. Kraft paper pouch, glass jar">
              <Input id="packaging" {...register('packaging')} />
            </FormField>
          </div>
        </div>
      )}

      <FormField id="description" label="Notes for customers (optional)" error={errors.description?.message}>
        <Textarea id="description" rows={3} placeholder="Variety, taste, how it was grown…" {...register('description')} />
      </FormField>

      <div className="grid gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name="organicClaim"
          render={({ field }) => (
            <Switch id="organicClaim" checked={field.value} onChange={field.onChange} label="Grown organically" description="No chemical fertiliser or pesticide" />
          )}
        />
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Switch id="isActive" checked={field.value} onChange={field.onChange} label="Show to customers" description="Turn off to pause this listing" />
          )}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" loading={isSubmitting} disabled={item ? !isDirty : false}>
          {item ? 'Save changes' : 'Publish listing'}
        </Button>
        {onCancel && (
          <Button type="button" size="lg" variant="ghost" onClick={onCancel}>
            {item ? 'Cancel' : 'Choose a different product'}
          </Button>
        )}
      </div>
    </form>
  );
}
