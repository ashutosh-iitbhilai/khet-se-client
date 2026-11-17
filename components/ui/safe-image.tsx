'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { canOptimize } from '@/lib/imageHosts';

/**
 * next/image with a branded fallback tile when the image fails to load.
 * Farmer-pasted links from other hosts are shown unoptimised instead of erroring.
 * Always used inside a sized, `relative` parent with `fill`.
 */
export function SafeImage({ className, alt, src, unoptimized, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={cn('absolute inset-0 flex items-center justify-center bg-sand text-leaf/50', className)}>
        <Sprout className="h-10 w-10" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      src={src}
      unoptimized={unoptimized ?? !canOptimize(src)}
      className={cn('object-cover', className)}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
