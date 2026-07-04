'use client';

import { useParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiConversationDetail } from '@/lib/aiAdminApi';
import { formatUsd, formatFaDateTime } from '@/lib/aiAdminTypes';
import { MessageSquare } from 'lucide-react';

export default function AiOpsConversationDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useAiOpsFetch(() => fetchAiConversationDetail(params.id), [params.id]);

  if (loading) return <AiOpsLoadingState />;
  if (error || !data) return <AiOpsErrorState error={error || 'not_found'} />;

  const c = data.conversation;

  return (
    <div>
      <AdminPageHeader
        title="جزئیات گفتگو"
        description={`${formatFaDateTime(c.created_at)} — کاربر: ${c.user_phone}`}
        icon={MessageSquare}
        breadcrumb={[{ label: 'گفتگوها', href: '/admin/ai-ops/conversations' }, { label: 'جزئیات' }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Mini label="سطح" value={c.tier} />
        <Mini label="هزینه" value={formatUsd(c.cost_usd)} />
        <Mini label="توکن" value={String(c.tokens_used ?? '—')} />
        <Mini label="کردیت مصرفی" value={String(c.credit_cost)} />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-4">
        <p className="text-xs text-slate-400 mb-1">پرامپت</p>
        <p className="text-sm whitespace-pre-wrap dark:text-slate-200">{c.prompt}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-400 mb-1">پاسخ مدل A ({c.model_a})</p>
          <p className="text-sm whitespace-pre-wrap dark:text-slate-200">{c.response_a}</p>
        </div>
        {c.model_b && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">پاسخ مدل B ({c.model_b})</p>
            <p className="text-sm whitespace-pre-wrap dark:text-slate-200">{c.response_b}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
