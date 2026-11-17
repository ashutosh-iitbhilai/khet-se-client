'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { applyServerErrors } from '@/features/auth/applyServerErrors';
import { farmerService } from '@/services/farmer.service';
import { PRACTICE_LABELS, STATUS_LABELS, toDateInput } from '@/lib/labels';
import { cn } from '@/lib/utils';
import { FARMING_PRACTICES, type Farmer } from '@/types';

const schema = z
  .object({
    bio: z.string().trim().min(20, 'Write at least a couple of sentences (20+ characters)').max(1000),
    experienceYears: z.union([z.literal(''), z.coerce.number().int().min(0).max(80)]),
    languages: z.string().max(200),
    practices: z.array(z.enum(FARMING_PRACTICES)),
    certificateNumber: z.string().trim().max(80),
    issuer: z.string().trim().max(120),
    documentUrl: z.union([z.literal(''), z.string().trim().url('Enter a valid link').startsWith('https://', 'Link must start with https://')]),
    validUntil: z.string(),
  })
  .superRefine((v, ctx) => {
    // Certificate fields are optional, but number + issuer go together.
    if (v.certificateNumber && !v.issuer) ctx.addIssue({ code: 'custom', path: ['issuer'], message: 'Who issued the certificate?' });
    if (v.issuer && !v.certificateNumber) ctx.addIssue({ code: 'custom', path: ['certificateNumber'], message: 'Enter the certificate number' });
  });

type Values = z.infer<typeof schema>;

const statusTone = { verified: 'green', pending: 'amber', rejected: 'red', unsubmitted: 'neutral' } as const;

export function ProfileForm({ farmer, onSaved }: { farmer: Farmer; onSaved: (f: Farmer) => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const cert = farmer.organicCertification;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: farmer.bio ?? '',
      experienceYears: farmer.experienceYears ?? '',
      languages: farmer.languages.join(', '),
      practices: farmer.practices,
      certificateNumber: cert.certificateNumber ?? '',
      issuer: cert.issuer ?? '',
      documentUrl: cert.documentUrl ?? '',
      validUntil: toDateInput(cert.validUntil),
    },
  });
  const practices = watch('practices');

  const onSubmit = async (v: Values) => {
    setFormError(null);
    setSaved(false);
    try {
      const { farmer: updated } = await farmerService.updateProfile({
        bio: v.bio,
        experienceYears: v.experienceYears === '' ? undefined : v.experienceYears,
        languages: v.languages
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length >= 2),
        practices: v.practices,
        organicCertification: v.certificateNumber
          ? {
              certificateNumber: v.certificateNumber,
              issuer: v.issuer,
              documentUrl: v.documentUrl || undefined,
              validUntil: v.validUntil || undefined,
            }
          : undefined,
      });
      onSaved(updated);
      reset(v);
      setSaved(true);
    } catch (err) {
      setFormError(
        applyServerErrors(err, setError, ['bio', 'experienceYears', 'languages', 'practices']),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {formError && <Alert>{formError}</Alert>}
      {saved && !isDirty && <Alert tone="success">Your profile is saved.</Alert>}

      <FormField id="bio" label="About you and your farm" error={errors.bio?.message} hint="Customers read this on your profile. What do you grow, and how?">
        <Textarea id="bio" rows={4} invalid={!!errors.bio} {...register('bio')} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="experienceYears" label="Years of farming" error={errors.experienceYears?.message}>
          <Input id="experienceYears" type="number" inputMode="numeric" min={0} max={80} {...register('experienceYears')} />
        </FormField>
        <FormField id="languages" label="Languages you speak" hint="Separate with commas, e.g. Hindi, Chhattisgarhi">
          <Input id="languages" {...register('languages')} />
        </FormField>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">How do you farm?</legend>
        <div className="flex flex-wrap gap-2">
          {FARMING_PRACTICES.map((p) => {
            const on = practices.includes(p);
            return (
              <button
                key={p}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setValue('practices', on ? practices.filter((x) => x !== p) : [...practices, p], { shouldDirty: true })
                }
                className={cn(
                  'inline-flex items-center gap-1.5 border px-3 py-2 text-sm transition-colors',
                  on ? 'border-leaf bg-sprout text-leaf-dark' : 'border-line bg-white hover:border-leaf/60',
                )}
              >
                {on && <Check className="h-3.5 w-3.5" />}
                {PRACTICE_LABELS[p]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div id="organic" className="scroll-mt-24 border-t border-line pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-sans text-sm font-semibold">Organic certificate (optional)</h3>
          <Badge tone={statusTone[cert.status]}>{STATUS_LABELS[cert.status]}</Badge>
        </div>
        <p className="mt-1 text-xs text-soil-muted">
          Verified farmers get an “Organic verified” badge. Changing these details sends the certificate for review again.
        </p>
        {cert.status === 'rejected' && cert.reviewNote && (
          <div className="mt-3">
            <Alert>Reviewer note: {cert.reviewNote}</Alert>
          </div>
        )}
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <FormField id="certificateNumber" label="Certificate number" error={errors.certificateNumber?.message}>
            <Input id="certificateNumber" invalid={!!errors.certificateNumber} {...register('certificateNumber')} />
          </FormField>
          <FormField id="issuer" label="Issued by" error={errors.issuer?.message} hint="e.g. PGS-India, NPOP certification body">
            <Input id="issuer" invalid={!!errors.issuer} {...register('issuer')} />
          </FormField>
          <FormField id="documentUrl" label="Certificate link" error={errors.documentUrl?.message} hint="A link to a photo or PDF of the certificate">
            <Input id="documentUrl" type="url" invalid={!!errors.documentUrl} placeholder="https://" {...register('documentUrl')} />
          </FormField>
          <FormField id="validUntil" label="Valid until">
            <Input id="validUntil" type="date" {...register('validUntil')} />
          </FormField>
        </div>
      </div>

      <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
        Save profile
      </Button>
    </form>
  );
}
