'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { onApiEvent } from '@/lib/api';
import { areasChangedBy, makeQueryClient } from '@/lib/queryClient';

/**
 * One shared data cache for the whole app. After any successful change (accepting an order,
 * editing stock, placing an order, taking a delivery…) every screen showing affected data
 * refreshes itself; nothing has to remember to reload.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(makeQueryClient);

  useEffect(
    () =>
      onApiEvent((e) => {
        if (e.type !== 'changed') return;
        for (const area of areasChangedBy(e.path)) void client.invalidateQueries({ queryKey: [area] });
      }),
    [client],
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
