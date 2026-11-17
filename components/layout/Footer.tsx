import Link from 'next/link';
import { Logo } from './Logo';

const columns = [
  {
    title: 'Shop',
    links: [
      { href: '/products?type=fresh', label: 'Fresh vegetables' },
      { href: '/products?type=dry', label: 'Dry vegetables' },
      { href: '/farmers', label: 'Nearby farmers' },
    ],
  },
  {
    title: 'For farmers',
    links: [
      { href: '/register?role=farmer', label: 'Sell on Khet Se' },
      { href: '/farmer', label: 'Farmer dashboard' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/login', label: 'Log in' },
      { href: '/account', label: 'My orders' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-leaf-dark text-white/80">
      <div className="section grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo inverted />
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            Fresh organic vegetables and dry produce, straight from farms in your city — no middlemen.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-white">{col.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="section flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Khet Se. Grown locally.</p>
          <p>
            Made for farmers and families ·{' '}
            <Link href="/credits" className="hover:text-white">
              Photo credits
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
