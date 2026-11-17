'use client';

import { useState } from 'react';
import { SafeImage } from './safe-image';
import { cn } from '@/lib/utils';

/** Main photo with square thumbnails underneath. */
export function Gallery({ images, alt, aspect = 'aspect-[4/3]' }: { images: string[]; alt: string; aspect?: string }) {
  const unique = [...new Set(images.filter(Boolean))];
  const [active, setActive] = useState(0);
  const current = unique[active] ?? '';

  return (
    <div>
      <div className={cn('relative overflow-hidden border border-line bg-sand', aspect)}>
        <SafeImage key={current} src={current} alt={alt} fill priority sizes="(min-width: 1024px) 600px, 100vw" />
      </div>
      {unique.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label="More photos">
          {unique.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden border-2 bg-sand',
                  i === active ? 'border-leaf' : 'border-transparent hover:border-line',
                )}
              >
                <SafeImage src={src} alt="" fill sizes="120px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
