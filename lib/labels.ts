import type { FarmingPractice, Unit, VerificationStatus } from '@/types';

export const CATEGORY_LABELS: Record<string, string> = {
  'leafy-greens': 'Leafy greens',
  'roots-tubers': 'Roots & tubers',
  bulbs: 'Onion & garlic',
  fruiting: 'Tomato, brinjal & more',
  cruciferous: 'Cauliflower & cabbage',
  'beans-pods': 'Beans & peas',
  gourds: 'Gourds',
  herbs: 'Herbs',
  'sun-dried': 'Sun-dried',
  'dried-leaves': 'Dried leaves',
  'dehydrated-mix': 'Dehydrated mixes',
  powders: 'Powders',
};

export const UNIT_LABELS: Record<Unit, string> = {
  kg: 'kg',
  g: 'gram',
  bunch: 'bunch',
  piece: 'piece',
  dozen: 'dozen',
  packet: 'packet',
};

export const PRACTICE_LABELS: Record<FarmingPractice, string> = {
  'certified-organic': 'Certified organic',
  'natural-farming': 'Natural farming',
  'no-chemical-pesticides': 'No chemical pesticides',
  'drip-irrigation': 'Drip irrigation',
  vermicompost: 'Vermicompost',
  'crop-rotation': 'Crop rotation',
};

export const STATUS_LABELS: Record<VerificationStatus, string> = {
  unsubmitted: 'Not submitted',
  pending: 'Under review',
  verified: 'Verified',
  rejected: 'Needs changes',
};

/** "YYYY-MM-DD" for <input type="date"> from an ISO string. */
export const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : '');

export const todayInput = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "Harvested today" / "Best before Oct 2027" — the one freshness line shown on cards. */
export function freshnessLabel(l: { harvestDate?: string; expiryDate?: string; product: { type: 'fresh' | 'dry' } }) {
  if (l.product.type === 'fresh') {
    const d = daysAgo(l.harvestDate);
    if (d === null) return null;
    return d === 0 ? 'Harvested today' : d === 1 ? 'Harvested yesterday' : `Harvested ${d} days ago`;
  }
  if (!l.expiryDate) return null;
  return `Best before ${new Date(l.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;
}

/** "250 g packet", "kg", "bunch" */
export function unitLabel(unit: keyof typeof UNIT_LABELS, packSizeGrams?: number) {
  if (unit === 'packet' && packSizeGrams) return `${packSizeGrams >= 1000 ? `${packSizeGrams / 1000} kg` : `${packSizeGrams} g`} packet`;
  return UNIT_LABELS[unit];
}

export const formatKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`);

export function daysAgo(iso?: string) {
  if (!iso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}
