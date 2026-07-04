'use client';

import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { DataTable } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiModels, updateAiModel, type AiModelRow } from '@/lib/aiAdminApi';
import { AI_MODEL_TIER_LABELS, AI_MODEL_TIER_COLORS, formatUsd, formatNum } from '@/lib/aiAdminTypes';
import { Cpu } from 'lucide-react';

export default function AiOpsModelsPage() {
  const { data, loading, error, refetch } = useAiOpsFetch(() => fetchAiModels(), []);

  return (
    <div>
      <AdminPageHeader
        title="رجیستری مدل‌های AI"
        description="فعال/غیرفعال کردن مدل‌ها، هزینه هر ۱۰۰۰ توکن و حجم مصرف/هزینه ۳۰ روز اخیر."
        icon={Cpu}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {loading && <AiOpsLoadingState />}
        {error && <AiOpsErrorState error={error} />}
        {data && (
          <DataTable<AiModelRow>
            data={data.models}
            keyExtractor={(m) => m.id}
            columns={[
              { key: 'name', header: 'مدل', render: (m) => <div><p className="font-medium dark:text-white">{m.name}</p><p className="text-xs text-slate-400">{m.persona_name ?? m.route_id}</p></div> },
              { key: 'kind', header: 'نوع', render: (m) => m.kind },
              { key: 'tier', header: 'سطح', render: (m) => <StatusBadge label={AI_MODEL_TIER_LABELS[m.tier] ?? m.tier} colorClass={AI_MODEL_TIER_COLORS[m.tier] ?? ''} /> },
              { key: 'cost', header: 'هزینه/۱۰۰۰ توکن', render: (m) => `$${m.cost_per_1k_tokens}` },
              { key: 'usage', header: 'حجم ۳۰ روز', render: (m) => formatNum(m.usage_count_30d) },
              { key: 'cost30', header: 'هزینه ۳۰ روز', render: (m) => formatUsd(m.cost_usd_30d) },
              {
                key: 'enabled',
                header: 'وضعیت',
                render: (m) => (
                  <button
                    onClick={async () => {
                      await updateAiModel(m.id, { enabled: !m.enabled });
                      refetch();
                    }}
                    className={`text-xs px-3 py-1 rounded-full ring-1 ${
                      m.enabled ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-slate-50 text-slate-500 ring-slate-200'
                    }`}
                  >
                    {m.enabled ? 'فعال' : 'غیرفعال'}
                  </button>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
