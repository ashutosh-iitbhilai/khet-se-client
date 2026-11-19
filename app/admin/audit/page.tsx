'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/components/layout/DashboardShell';
import { actionLabel } from '@/features/admin/ActionLog';
import { Pager, Table } from '@/features/admin/ui';
import { useFetch } from '@/hooks/useFetch';
import { formatDateTime } from '@/lib/orderLabels';
import { adminService } from '@/services/admin.service';

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useFetch(['admin', 'audit', page], () => adminService.audit(page));
  return (
    <>
      <PageHeader title="Audit trail" description="Every admin decision: who did what, when and why. Records cannot be edited." />
      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton className="h-80" />
      ) : !data?.items.length ? (
        <EmptyState icon={ScrollText} title="No admin actions yet" />
      ) : (
        <>
          <Table head={['When', 'Admin', 'Action', 'About', 'Reason']}>
            {data.items.map((a) => (
              <tr key={a.id}>
                <td className="whitespace-nowrap px-4 py-2.5 text-soil-muted">{formatDateTime(a.at)}</td>
                <td className="px-4 py-2.5">{a.by ?? '—'}</td>
                <td className="px-4 py-2.5 font-semibold">{actionLabel(a.action)}</td>
                <td className="px-4 py-2.5">
                  {a.targetType === 'order' ? (
                    <Link className="text-leaf hover:underline" href={`/admin/orders/${a.targetId}`}>
                      {a.target}
                    </Link>
                  ) : a.targetType === 'user' ? (
                    <Link className="text-leaf hover:underline" href={`/admin/users/${a.targetId}`}>
                      {a.target}
                    </Link>
                  ) : (
                    a.target
                  )}
                </td>
                <td className="px-4 py-2.5 text-soil-muted">{a.note ?? '—'}</td>
              </tr>
            ))}
          </Table>
          <Pager page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}
