'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { DataTable } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiTeam, createAiTeamMember, updateAiTeamMember, type AiTeamMemberRow } from '@/lib/aiAdminApi';
import { AI_OPS_ROLE_LABELS } from '@/lib/aiAdminAuth';
import { formatFaDate } from '@/lib/aiAdminTypes';
import { ShieldCheck, Plus } from 'lucide-react';

const ROLE_OPTIONS = ['ai_superadmin', 'ai_finance', 'ai_support', 'ai_ops'];

export default function AiOpsTeamPage() {
  const { data, loading, error, refetch } = useAiOpsFetch(() => fetchAiTeam(), []);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ai_ops' });
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  return (
    <div>
      <AdminPageHeader
        title="تیم و نقش‌ها"
        description="مدیریت اعضای تیم عملیات AI و سطح دسترسی (RBAC) هرکدام."
        icon={ShieldCheck}
        actions={
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 text-sm bg-violet-600 text-white px-3 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> عضو جدید
          </button>
        }
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {loading && <AiOpsLoadingState />}
        {error && <AiOpsErrorState error={error} />}
        {data && (
          <DataTable<AiTeamMemberRow>
            data={data.members}
            keyExtractor={(m) => m.id}
            columns={[
              { key: 'name', header: 'نام', render: (m) => m.name || '—' },
              { key: 'email', header: 'ایمیل', render: (m) => <span dir="ltr">{m.email}</span> },
              { key: 'role', header: 'نقش', render: (m) => AI_OPS_ROLE_LABELS[m.role] ?? m.role },
              { key: 'joined', header: 'عضویت', render: (m) => formatFaDate(m.created_at) },
              { key: 'last_login', header: 'آخرین ورود', render: (m) => formatFaDate(m.last_login_at) },
              {
                key: 'active',
                header: 'وضعیت',
                render: (m) => (
                  <button
                    onClick={async () => {
                      await updateAiTeamMember(m.id, { is_active: !m.is_active });
                      refetch();
                    }}
                  >
                    <StatusBadge
                      label={m.is_active ? 'فعال' : 'غیرفعال'}
                      colorClass={m.is_active ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-slate-50 text-slate-500 ring-slate-200'}
                    />
                  </button>
                ),
              },
            ]}
          />
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md flex flex-col gap-3">
            <h3 className="font-bold text-slate-900 dark:text-white">عضو جدید تیم</h3>
            <input
              placeholder="نام"
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="ایمیل"
              dir="ltr"
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="رمز عبور موقت (حداقل ۸ کاراکتر)"
              type="password"
              dir="ltr"
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <select
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{AI_OPS_ROLE_LABELS[r]}</option>
              ))}
            </select>
            {err && <p className="text-xs text-red-600">{err}</p>}
            <div className="flex gap-2">
              <button
                disabled={busy || !form.name || !form.email || form.password.length < 8}
                onClick={async () => {
                  setBusy(true);
                  setErr('');
                  const res = await createAiTeamMember(form);
                  setBusy(false);
                  if (!res.ok) {
                    setErr(res.error);
                    return;
                  }
                  setCreating(false);
                  setForm({ name: '', email: '', password: '', role: 'ai_ops' });
                  refetch();
                }}
                className="flex-1 bg-violet-600 text-white rounded-lg py-2 text-sm disabled:opacity-50"
              >
                ایجاد
              </button>
              <button onClick={() => setCreating(false)} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg py-2 text-sm dark:text-slate-200">
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
