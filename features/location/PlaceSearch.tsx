'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';
import { geoService } from '@/services/geo.service';
import { ApiError } from '@/lib/api';
import type { GeoPlace } from '@/types';

/** Debounced OpenStreetMap place search (via our API). */
export function PlaceSearch({ onSelect }: { onSelect: (place: GeoPlace) => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 3) {
      setResults([]);
      setError(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { places } = await geoService.search(q.trim(), ctrl.signal);
        setResults(places);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setError(err instanceof ApiError ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Close the list when clicking elsewhere.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <label htmlFor="place-search" className="sr-only">
        Search village, town or landmark
      </label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-muted" />
      <input
        id="place-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder="Search village, town or landmark"
        autoComplete="off"
        className="h-11 w-full border border-line bg-white pl-9 pr-9 text-sm focus-visible:border-leaf focus-visible:ring-1 focus-visible:ring-leaf focus-visible:ring-offset-0"
      />
      {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-soil-muted" />}

      {open && (results.length > 0 || error) && (
        <ul className="absolute z-[1000] mt-1 max-h-72 w-full overflow-auto border border-line bg-white shadow-soft" role="listbox">
          {error && <li className="px-3 py-2.5 text-sm text-danger">{error}</li>}
          {results.map((p) => (
            <li key={`${p.lat},${p.lng}`}>
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-cream"
                onClick={() => {
                  onSelect(p);
                  setOpen(false);
                  setQ('');
                }}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                <span className="line-clamp-2">{p.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
