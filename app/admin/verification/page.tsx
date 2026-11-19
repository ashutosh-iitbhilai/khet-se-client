'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BadgeCheck, ExternalLink, FileText, MapPin, Phone, ShieldCheck, ShieldX } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/components/layout/DashboardShell';
import { Pager, ReasonDialog, Tabs, VerifyBadge } from '@/features/admin/ui';
import { useFetch } from '@/hooks/useFetch';
import { formatDateTime } from '@/lib/orderLabels';
import { adminService, type VerificationItem } from '@/services/admin.service';

type Kind = 'all' | 'profile' | 'organic';

export default function VerificationPage() {
  const [kind, setKind] = useState<Kind>('all');
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useFetch(['admin', 'verification', kind, page], () => adminService.verification(kind, page));

  return (
    <>
      <PageHeader
        title="Farmer verification"
        description="Check each farmer’s details and organic certificate. Rejected farmers are hidden from the marketplace until verified, and see your note."
      />
      <div className="mb-5">
        <Tabs
          label="What to review"
          value={kind}
          onChange={(k) => {
            setKind(k);
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'Everything waiting' },
            { value: 'profile', label: 'Profiles' },
            { value: 'organic', label: 'Organic certificates' },
          ]}
        />
      </div>
      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton className="h-64" />
      ) : !data?.items.length ? (
        <EmptyState icon={BadgeCheck} title="Nothing waiting for review" description="New farmers and certificate updates appear here." />
      ) : (
        <div className={`space-y-4 ${loading ? 'opacity-60' : ''}`}>
          {data.items.map((f) => (
            <FarmerReview key={f.id} f={f} />
          ))}
          <Pager page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </div>
      )}
    </>
  );
}

type Decision = { profile?: 'verified' | 'rejected'; organic?: 'verified' | 'rejected'; title: string; label: string; danger?: boolean; required: boolean };

function FarmerReview({ f }: { f: VerificationItem }) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const cert = f.organicCertification;
  const decide = (d: Decision) => setDecision(d);

  return (
    <article className="min-w-0 border border-line bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-cream px-5 py-3">
        <div>
          <Link href={`/admin/users/${f.user.id}`} className="font-semibold hover:text-leaf">
            {f.user.name}
          </Link>
          <p className="text-xs text-soil-muted">Joined {formatDateTime(f.user.joined)} · waiting since {formatDateTime(f.waitingSince)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <VerifyBadge what="Profile" status={f.profileStatus} />
          <VerifyBadge what="Organic" status={cert.status} />
        </div>
      </header>

      <div className="grid gap-5 p-5 md:grid-cols-2">
        <section className="space-y-2 text-sm">
          <h3 className="font-sans text-xs font-semibold uppercase tracking-wide text-soil-muted">Farmer</h3>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-leaf" aria-hidden />
            {f.user.phone ? <a href={`tel:+91${f.user.phone}`} className="hover:text-leaf">+91 {f.user.phone}</a> : 'No phone'}
            {f.user.email && <span className="text-soil-muted">· {f.user.email}</span>}
          </p>
          {f.bio && <p className="text-soil-muted [overflow-wrap:anywhere]">“{f.bio}”</p>}
          <p className="text-soil-muted">
            {f.experienceYears ? `${f.experienceYears} years farming` : 'Experience not given'}
            {f.practices.length ? ` · ${f.practices.join(', ')}` : ''}
          </p>
          {f.farms.map((farm) => (
            <p key={farm.name} className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf" aria-hidden />
              <span>
                <strong>{farm.name}</strong> — {[farm.village, farm.district].filter(Boolean).join(', ') || 'no address'} · delivers {farm.deliveryRadiusKm} km
              </span>
            </p>
          ))}
          {!f.farms.length && <p className="text-turmeric">No farm added yet.</p>}
          <p className="text-soil-muted">{f.activeListings} active listings</p>
          {f.profileReviewNote && <p className="border-l-4 border-line pl-3 text-xs text-soil-muted">Last note: {f.profileReviewNote}</p>}
        </section>

        <section className="space-y-2 text-sm">
          <h3 className="font-sans text-xs font-semibold uppercase tracking-wide text-soil-muted">Organic certificate</h3>
          {cert.status === 'unsubmitted' ? (
            <p className="text-soil-muted">Not submitted.</p>
          ) : (
            <>
              <p>
                <strong>{cert.certificateNumber ?? 'No number'}</strong> · {cert.issuer ?? 'issuer not given'}
              </p>
              {cert.validUntil && <p className="text-soil-muted">Valid until {new Date(cert.validUntil).toLocaleDateString('en-IN')}</p>}
              {cert.documentUrl ? (
                <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-leaf hover:underline">
                  <FileText className="h-4 w-4" aria-hidden /> Open certificate document <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : (
                <p className="text-turmeric">No document uploaded. Check the number with the issuer before verifying.</p>
              )}
              {cert.reviewNote && <p className="border-l-4 border-line pl-3 text-xs text-soil-muted">Last note: {cert.reviewNote}</p>}
            </>
          )}
        </section>
      </div>

      <footer className="space-y-3 border-t border-line px-5 py-4">
        {done && <Alert tone="success">{done}</Alert>}
        <div className="flex flex-wrap gap-2">
          {f.profileStatus !== 'verified' && (
            <Button onClick={() => decide({ profile: 'verified', title: `Verify ${f.user.name}’s profile`, label: 'Verify profile', required: false })}>
              <ShieldCheck /> Verify profile
            </Button>
          )}
          {f.profileStatus !== 'rejected' && (
            <Button variant="outline" onClick={() => decide({ profile: 'rejected', title: `Reject ${f.user.name}’s profile`, label: 'Reject profile', danger: true, required: true })}>
              <ShieldX /> Reject profile
            </Button>
          )}
          {cert.status === 'pending' && (
            <>
              <Button variant="outline" onClick={() => decide({ organic: 'verified', title: 'Verify organic certificate', label: 'Verify certificate', required: false })}>
                <BadgeCheck /> Verify organic
              </Button>
              <Button variant="ghost" onClick={() => decide({ organic: 'rejected', title: 'Reject organic certificate', label: 'Reject certificate', danger: true, required: true })}>
                Reject organic
              </Button>
            </>
          )}
        </div>
      </footer>

      <ReasonDialog
        open={!!decision}
        title={decision?.title ?? ''}
        description={decision?.required ? 'The farmer sees this reason on their dashboard.' : 'Optional note for the audit trail.'}
        confirmLabel={decision?.label ?? 'Confirm'}
        danger={decision?.danger}
        required={decision?.required}
        onClose={() => setDecision(null)}
        onConfirm={async (note) => {
          await adminService.decide(f.id, { profile: decision?.profile, organic: decision?.organic, note: note || undefined });
          setDone(`${decision?.label} — saved.`);
        }}
      />
    </article>
  );
}
