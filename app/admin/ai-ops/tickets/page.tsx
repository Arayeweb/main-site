'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { DataTable } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiTickets, type AiTicketRow } from '@/lib/aiAdminApi';
import {
  AI_TICKET_STATUS_LABELS, AI_TICKET_STATUS_COLORS, AI_TICKET_PRIORITY_LABELS, AI_TICKET_PRIORITY_COLORS, formatFaDateTime,
} from '@/lib/aiAdminTypes';
import { Headphones } from 'lucide-react';

export default function AiOpsTicketsPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const { data, loading, error } = useAiOpsFetch(() => fetchAiTickets({ status: status || undefined }), [status]);

  return (
    <div>
      <AdminPageHeader title="تیکت‌های پشتیبانی" description="تیکت‌های کاربران محصول Araaye AI — پاسخ، وضعیت و اولویت." icon={Headphones} />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <FilterBar
          search=""
          onSearchChange={() => {}}
          filters={[
            {
              value: status,
              onChange: setStatus,
              options: [{ value: '', label: 'همه وضعیت‌ها' }, ...Object.entries(AI_TICKET_STATUS_LABELS).map(([value, label]) => ({ value, label }))],
            },
          ]}
          count={data?.tickets.length}
          countLabel="تیکت"
        />
        {loading && <AiOpsLoadingState />}
        {error && <AiOpsErrorState error={error} />}
        {data && (
          <DataTable<AiTicketRow>
            data={data.tickets}
            keyExtractor={(t) => t.id}
            onRowClick={(t) => router.push(`/admin/ai-ops/tickets/${t.id}`)}
            columns={[
              { key: 'date', header: 'تاریخ', render: (t) => formatFaDateTime(t.created_at) },
              { key: 'phone', header: 'کاربر', render: (t) => <span dir="ltr">{t.user_phone}</span> },
              { key: 'subject', header: 'موضوع', render: (t) => t.subject },
              { key: 'priority', header: 'اولویت', render: (t) => <StatusBadge label={AI_TICKET_PRIORITY_LABELS[t.priority] ?? t.priority} colorClass={AI_TICKET_PRIORITY_COLORS[t.priority] ?? ''} /> },
              { key: 'status', header: 'وضعیت', render: (t) => <StatusBadge label={AI_TICKET_STATUS_LABELS[t.status] ?? t.status} colorClass={AI_TICKET_STATUS_COLORS[t.status] ?? ''} /> },
              { key: 'updated', header: 'آخرین به‌روزرسانی', render: (t) => formatFaDateTime(t.updated_at) },
            ]}
          />
        )}
      </div>
    </div>
  );
}
