'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiPrompts, upsertAiPrompt, deleteAiPrompt, type AiPromptRow } from '@/lib/aiAdminApi';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

const EMPTY: Partial<AiPromptRow> = { name: '', category: 'persona', content: '', is_active: true };

export default function AiOpsPromptsPage() {
  const { data, loading, error, refetch } = useAiOpsFetch(() => fetchAiPrompts(), []);
  const [editing, setEditing] = useState<Partial<AiPromptRow> | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <AdminPageHeader
        title="کتابخانه پرامپت"
        description="مدیریت شخصیت‌ها/پرامپت‌های سیستمی و فراوانی استفاده از هرکدام."
        icon={BookOpen}
        actions={
          <button
            onClick={() => setEditing(EMPTY)}
            className="flex items-center gap-1.5 text-sm bg-violet-600 text-white px-3 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" /> پرامپت جدید
          </button>
        }
      />

      {loading && <AiOpsLoadingState />}
      {error && <AiOpsErrorState error={error} />}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.prompts.map((p) => (
            <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">{p.name}</h3>
                <span className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{p.category}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">{p.content}</p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-slate-400">استفاده: {p.usage_count}</span>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(p)} className="text-violet-600 hover:underline">ویرایش</button>
                  <button
                    onClick={async () => {
                      if (!confirm('حذف شود؟')) return;
                      await deleteAiPrompt(p.id);
                      refetch();
                    }}
                    className="text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
          {data.prompts.length === 0 && <p className="text-sm text-slate-400 col-span-full text-center py-10">هنوز پرامپتی ثبت نشده.</p>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-lg flex flex-col gap-3">
            <h3 className="font-bold text-slate-900 dark:text-white">{editing.id ? 'ویرایش پرامپت' : 'پرامپت جدید'}</h3>
            <input
              placeholder="نام"
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
            <select
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={editing.category}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
            >
              <option value="persona">شخصیت</option>
              <option value="system">سیستمی</option>
              <option value="marketing">بازاریابی</option>
              <option value="support">پشتیبانی</option>
            </select>
            <textarea
              placeholder="محتوای پرامپت"
              rows={6}
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
            />
            <div className="flex gap-2">
              <button
                disabled={busy || !editing.name || !editing.content}
                onClick={async () => {
                  setBusy(true);
                  await upsertAiPrompt(editing);
                  setBusy(false);
                  setEditing(null);
                  refetch();
                }}
                className="flex-1 bg-violet-600 text-white rounded-lg py-2 text-sm disabled:opacity-50"
              >
                ذخیره
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg py-2 text-sm dark:text-slate-200">
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
