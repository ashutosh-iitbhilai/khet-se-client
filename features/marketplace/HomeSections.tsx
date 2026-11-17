import Link from 'next/link';
import { ArrowUpRight, MapPin, Search, ShoppingBasket, Truck } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { CATEGORIES, type CategoryInfo } from '@/lib/categories';
import { IMAGES } from '@/lib/images';
import type { ProductType } from '@/types';

/** Plain GET form → /products?q=… (works without JavaScript). */
export function HeroSearch() {
  return (
    <form role="search" action="/products" className="mt-8 flex max-w-xl">
      <label htmlFor="hero-search" className="sr-only">
        Search vegetables
      </label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-soil-muted" aria-hidden />
        <input
          id="hero-search"
          name="q"
          placeholder="Search tomato, palak, dried chilli…"
          className="h-14 w-full border-0 bg-white pl-12 pr-3 text-base text-soil placeholder:text-soil-muted/70 focus-visible:ring-2 focus-visible:ring-sprout focus-visible:ring-offset-0"
        />
      </div>
      <button type="submit" className="h-14 bg-leaf px-6 text-sm font-semibold text-white hover:bg-leaf-dark">
        Search
      </button>
    </form>
  );
}

function CategoryTile({ c, type }: { c: CategoryInfo; type: ProductType }) {
  return (
    <Link href={`/products?type=${type}&category=${c.slug}`} className="group block border border-line bg-white hover:border-leaf">
      <div className="relative aspect-square overflow-hidden bg-sand">
        <SafeImage src={c.image} alt="" fill sizes="(min-width: 1024px) 170px, 33vw" className="transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug">{c.label}</p>
          <p className="truncate text-xs text-soil-muted">{c.hint}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-soil-muted group-hover:text-leaf" aria-hidden />
      </div>
    </Link>
  );
}

export function CategorySections() {
  return (
    <section className="section py-16 md:py-20" aria-labelledby="categories">
      <div className="grid gap-12 lg:grid-cols-[2.4fr_1fr]">
        <div>
          <p className="eyebrow">Fresh vegetables</p>
          <h2 id="categories" className="mt-2 text-3xl font-semibold md:text-4xl">
            Picked this week
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
            {CATEGORIES.fresh.map((c) => (
              <CategoryTile key={c.slug} c={c} type="fresh" />
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow">Dry vegetables</p>
          <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Sun-dried</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-2">
            {CATEGORIES.dry.map((c) => (
              <CategoryTile key={c.slug} c={c} type="dry" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: MapPin, title: 'Set your location', body: 'Tell us where to deliver. We only show farms whose delivery area reaches you.' },
  { icon: Search, title: 'Choose from local farms', body: 'Compare farmers by distance, freshness, price and rating — every listing shows its harvest date.' },
  { icon: ShoppingBasket, title: 'Order from several farms at once', body: 'One checkout, even when your basket comes from different farmers.' },
  { icon: Truck, title: 'Farmers deliver to you', body: 'Each farmer packs and delivers their part of your order directly.' },
];

export function HowItWorks() {
  return (
    <section className="border-y border-line bg-white" aria-labelledby="how-it-works">
      <div className="section grid gap-12 py-16 md:py-20 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 id="how-it-works" className="mt-2 text-3xl font-semibold md:text-4xl">
            From the khet to your kitchen, in four steps.
          </h2>
          <div className="relative mt-8 aspect-[4/3] overflow-hidden border border-line">
            <SafeImage src={IMAGES.farmPunjabHarvest} alt="Crates of freshly harvested vegetables in a farm field" fill sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
        </div>
        <ol className="grid content-start gap-px border border-line bg-line sm:grid-cols-2">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center bg-sprout text-leaf">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-display text-3xl font-semibold text-line">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-sans text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-soil-muted">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

