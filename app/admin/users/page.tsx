'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/components/layout/DashboardShell';
import { Pager, ROLE_LABEL, RowLink, Table, Tabs, VerifyBadge } from '@/features/admin/ui';
import { useFetch } from '@/hooks/useFetch';
import { formatDateTime } from '@/lib/orderLabels';
import { adminService } from '@/services/admin.service';

type Role = 'all' | 'customer' | 'farmer' | 'delivery' | 'admin';

export default function UsersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Users_ />
    </Suspense>
  );
}

function Users_() {
  const params = useSearchParams();
  const router = useRouter();
  const role = (params.get('role') as Role) || 'all';
  const status = params.get('status') ?? '';
  const q = params.get('q') ?? '';
  const page = Number(params.get('page') ?? 1);
  const [text, setText] = useState(q);

  // Filters live in the URL, so a view can be shared or bookmarked.
  const go = (next: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams({ role, status, q, page: String(page), ...Object.fromEntries(Object.entries(next).map(([k, v]) => [k, String(v ?? '')])) });
    for (const [k, v] of [...p]) if (!v || (k === 'role' && v === 'all') || (k === 'page' && v === '1')) p.delete(k);
    router.replace(`/admin/users${p.size ? `?${p}` : ''}`);
  };

  const { data, error, loading, reload } = useFetch(['admin', 'users', role, status, q, page], () =>
    adminService.users({ role: role === 'all' ? undefined : role, status: status || undefined, q: q || undefined, page, limit: 25 }),
  );

  return (
    <>
      <PageHeader title="People" description="Customers, farmers, delivery partners and admins. Search by name, mobile number or email." />
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          go({ q: text.trim(), page: 1 });
        }}
      >
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Name, mobile or email" aria-label="Search people" className="max-w-sm" />
        <Button type="submit">
          <Search /> Search
        </Button>
      </form>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Tabs
          label="Role"
          value={role}
          onChange={(r) => go({ role: r, page: 1 })}
          options={[
            { value: 'all', label: 'Everyone' },
            { value: 'customer', label: 'Customers' },
            { value: 'farmer', label: 'Farmers' },
            { value: 'delivery', label: 'Delivery partners' },
            { value: 'admin', label: 'Admins' },
          ]}
        />
        <Tabs
          label="Status"
          value={(status || 'any') as 'any' | 'active' | 'suspended'}
          onChange={(s) => go({ status: s === 'any' ? '' : s, page: 1 })}
          options={[
            { value: 'any', label: 'Any status' },
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
          ]}
        />
      </div>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton className="h-80" />
      ) : !data?.items.length ? (
        <EmptyState icon={Users} title="Nobody matches" description="Try another name or number, or clear the filters." />
      ) : (
        <div className={loading ? 'opacity-60' : ''}>
          <p className="mb-2 text-sm text-soil-muted">{data.meta.total} people</p>
          <Table head={['Name', 'Role', 'Mobile', 'Email', 'Status', 'Joined', '']}>
            {data.items.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2.5 font-semibold">{u.name}</td>
                <td className="px-4 py-2.5">
                  {ROLE_LABEL[u.role]}
                  {u.farmer && (
                    <span className="ml-2 inline-flex gap-1">
                      <VerifyBadge status={u.farmer.profileStatus} />
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">{u.phone ?? '—'}</td>
                <td className="px-4 py-2.5 text-soil-muted">{u.email ?? '—'}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={u.status === 'active' ? 'green' : 'red'}>{u.status}</Badge>
                </td>
                <td className="px-4 py-2.5 text-soil-muted">{formatDateTime(u.createdAt)}</td>
                <td className="px-4 py-2.5">
                  <RowLink href={`/admin/users/${u.id}`}>Open</RowLink>
                </td>
              </tr>
            ))}
          </Table>
          <Pager page={page} totalPages={data.meta.totalPages} onChange={(p) => go({ page: p })} />
        </div>
      )}
    </>
  );
}
