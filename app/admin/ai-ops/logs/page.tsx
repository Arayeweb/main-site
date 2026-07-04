'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiLogs } from '@/lib/aiAdminApi';
import { formatFaDateTime } from '@/lib/aiAdminTypes';
import { ScrollText } from 'lucide-react';

export default function AiOpsLogsPage() {
  const [kind, setKind] = useState('');
  const { data, loading, error } = useAiOpsFetch(() => fetchAiLogs({ kind: kind || undefined }), [kind]);

  return (
    <div>
      <AdminPageHeader title="لاگ‌ها و وضعیت سیستم" description="لاگ درخواست‌های مدل و لاگ اقدامات ادمین (audit)." icon={ScrollText} />

      <div className="flex gap-2 mb-4">
        {[
          { id: '', label: 'همه' },
          { id: 'request', label: 'درخواست‌های مدل' },
          { id: 'audit', label: 'اقدامات ادمین' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setKind(f.id)}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              kind === f.id ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 dark:border-slate-700 dark:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {loading && <AiOpsLoadingState />}
        {error && <AiOpsErrorState error={error} />}
        {data && (
          <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[70vh] overflow-y-auto">
            {data.logs.map((l) => (
              <div key={l.id} className="px-4 py-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{l.summary}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{l.detail}</p>
                </div>
                <div className="text-left shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${l.kind === 'audit' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>
                    {l.kind === 'audit' ? 'ادمین' : 'درخواست'}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{formatFaDateTime(l.created_at)}</p>
                  {l.actor && <p className="text-[11px] text-slate-400">{l.actor}</p>}
                </div>
              </div>
            ))}
            {data.logs.length === 0 && <p className="text-center py-10 text-sm text-slate-400">لاگی ثبت نشده</p>}
          </div>
        )}
      </div>
    </div>
  );
}
