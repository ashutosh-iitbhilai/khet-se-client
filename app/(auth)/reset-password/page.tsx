import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/features/auth/ResetPasswordForm';

// The token is in the URL: keep it out of search engines and referrers.
export const metadata: Metadata = { title: 'Reset password', robots: { index: false }, referrer: 'no-referrer' };

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
