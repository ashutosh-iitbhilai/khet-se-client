import type { Metadata } from 'next';
import { CartView } from '@/features/cart/CartView';

export const metadata: Metadata = { title: 'Your basket' };

export default function CartPage() {
  return (
    <div className="section py-10 md:py-14">
      <h1 className="text-4xl font-semibold">Your basket</h1>
      <p className="mt-2 text-soil-muted">Prices, stock and delivery are checked live with each farm.</p>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}
