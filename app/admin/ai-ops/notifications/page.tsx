'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiNotifications, createAiNotification } from '@/lib/aiAdminApi';
import { AI_NOTIF_STATUS_LABELS, AI_NOTIF_STATUS_COLORS, AI_PLAN_LABELS, formatFaDateTime } from '@/lib/aiAdminTypes';
import { Bell, Send } from 'lucide-react';

export default function AiOpsNotificationsPage() {
  const { data, loading, error, refetch } = useAiOpsFetch(() => fetchAiNotifications(), []);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [plan, setPlan] = useState('starter');
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <AdminPageHeader title="اعلان‌ها" description="ارسال اعلان سیستمی/broadcast به کاربران و لاگ ارسال." icon={Bell} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {loading && <AiOpsLoadingState />}
          {error && <AiOpsErrorState error={error} />}
          {data && (
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                  <th className="text-right px-4 py-3">عنوان</th>
                  <th className="text-right px-4 py-3">مخاطب</th>
                  <th className="text-right px-4 py-3">وضعیت</th>
                  <th className="text-right px-4 py-3">تعداد دریافت‌کننده</th>
                  <th className="text-right px-4 py-3">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {data.notifications.map((n) => (
                  <tr key={n.id}>
                    <td className="px-4 py-3 dark:text-slate-200">{n.title}</td>
                    <td className="px-4 py-3 dark:text-slate-200">{n.audience === 'plan' ? AI_PLAN_LABELS[n.target_plan ?? ''] ?? n.target_plan : 'همه'}</td>
                    <td className="px-4 py-3"><StatusBadge label={AI_NOTIF_STATUS_LABELS[n.status] ?? n.status} colorClass={AI_NOTIF_STATUS_COLORS[n.status] ?? ''} /></td>
                    <td className="px-4 py-3 dark:text-slate-200">{n.sent_count}</td>
                    <td className="px-4 py-3 text-slate-400">{formatFaDateTime(n.created_at)}</td>
                  </tr>
                ))}
                {data.notifications.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400">اعلانی ثبت نشده</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-3 h-fit">
          <h3 className="font-bold text-slate-900 dark:text-white">اعلان جدید</h3>
          <input
            placeholder="عنوان"
            className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="متن اعلان"
            rows={4}
            className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <select
            className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            <option value="all">همه کاربران</option>
            <option value="plan">بر اساس پلن</option>
          </select>
          {audience === 'plan' && (
            <select
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              {Object.entries(AI_PLAN_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          )}
          <button
            disabled={busy || !title || !body}
            onClick={async () => {
              setBusy(true);
              await createAiNotification({ title, body, audience, target_plan: audience === 'plan' ? plan : undefined, send_now: true });
              setBusy(false);
              setTitle('');
              setBody('');
              refetch();
            }}
            className="flex items-center justify-center gap-2 bg-violet-600 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> ارسال
          </button>
          <p className="text-[11px] text-slate-400">
            TODO: تحویل واقعی (push/SMS/ایمیل) به کانال ارسال متصل نشده — فعلاً فقط رکورد و شمار مخاطب ثبت می‌شود.
          </p>
        </div>
      </div>
    </div>
  );
}
