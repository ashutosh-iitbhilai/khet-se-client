'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CardListing, Unit } from '@/types';

/**
 * The cart lives in this browser (localStorage) so guests can shop before signing in.
 * Snapshots are for display only — prices, stock and delivery are always re-checked by
 * the server's quote before checkout.
 */
export interface CartItem {
  listing: string;
  quantity: number;
  snapshot: {
    productName: string;
    image: string;
    price: number;
    unit: Unit;
    packSizeGrams?: number;
    minOrderQty: number;
    maxQuantity: number;
    farmId: string;
    farmName: string;
    farmerName: string;
  };
  addedAt: number;
}

interface CartContextValue {
  items: CartItem[];
  ready: boolean;
  count: number;
  quantityOf: (listing: string) => number;
  add: (listing: CardListing, quantity?: number) => void;
  setQuantity: (listing: string, quantity: number) => void;
  remove: (listing: string) => void;
  clear: () => void;
}

const STORAGE_KEY = 'khetse:cart';
const CartContext = createContext<CartContextValue | null>(null);

const WEIGHT: Unit[] = ['kg', 'g'];
/** Quantity step for a unit: quarter kg for weight, whole units otherwise (mirrors the API). */
export const stepFor = (unit: Unit) => (WEIGHT.includes(unit) ? 0.25 : 1);
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

function read(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    return Array.isArray(parsed) ? parsed.filter((i) => i && typeof i.listing === 'string' && i.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read());
    setReady(true);
    // Keep several open tabs in sync.
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setItems(read());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage blocked — cart still works for this visit */
    }
  }, []);

  const add = useCallback(
    (l: CardListing, quantity?: number) => {
      const current = read();
      const existing = current.find((i) => i.listing === l.id);
      const q = Math.min(l.quantityAvailable, quantity ?? Math.max(l.minOrderQty, stepFor(l.unit)));
      const snapshot: CartItem['snapshot'] = {
        productName: l.product.name,
        image: l.images[0] ?? l.product.image,
        price: l.price,
        unit: l.unit,
        packSizeGrams: l.packSizeGrams,
        minOrderQty: l.minOrderQty,
        maxQuantity: l.quantityAvailable,
        farmId: l.farm.id,
        farmName: l.farm.name,
        farmerName: l.farmer.name,
      };
      persist(
        existing
          ? current.map((i) => (i.listing === l.id ? { ...i, quantity: q, snapshot } : i))
          : [...current, { listing: l.id, quantity: q, snapshot, addedAt: Date.now() }],
      );
    },
    [persist],
  );

  const setQuantity = useCallback(
    (listing: string, quantity: number) => {
      const current = read();
      const item = current.find((i) => i.listing === listing);
      if (!item) return;
      const q = roundTo(quantity, stepFor(item.snapshot.unit));
      persist(q <= 0 ? current.filter((i) => i.listing !== listing) : current.map((i) => (i.listing === listing ? { ...i, quantity: q } : i)));
    },
    [persist],
  );

  const remove = useCallback((listing: string) => persist(read().filter((i) => i.listing !== listing)), [persist]);
  const clear = useCallback(() => persist([]), [persist]);
  const quantityOf = useCallback((listing: string) => items.find((i) => i.listing === listing)?.quantity ?? 0, [items]);

  const value = useMemo(
    () => ({ items, ready, count: items.length, quantityOf, add, setQuantity, remove, clear }),
    [items, ready, quantityOf, add, setQuantity, remove, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
