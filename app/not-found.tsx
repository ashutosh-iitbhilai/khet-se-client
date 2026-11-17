import Link from 'next/link';
import { Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center bg-sprout text-leaf">
        <Sprout className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-semibold">This page hasn’t sprouted yet</h1>
      <p className="mt-2 max-w-md text-sm text-soil-muted">
        The page you’re looking for doesn’t exist or is still being planted.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  );
}
