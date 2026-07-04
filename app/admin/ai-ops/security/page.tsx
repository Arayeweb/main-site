'use client';

import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiAuditLog, fetchAiTeam } from '@/lib/aiAdminApi';
import { AI_OPS_ROLE_LABELS } from '@/lib/aiAdminAuth';
import { formatFaDateTime } from '@/lib/aiAdminTypes';
import { Lock } from 'lucide-react';

export default function AiOpsSecurityPage() {
  const audit = useAiOpsFetch(() => fetchAiAuditLog(), []);
  const team = useAiOpsFetch(() => fetchAiTeam(), []);

  return (
    <div>
      <AdminPageHeader title="امنیت" description="لاگ حسابرسی اقدامات ادمین و آخرین ورود اعضای تیم." icon={Lock} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white px-5 pt-4 pb-2">لاگ حسابرسی</h3>
          {audit.loading && <AiOpsLoadingState />}
          {audit.error && <AiOpsErrorState error={audit.error} />}
          {audit.data && (
            <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[65vh] overflow-y-auto">
              {audit.data.entries.map((e) => (
                <div key={e.id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{e.action}</p>
                    <p className="text-xs text-slate-400">{e.entity_type} {e.entity_id}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{e.admin_name ?? '—'} ({e.admin_role ? AI_OPS_ROLE_LABELS[e.admin_role] ?? e.admin_role : '—'})</p>
                    <p className="text-[11px] text-slate-400">{formatFaDateTime(e.created_at)}</p>
                  </div>
                </div>
              ))}
              {audit.data.entries.length === 0 && <p className="text-center py-10 text-sm text-slate-400">هنوز اقدامی ثبت نشده</p>}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">آخرین ورود اعضای تیم</h3>
          {team.loading && <AiOpsLoadingState />}
          {team.data && (
            <div className="flex flex-col gap-2">
              {team.data.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0">
                  <span className="text-slate-700 dark:text-slate-200">{m.name || m.email}</span>
                  <span className="text-xs text-slate-400">{formatFaDateTime(m.last_login_at)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-4">
            TODO: لیست دستگاه/IP هر نشست و allowlist آی‌پی هنوز پیاده‌سازی نشده — به داده device/IP در توکن نشست فعلی نیاز دارد.
          </p>
        </div>
      </div>
    </div>
  );
}
