'use client';

import { useMemo } from 'react';
import { useDebounced } from '@/hooks/useDebounced';
import { useFetch } from '@/hooks/useFetch';
import { orderService, type CartLine } from '@/services/order.service';
import type { Quote } from '@/types';
import { useCart } from './CartProvider';

/**
 * Server-priced quote for the current cart at a delivery point. Debounced so tapping
 * "+" five times sends one request.
 */
export function useQuote(at: { lng: number; lat: number } | null) {
  const { items } = useCart();
  const lines: CartLine[] = useMemo(() => items.map((i) => ({ listing: i.listing, quantity: i.quantity })), [items]);
  const key = useDebounced(JSON.stringify({ lines, at }), 350);

  // Live prices and stock for the cart: re-checked after any change and when you return to the tab.
  return useFetch<Quote | null>(['market', 'quote', key], async () => {
    const { lines: l, at: a } = JSON.parse(key) as { lines: CartLine[]; at: { lng: number; lat: number } | null };
    if (!a || l.length === 0) return null;
    return orderService.quote(l, a);
  });
}
