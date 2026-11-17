import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatKm, freshnessLabel, todayInput, unitLabel, toDateInput } from './labels';
import { CATEGORIES, categoryLabel, categoryType } from './categories';
import { OPTIMIZED_HOSTS, canOptimize } from './imageHosts';
import { GROUP_STATUS, TRACK_STEPS, newKey } from './orderLabels';
import { formatINR } from './utils';
import { stepFor } from '@/features/cart/CartProvider';

describe('labels', () => {
  beforeEach(() => vi.useFakeTimers().setSystemTime(new Date('2026-11-17T10:00:00+05:30')));
  afterEach(() => vi.useRealTimers());

  it('freshness reads naturally', () => {
    const fresh = (days: number) => freshnessLabel({ harvestDate: new Date(Date.now() - days * 86400000).toISOString(), product: { type: 'fresh' } });
    expect(fresh(0)).toBe('Harvested today');
    expect(fresh(1)).toBe('Harvested yesterday');
    expect(fresh(4)).toBe('Harvested 4 days ago');
    expect(freshnessLabel({ expiryDate: '2027-10-01', product: { type: 'dry' } })).toMatch(/^Best before Oct 2027$/);
    expect(freshnessLabel({ product: { type: 'fresh' } })).toBeNull();
  });

  it('units and packet sizes', () => {
    expect(unitLabel('kg')).toBe('kg');
    expect(unitLabel('packet', 250)).toBe('250 g packet');
    expect(unitLabel('packet', 1000)).toBe('1 kg packet');
  });

  it('distances', () => {
    expect(formatKm(0.42)).toBe('420 m');
    expect(formatKm(3.25)).toBe('3.3 km');
    expect(formatKm(14.6)).toBe('15 km');
  });

  it('date inputs use the local calendar day', () => {
    expect(todayInput()).toBe('2026-11-17');
    expect(toDateInput('2026-11-14T00:00:00.000Z')).toBe('2026-11-14');
    expect(toDateInput(undefined)).toBe('');
  });

  it('money in rupees', () => {
    expect(formatINR(1234)).toBe('₹1,234');
  });
});

describe('categories', () => {
  it('know their product type and label', () => {
    expect(categoryType('leafy-greens')).toBe('fresh');
    expect(categoryType('sun-dried')).toBe('dry');
    expect(categoryType('nope')).toBeUndefined();
    expect(categoryLabel('herbs')).toBe('Herbs');
  });

  it('every category tile points at an image that exists', () => {
    for (const c of [...CATEGORIES.fresh, ...CATEGORIES.dry]) {
      expect(() => readFileSync(new URL(`../public${c.image}`, import.meta.url))).not.toThrow();
    }
  });
});

describe('cart quantity steps (mirror the API)', () => {
  it('weight in quarter kilos, everything else whole', () => {
    expect(stepFor('kg')).toBe(0.25);
    expect(stepFor('g')).toBe(0.25);
    expect(stepFor('bunch')).toBe(1);
    expect(stepFor('packet')).toBe(1);
  });
});

describe('images', () => {
  it('only optimises local paths and configured hosts', () => {
    expect(canOptimize('/images/catalogue/tomato.jpg')).toBe(true);
    expect(canOptimize('https://res.cloudinary.com/x/y.jpg')).toBe(true);
    expect(canOptimize('https://example.com/a.jpg')).toBe(false);
    expect(canOptimize('not a url')).toBe(false);
  });

  it('host list matches next.config.ts remotePatterns', () => {
    const config = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');
    for (const host of OPTIMIZED_HOSTS) expect(config).toContain(`hostname: '${host}'`);
  });
});

describe('orders', () => {
  it('has a label for every status on the tracker', () => {
    for (const s of TRACK_STEPS) expect(GROUP_STATUS[s].label).toBeTruthy();
  });

  it('idempotency keys are unique and accepted by the API pattern', () => {
    const keys = new Set(Array.from({ length: 100 }, newKey));
    expect(keys.size).toBe(100);
    for (const k of keys) expect(k).toMatch(/^[A-Za-z0-9_-]{8,100}$/);
  });
});
