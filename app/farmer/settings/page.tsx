'use client';

import { PageHeader } from '@/features/farmer/FarmerShell';
import { AccountDetailsForm } from '@/features/account/AccountDetailsForm';

export default function AccountSettingsPage() {
  return (
    <>
      <PageHeader title="Account settings" description="Your login and contact details." />
      <section className="max-w-xl border border-line bg-white p-6 sm:p-8">
        <AccountDetailsForm />
      </section>
    </>
  );
}
