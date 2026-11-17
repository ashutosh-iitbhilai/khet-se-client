'use client';

import { AccountDetailsForm } from '@/features/account/AccountDetailsForm';

export default function ProfilePage() {
  return (
    <section className="max-w-xl border border-line bg-white p-6 sm:p-8">
      <AccountDetailsForm />
    </section>
  );
}
