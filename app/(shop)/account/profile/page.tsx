'use client';

import { AccountDetailsForm } from '@/features/account/AccountDetailsForm';
import { SignOutEverywhere } from '@/features/account/SignOutEverywhere';

export default function ProfilePage() {
  return (
    <div className="max-w-xl space-y-6">
      <section className="border border-line bg-white p-6 sm:p-8">
        <AccountDetailsForm />
      </section>
      <section className="border border-line bg-white p-6 sm:p-8">
        <SignOutEverywhere />
      </section>
    </div>
  );
}
