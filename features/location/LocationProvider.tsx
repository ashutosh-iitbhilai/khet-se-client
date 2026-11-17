'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LocationDialog } from './LocationDialog';

export interface CustomerLocation {
  lat: number;
  lng: number;
  /** Short human label, e.g. "Shankar Nagar, Raipur". */
  label: string;
  source: 'gps' | 'search' | 'map';
}

interface LocationContextValue {
  location: CustomerLocation | null;
  /** false until the saved location has been read from this browser. */
  ready: boolean;
  setLocation: (l: CustomerLocation) => void;
  clearLocation: () => void;
  openPicker: () => void;
}

const STORAGE_KEY = 'khetse:location';
const LocationContext = createContext<LocationContextValue | null>(null);

function readStored(): CustomerLocation | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as CustomerLocation;
    return Number.isFinite(v.lat) && Number.isFinite(v.lng) && typeof v.label === 'string' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Customer delivery location, remembered per browser. It is a convenience only —
 * the API takes coordinates on every request, so nothing server-side depends on it.
 */
export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLoc] = useState<CustomerLocation | null>(null);
  const [ready, setReady] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    setLoc(readStored());
    setReady(true);
  }, []);

  const setLocation = useCallback((l: CustomerLocation) => {
    setLoc(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
    } catch {
      /* private mode / storage blocked — keep it in memory for this visit */
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLoc(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const openPicker = useCallback(() => setPickerOpen(true), []);

  const value = useMemo(
    () => ({ location, ready, setLocation, clearLocation, openPicker }),
    [location, ready, setLocation, clearLocation, openPicker],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
      <LocationDialog
        open={pickerOpen}
        initial={location}
        onClose={() => setPickerOpen(false)}
        onConfirm={(l) => {
          setLocation(l);
          setPickerOpen(false);
        }}
      />
    </LocationContext.Provider>
  );
}

export function useCustomerLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useCustomerLocation must be used inside <LocationProvider>');
  return ctx;
}
