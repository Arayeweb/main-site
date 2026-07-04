'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { DataTable } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiUsers, type AiUserRow } from '@/lib/aiAdminApi';
import { AI_PLAN_LABELS, AI_USER_STATUS_LABELS, AI_USER_STATUS_COLORS, formatToman, formatUsd, formatFaDate } from '@/lib/aiAdminTypes';
import { Users } from 'lucide-react';

export default function AiOpsUsersPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');

  const { data, loading, error } = useAiOpsFetch(
    () => fetchAiUsers({ q: q || undefined, plan: plan || undefined, status: status || undefined }),
    [q, plan, status]
  );

  return (
    <div>
      <AdminPageHeader title="کاربران" description="لیست کاربران، فیلتر بر اساس پلن/وضعیت و پروفایل سودآوری هر کاربر." icon={Users} />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <FilterBar
          search={q}
          onSearchChange={setQ}
          searchPlaceholder="جستجو با شماره موبایل..."
          filters={[
            {
              value: plan,
              onChange: setPlan,
              options: [{ value: '', label: 'همه پلن‌ها' }, ...Object.entries(AI_PLAN_LABELS).map(([value, label]) => ({ value, label }))],
            },
            {
              value: status,
              onChange: setStatus,
              options: [{ value: '', label: 'همه وضعیت‌ها' }, ...Object.entries(AI_USER_STATUS_LABELS).map(([value, label]) => ({ value, label }))],
            },
          ]}
          count={data?.total}
          countLabel="کاربر"
        />

        {loading && <AiOpsLoadingState />}
        {error && <AiOpsErrorState error={error} />}

        {data && (
          <DataTable<AiUserRow>
            data={data.users}
            keyExtractor={(u) => u.id}
            onRowClick={(u) => router.push(`/admin/ai-ops/users/${u.id}`)}
            columns={[
              { key: 'phone', header: 'موبایل', render: (u) => <span dir="ltr">{u.phone}</span> },
              { key: 'plan', header: 'پلن', render: (u) => AI_PLAN_LABELS[u.plan] ?? u.plan },
              {
                key: 'status',
                header: 'وضعیت',
                render: (u) => <StatusBadge label={AI_USER_STATUS_LABELS[u.status] ?? u.status} colorClass={AI_USER_STATUS_COLORS[u.status] ?? ''} />,
              },
              { key: 'credits', header: 'کردیت', render: (u) => u.credits },
              { key: 'spend', header: 'هزینه پرداختی', render: (u) => formatToman(u.total_spend_toman) },
              { key: 'cost', header: 'هزینه API', render: (u) => formatUsd(u.total_cost_usd) },
              { key: 'created', header: 'عضویت', render: (u) => formatFaDate(u.created_at) },
              { key: 'last_login', header: 'آخرین ورود', render: (u) => formatFaDate(u.last_login_at) },
            ]}
          />
        )}
      </div>
    </div>
  );
}
