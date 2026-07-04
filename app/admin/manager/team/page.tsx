'use client';

import { useMemo, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { UserCheck, Mail, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createAdminUser, deactivateAdminUser, fetchAdminUsers, updateAdminUser } from '@/lib/adminApi';
import { mapUserRow } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { SimpleFormModal } from '@/components/admin/ui/SimpleFormModal';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-slate-900 text-white',
  sales: 'bg-green-100 text-green-700',
  support: 'bg-teal-100 text-teal-700',
};

const ROLE_OPTIONS = ['admin', 'sales', 'support'];

export default function TeamPage() {
  const { data, loading, error, refetch } = useAdminFetch(() => fetchAdminUsers(), []);
  const members = useMemo(() => (data?.users ?? []).map(mapUserRow), [data]);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'sales' });

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="تیم"
        description="اعضای تیم آرایه"
        icon={UserCheck}
        breadcrumb={[{ label: 'مدیریت' }, { label: 'تیم' }]}
        actions={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            عضو جدید
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-sm">{member.name}</h3>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[member.role] ?? 'bg-slate-100 text-slate-700')}>
                    {member.roleLabel}
                  </span>
                  {!member.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">غیرفعال</span>
                  )}
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="w-3 h-3" />
                    <span dir="ltr">{member.email}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">عضویت از {member.joinDate} · آخرین ورود: {member.lastLogin}</p>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
                onClick={async () => {
                  await updateAdminUser(member.id, { is_active: !member.isActive });
                  refetch();
                }}
              >
                {member.isActive ? 'غیرفعال' : 'فعال‌سازی'}
              </button>
              <button
                type="button"
                className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                onClick={async () => {
                  if (!confirm(`حذف ${member.name}؟`)) return;
                  await deactivateAdminUser(member.id);
                  refetch();
                }}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      <SimpleFormModal
        title="عضو جدید تیم"
        open={creating}
        onClose={() => setCreating(false)}
        busy={busy}
        error={formError}
        submitLabel="ایجاد"
        onSubmit={async () => {
          setBusy(true);
          setFormError('');
          const res = await createAdminUser(form);
          setBusy(false);
          if (!res.ok) {
            setFormError(res.error);
            return;
          }
          setCreating(false);
          setForm({ name: '', email: '', password: '', role: 'sales' });
          refetch();
        }}
      >
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="نام" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="ایمیل" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="رمز عبور" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </SimpleFormModal>
    </div>
  );
}
