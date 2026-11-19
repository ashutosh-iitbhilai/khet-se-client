'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthProvider';

/** Ends every session of this account — use after a lost phone or a shared computer. */
export function SignOutEverywhere() {
  const { logoutAll } = useAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    setBusy(true);
    try {
      await logoutAll();
      router.replace('/login');
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-sans text-base font-semibold">Signed-in devices</h3>
      <p className="text-sm text-soil-muted">
        Lost a phone or used a shared computer? Sign out everywhere, including this device. You will need to log in again.
      </p>
      {error && <Alert>{error}</Alert>}
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          Sign out of all devices?
          <Button size="sm" className="bg-danger hover:bg-danger/90" loading={busy} onClick={run}>
            Yes, sign out everywhere
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>
            Keep me signed in
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setConfirming(true)}>
          <LogOut /> Sign out of all devices
        </Button>
      )}
    </div>
  );
}
