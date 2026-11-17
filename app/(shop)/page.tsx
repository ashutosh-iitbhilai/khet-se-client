import Link from 'next/link';
import { ArrowRight, Leaf, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { IMAGES } from '@/lib/images';
import { NearbyFarmsSection, RecommendedProductsSection } from '@/features/marketplace/NearbySections';
import { CategorySections, HeroSearch, HowItWorks } from '@/features/marketplace/HomeSections';

/**
 * Homepage: hero + search, promises, categories, nearby farms, picked-for-you products,
 * how it works, and a call to farmers.
 */
const promises = [
  { icon: MapPin, title: 'Grown near you', body: 'We match you with farms within a few kilometres of your home.' },
  { icon: ShieldCheck, title: 'Verified organic', body: 'Farmer profiles and organic claims are checked by our team.' },
  { icon: Leaf, title: 'Harvested this week', body: 'Every listing shows its harvest date, so you know how fresh it is.' },
  { icon: Truck, title: 'Straight to your door', body: 'No warehouses, no middlemen — farm to kitchen.' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-soil">
        <SafeImage
          src={IMAGES.heroMarket}
          alt="Fresh carrots, spring onions and greens stacked at a farm stall"
          fill
          priority
          sizes="100vw"
          className="-z-10 opacity-60"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-soil/90 via-soil/60 to-transparent" />
        <div className="section py-24 md:py-36">
          <p className="eyebrow text-sprout">Organic · Local · Direct</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.1] text-white md:text-6xl">
            Fresh from Local Farms to Your Home.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            Khet Se connects you with organic farmers in your city. Buy fresh vegetables and sun-dried produce
            straight from the people who grow them.
          </p>
          <HeroSearch />
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <Link href="/products?type=fresh" className="inline-flex items-center gap-1.5 text-white hover:text-sprout">
              Shop fresh vegetables <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/farmers" className="inline-flex items-center gap-1.5 text-white hover:text-sprout">
              Find farmers near me <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="border-b border-line bg-cream">
        <div className="section grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {promises.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4 px-2 py-8 lg:px-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-sprout text-leaf">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-sans text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-soil-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CategorySections />
      <div className="border-t border-line">
        <NearbyFarmsSection />
      </div>
      <RecommendedProductsSection />
      <HowItWorks />

      {/* Farmer CTA */}
      <section className="section grid items-center gap-10 py-20 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden border border-line">
          <SafeImage
            src={IMAGES.farmRows}
            alt="Young crops growing in neat rows of dark soil"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div>
          <p className="eyebrow">For farmers</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Sell your harvest directly to families nearby.</h2>
          <p className="mt-4 leading-relaxed text-soil-muted">
            List fresh and dry vegetables in minutes, set your own prices, and receive orders from customers in your
            delivery area. Simple enough to use from your phone in the field.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/register?role=farmer">
              Start selling <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
