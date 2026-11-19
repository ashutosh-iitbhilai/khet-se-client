'use client';

import { PageHeader } from '@/components/layout/DashboardShell';
import { AccountDetailsForm } from '@/features/account/AccountDetailsForm';
import { SignOutEverywhere } from '@/features/account/SignOutEverywhere';

export default function DeliverySettingsPage() {
  return (
    <>
      <PageHeader title="Account settings" description="Your name, mobile number and login." />
      <div className="max-w-xl space-y-6">
        <section className="border border-line bg-white p-6 sm:p-8">
          <AccountDetailsForm />
        </section>
        <section className="border border-line bg-white p-6 sm:p-8">
          <SignOutEverywhere />
        </section>
      </div>
    </>
  );
}
