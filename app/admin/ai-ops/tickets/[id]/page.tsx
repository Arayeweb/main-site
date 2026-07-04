'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiTicketDetail, replyAiTicket } from '@/lib/aiAdminApi';
import { AI_TICKET_STATUS_LABELS, AI_TICKET_STATUS_COLORS, AI_TICKET_PRIORITY_LABELS, formatFaDateTime } from '@/lib/aiAdminTypes';
import { Headphones } from 'lucide-react';

export default function AiOpsTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error, refetch } = useAiOpsFetch(() => fetchAiTicketDetail(params.id), [params.id]);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data?.ticket.admin_reply) setReply(data.ticket.admin_reply);
  }, [data?.ticket.admin_reply]);

  if (loading) return <AiOpsLoadingState />;
  if (error || !data) return <AiOpsErrorState error={error || 'not_found'} />;

  const t = data.ticket;

  return (
    <div>
      <AdminPageHeader
        title={t.subject}
        description={`${t.user_phone} — ${formatFaDateTime(t.created_at)}`}
        icon={Headphones}
        breadcrumb={[{ label: 'تیکت‌ها', href: '/admin/ai-ops/tickets' }, { label: t.subject }]}
        actions={<StatusBadge label={AI_TICKET_STATUS_LABELS[t.status] ?? t.status} colorClass={AI_TICKET_STATUS_COLORS[t.status] ?? ''} size="md" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-2">پیام کاربر</p>
            <p className="text-sm whitespace-pre-wrap dark:text-slate-200">{t.body}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-2">پاسخ ادمین</p>
            <textarea
              rows={6}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              placeholder="پاسخ خود را بنویسید..."
            />
            <button
              disabled={busy || !reply.trim()}
              onClick={async () => {
                setBusy(true);
                await replyAiTicket(t.id, { admin_reply: reply, status: 'answered' });
                setBusy(false);
                refetch();
              }}
              className="mt-3 bg-violet-600 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
            >
              ارسال پاسخ
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-4 h-fit">
          <div>
            <p className="text-xs text-slate-400 mb-1">اولویت</p>
            <div className="flex gap-2">
              {Object.entries(AI_TICKET_PRIORITY_LABELS).map(([id, label]) => (
                <button
                  key={id}
                  onClick={async () => {
                    await replyAiTicket(t.id, { priority: id });
                    refetch();
                  }}
                  className={`px-2.5 py-1 text-xs rounded-full ring-1 ${
                    t.priority === id ? 'bg-violet-600 text-white ring-violet-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 ring-slate-200 dark:ring-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">وضعیت</p>
            <div className="flex flex-col gap-1.5">
              {Object.entries(AI_TICKET_STATUS_LABELS).map(([id, label]) => (
                <button
                  key={id}
                  onClick={async () => {
                    await replyAiTicket(t.id, { status: id });
                    refetch();
                  }}
                  className={`text-right px-3 py-1.5 text-sm rounded-lg border ${
                    t.status === id ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300' : 'border-slate-200 dark:border-slate-700 dark:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
