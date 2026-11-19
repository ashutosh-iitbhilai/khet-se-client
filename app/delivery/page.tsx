'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Banknote, Bike, CheckCircle2, Circle, IndianRupee, ListChecks, Route, Search } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/layout/DashboardShell';
import { useAuth } from '@/features/auth/AuthProvider';
import { VEHICLE_LABEL } from '@/features/delivery/labels';
import { useFetch } from '@/hooks/useFetch';
import { formatINR } from '@/lib/utils';
import { deliveryService } from '@/services/delivery.service';

export default function DeliveryOverviewPage() {
  const { user } = useAuth();
  const { data, error, loading, reload, setData } = useFetch(['delivery', 'overview'], () => deliveryService.overview(), { refetchInterval: 30_000 });
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) return <Skeleton className="h-96" />;
  const o = data!;
  const hasPhone = Boolean(user?.phone);

  const setOnline = async (isOnline: boolean) => {
    setToggleError(null);
    setToggling(true);
    try {
      const { profile } = await deliveryService.updateProfile({ isOnline });
      setData({ ...o, profile });
      void reload();
    } catch (err) {
      setToggleError((err as Error).message);
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <PageHeader title={`Namaste, ${user?.name.split(' ')[0] ?? ''}`} description="Deliver fresh produce from local farms to homes nearby, and earn per delivery." />

      {(!o.profile.ready || !hasPhone) && (
        <section className="mb-6 border border-turmeric bg-amber-50 p-5">
          <h2 className="font-sans text-base font-semibold">Finish setting up to start delivering</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <Step done={hasPhone} href="/delivery/settings" label="Add your mobile number" />
            <Step done={o.profile.ready} href="/delivery/profile" label="Set your base location and work area" />
            <Step done={o.profile.isOnline} label="Go online" />
          </ul>
        </section>
      )}

      <div className={`mb-6 ${toggling ? 'opacity-60' : ''}`}>
        <Switch
          id="online"
          checked={o.profile.isOnline}
          onChange={setOnline}
          label={o.profile.isOnline ? 'You are online' : 'You are offline'}
          description={
            o.profile.isOnline
              ? `Receiving deliveries within ${o.profile.serviceRadiusKm} km of ${o.profile.base?.label || 'your base'} · ${VEHICLE_LABEL[o.profile.vehicle]}`
              : 'Go online to see and accept deliveries near you.'
          }
        />
        {toggleError && (
          <div className="mt-3">
            <Alert>{toggleError}</Alert>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={IndianRupee} label="Earned today" value={formatINR(o.today.earned)} hint={`${o.today.jobs} ${o.today.jobs === 1 ? 'delivery' : 'deliveries'}`} />
        <Stat icon={Route} label="Distance today" value={`${o.today.km} km`} hint="Farm to customer" />
        <Stat icon={Banknote} label="Cash collected today" value={formatINR(o.cashInHand)} hint="From cash-on-delivery orders" />
        <Stat icon={Bike} label="Last 7 days" value={formatINR(o.week.earned)} hint={`${o.week.jobs} deliveries`} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Action
          href="/delivery/active"
          icon={ListChecks}
          title={o.activeJobs ? `${o.activeJobs} ${o.activeJobs === 1 ? 'delivery' : 'deliveries'} in progress` : 'No deliveries in progress'}
          text={o.activeJobs ? 'Pick up, then hand over with the customer’s code.' : `You can hold up to ${o.profile.maxActiveJobs} at a time.`}
        />
        <Action
          href="/delivery/jobs"
          icon={Search}
          title={o.profile.isOnline ? `${o.availableJobs} open ${o.availableJobs === 1 ? 'delivery' : 'deliveries'} near you` : 'Find deliveries'}
          text={o.profile.isOnline ? 'First to accept gets the job.' : 'Go online to see open deliveries.'}
        />
      </div>
    </>
  );
}

function Step({ done, label, href }: { done: boolean; label: string; href?: string }) {
  const Icon = done ? CheckCircle2 : Circle;
  return (
    <li className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${done ? 'text-leaf' : 'text-soil-muted'}`} aria-hidden />
      {href && !done ? (
        <Link href={href} className="font-medium text-leaf hover:underline">
          {label}
        </Link>
      ) : (
        <span className={done ? 'text-soil-muted line-through' : ''}>{label}</span>
      )}
    </li>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Bike; label: string; value: string; hint: string }) {
  return (
    <div className="border border-line bg-white p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-soil-muted">
        <Icon className="h-4 w-4 text-leaf" aria-hidden /> {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-soil-muted">{hint}</p>
    </div>
  );
}

function Action({ href, icon: Icon, title, text }: { href: string; icon: typeof Bike; title: string; text: string }) {
  return (
    <Link href={href} className="group flex items-center gap-4 border border-line bg-white p-5 hover:border-leaf">
      <Icon className="h-6 w-6 shrink-0 text-leaf" aria-hidden />
      <span className="flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-soil-muted">{text}</span>
      </span>
      <ArrowRight className="h-5 w-5 text-soil-muted group-hover:text-leaf" aria-hidden />
    </Link>
  );
}

