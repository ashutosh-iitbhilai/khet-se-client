import { describe, expect, it } from 'vitest';
import { areasChangedBy } from './queryClient';
import { normalizePhone } from '@/features/auth/schemas';

describe('what a change refreshes', () => {
  it('order and delivery actions refresh every role’s order views and stock', () => {
    expect(areasChangedBy('/orders/1/status')).toEqual(expect.arrayContaining(['orders', 'farmer', 'delivery', 'market']));
    expect(areasChangedBy('/delivery/jobs/1/accept')).toEqual(expect.arrayContaining(['delivery', 'orders', 'farmer']));
    expect(areasChangedBy('/inventory/1/stock')).toEqual(expect.arrayContaining(['inventory', 'market']));
    expect(areasChangedBy('/addresses')).toEqual(['addresses']);
    expect(areasChangedBy('/geo/search')).toEqual([]);
  });
});

describe('mobile numbers', () => {
  it('accepts the ways people write Indian mobile numbers', () => {
    for (const v of ['9876543210', '+91 98765 43210', '+919876543210', '098765-43210', '91 9876543210']) expect(normalizePhone(v)).toBe('9876543210');
  });
});
