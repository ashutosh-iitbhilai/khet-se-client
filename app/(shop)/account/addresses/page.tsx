'use client';

import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { AddressForm, AddressText } from '@/features/account/AddressForm';
import { useFetch } from '@/hooks/useFetch';
import { addressService } from '@/services/order.service';
import type { Address } from '@/types';

export default function AddressesPage() {
  const { data, error, loading, reload, setData } = useFetch(['addresses'], () => addressService.list());
  const [editing, setEditing] = useState<Address | 'new' | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const list = data?.addresses ?? [];

  const act = async (id: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setBusyId(id);
    try {
      await fn();
      await reload();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) return <Skeleton className="h-48" />;

  return (
    <div className="max-w-3xl space-y-4">
      {actionError && <Alert>{actionError}</Alert>}

      {editing && (
        <section className="border border-line bg-white p-5 sm:p-6">
          <h2 className="mb-4 font-sans text-base font-semibold">{editing === 'new' ? 'New address' : 'Edit address'}</h2>
          <AddressForm
            address={editing === 'new' ? undefined : editing}
            onSaved={() => {
              setEditing(null);
              void reload();
            }}
            onCancel={() => setEditing(null)}
          />
        </section>
      )}

      {!editing && (
        <Button variant="outline" onClick={() => setEditing('new')}>
          <Plus /> Add address
        </Button>
      )}

      {list.length === 0 && !editing && (
        <EmptyState icon={MapPin} title="No saved addresses" description="Add one now, or save it during checkout." />
      )}

      <ul className="space-y-3">
        {list.map((a) => (
          <li key={a.id} className="flex flex-col gap-4 border border-line bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-soil-muted">{a.label}</span>
                {a.isDefault && <Badge tone="green">Default</Badge>}
              </div>
              <AddressText a={a} />
            </div>
            <div className="flex shrink-0 gap-2">
              {!a.isDefault && (
                <Button size="sm" variant="ghost" disabled={busyId === a.id} onClick={() => act(a.id, () => addressService.update(a.id, { isDefault: true }))}>
                  Make default
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setEditing(a)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-danger"
                disabled={busyId === a.id}
                onClick={() => {
                  setData((d) => ({ addresses: (d?.addresses ?? []).filter((x) => x.id !== a.id) }));
                  void act(a.id, () => addressService.remove(a.id));
                }}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
