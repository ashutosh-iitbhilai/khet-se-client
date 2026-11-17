import type { ProductType } from '@/types';

export interface CategoryInfo {
  slug: string;
  label: string;
  hint: string;
  image: string;
}

/**
 * Categories shown for browsing. Only categories with catalogue products are listed
 * (the API also accepts "gourds" and "powders" for later).
 */
export const CATEGORIES: Record<ProductType, CategoryInfo[]> = {
  fresh: [
    { slug: 'leafy-greens', label: 'Leafy greens', hint: 'Palak & more', image: '/images/catalogue/spinach.jpg' },
    { slug: 'fruiting', label: 'Tomato, brinjal & bhindi', hint: 'Everyday sabzi', image: '/images/catalogue/tomato.jpg' },
    { slug: 'roots-tubers', label: 'Roots & tubers', hint: 'Aloo, gajar', image: '/images/catalogue/carrot.jpg' },
    { slug: 'bulbs', label: 'Onion & garlic', hint: 'Pyaaz, lehsun', image: '/images/catalogue/onion.jpg' },
    { slug: 'cruciferous', label: 'Cauliflower & cabbage', hint: 'Gobhi', image: '/images/catalogue/cauliflower.jpg' },
    { slug: 'beans-pods', label: 'Beans & peas', hint: 'Matar, beans', image: '/images/catalogue/green-peas.jpg' },
    { slug: 'herbs', label: 'Herbs', hint: 'Dhaniya', image: '/images/catalogue/coriander.jpg' },
  ],
  dry: [
    { slug: 'sun-dried', label: 'Sun-dried', hint: 'Chilli, tomato, onion', image: '/images/catalogue/dried-red-chilli.jpg' },
    { slug: 'dried-leaves', label: 'Dried leaves', hint: 'Kasuri methi', image: '/images/catalogue/kasuri-methi.jpg' },
    { slug: 'dehydrated-mix', label: 'Dehydrated mixes', hint: 'Just add water', image: '/images/catalogue/dehydrated-vegetable-mix.jpg' },
  ],
};

export const categoryLabel = (slug?: string | null) =>
  [...CATEGORIES.fresh, ...CATEGORIES.dry].find((c) => c.slug === slug)?.label ?? slug ?? '';

export const categoryType = (slug?: string | null): ProductType | undefined =>
  CATEGORIES.fresh.some((c) => c.slug === slug) ? 'fresh' : CATEGORIES.dry.some((c) => c.slug === slug) ? 'dry' : undefined;
