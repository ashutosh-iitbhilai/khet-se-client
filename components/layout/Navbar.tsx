'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Search, ShoppingBag, User as UserIcon } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { useAuth, homeForRole } from '@/features/auth/AuthProvider';
import { LocationChip } from '@/features/location/LocationChip';
import { useCart } from '@/features/cart/CartProvider';

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const { count } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="section flex h-16 items-center gap-4">
        <Logo />

        <LocationChip className="hidden md:inline-flex" />

        <form role="search" action="/products" className="ml-auto hidden max-w-sm flex-1 lg:block">
          <label htmlFor="nav-search" className="sr-only">
            Search vegetables
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-muted" />
            <input
              id="nav-search"
              name="q"
              placeholder="Search tomatoes, spinach, dried chilli…"
              className="h-10 w-full border border-line bg-cream pl-9 pr-3 text-sm placeholder:text-soil-muted/70 focus-visible:border-leaf focus-visible:bg-white focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-1 lg:ml-2">
          <Link href="/cart" className="relative p-2.5 text-soil hover:text-leaf" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center bg-leaf px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          {loading ? (
            <div className="h-9 w-24 animate-pulse bg-sand" aria-hidden />
          ) : user ? (
            <>
              <Link
                href={homeForRole(user.role) === '/' ? '/account' : homeForRole(user.role)}
                className="hidden items-center gap-2 px-2 py-2 text-sm font-medium hover:text-leaf sm:inline-flex"
              >
                <UserIcon className="h-4 w-4" />
                {user.name.split(' ')[0]}
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                <LogOut />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
      {/* Phones: location gets its own row so it is always one tap away. */}
      <div className="section pb-2 md:hidden">
        <LocationChip className="w-full max-w-none" />
      </div>
    </header>
  );
}
