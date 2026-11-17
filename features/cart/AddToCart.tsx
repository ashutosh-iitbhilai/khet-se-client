'use client';

import { ShoppingBasket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CardListing } from '@/types';
import { stepFor, useCart } from './CartProvider';
import { QuantityStepper } from './QuantityStepper';

/** "Add" button that turns into a quantity stepper once the item is in the cart. */
export function AddToCart({ listing, size = 'sm', className }: { listing: CardListing; size?: 'sm' | 'lg'; className?: string }) {
  const { ready, quantityOf, add, setQuantity } = useCart();
  const qty = quantityOf(listing.id);
  const step = stepFor(listing.unit);
  const min = Math.max(listing.minOrderQty, step);

  if (!ready) return <div className={cn(size === 'lg' ? 'h-12' : 'h-9', 'w-full animate-pulse bg-sand/60', className)} />;

  if (listing.quantityAvailable < min) {
    return (
      <Button variant="outline" size={size === 'lg' ? 'lg' : 'sm'} disabled className={cn('w-full', className)}>
        Sold out
      </Button>
    );
  }

  if (qty > 0) {
    return (
      <QuantityStepper
        value={qty}
        unit={listing.unit}
        step={step}
        min={min}
        max={listing.quantityAvailable}
        onChange={(v) => setQuantity(listing.id, v)}
        size={size}
        label={listing.product.name}
      />
    );
  }

  return (
    <Button
      variant={size === 'lg' ? 'primary' : 'outline'}
      size={size === 'lg' ? 'lg' : 'sm'}
      className={cn('w-full', size === 'sm' && 'border-leaf text-leaf hover:bg-leaf hover:text-white', className)}
      onClick={() => add(listing, min)}
      aria-label={`Add ${listing.product.name} to cart`}
    >
      <ShoppingBasket /> {size === 'lg' ? 'Add to cart' : 'Add'}
    </Button>
  );
}
