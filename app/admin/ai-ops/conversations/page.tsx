'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { DataTable } from '@/components/admin/ui/DataTable';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiConversations, type AiConversationRow } from '@/lib/aiAdminApi';
import { formatUsd, formatFaDateTime } from '@/lib/aiAdminTypes';
import { MessagesSquare } from 'lucide-react';

export default function AiOpsConversationsPage() {
  const router = useRouter();
  const [tier, setTier] = useState('');
  const { data, loading, error } = useAiOpsFetch(() => fetchAiConversations({ tier: tier || undefined }), [tier]);

  return (
    <div>
      <AdminPageHeader title="گفتگوها و پاسخ‌های مدل" description="مرور نبردها/گفتگوها، هزینه و توکن هر رکورد." icon={MessagesSquare} />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <FilterBar
          search=""
          onSearchChange={() => {}}
          searchPlaceholder="جستجو (به‌زودی)"
          filters={[
            {
              value: tier,
              onChange: setTier,
              options: [
                { value: '', label: 'همه سطوح' },
                { value: 'economy', label: 'اقتصادی' },
                { value: 'standard', label: 'استاندارد' },
                { value: 'premium', label: 'پرچم‌دار' },
                { value: 'direct', label: 'مستقیم' },
                { value: 'side_by_side', label: 'مقایسه‌ای' },
              ],
            },
          ]}
          count={data?.total}
          countLabel="گفتگو"
        />
        {loading && <AiOpsLoadingState />}
        {error && <AiOpsErrorState error={error} />}
        {data && (
          <DataTable<AiConversationRow>
            data={data.conversations}
            keyExtractor={(c) => c.id}
            onRowClick={(c) => router.push(`/admin/ai-ops/conversations/${c.id}`)}
            columns={[
              { key: 'date', header: 'تاریخ', render: (c) => formatFaDateTime(c.created_at) },
              { key: 'user', header: 'کاربر', render: (c) => <span dir="ltr">{c.user_phone}</span> },
              { key: 'prompt', header: 'پرامپت', render: (c) => <span className="max-w-xs truncate block">{c.prompt}</span> },
              { key: 'models', header: 'مدل‌ها', render: (c) => `${c.model_a}${c.model_b ? ' / ' + c.model_b : ''}` },
              { key: 'tier', header: 'سطح', render: (c) => c.tier },
              { key: 'cost', header: 'هزینه', render: (c) => formatUsd(c.cost_usd) },
              { key: 'credit', header: 'کردیت', render: (c) => c.credit_cost },
            ]}
          />
        )}
      </div>
    </div>
  );
}
