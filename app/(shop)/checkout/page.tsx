'use client';

import { RequireRole } from '@/features/auth/RequireRole';
import { CheckoutView } from '@/features/checkout/CheckoutView';

export default function CheckoutPage() {
  return (
    <RequireRole role="customer">
      <div className="section py-10 md:py-14">
        <h1 className="text-4xl font-semibold">Checkout</h1>
        <div className="mt-8">
          <CheckoutView />
        </div>
      </div>
    </RequireRole>
  );
}
