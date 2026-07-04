'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiContent, upsertAiContent, type AiContentBlockRow } from '@/lib/aiAdminApi';
import { formatFaDateTime } from '@/lib/aiAdminTypes';
import { FileText, Plus } from 'lucide-react';
import { SimpleFormModal } from '@/components/admin/ui/SimpleFormModal';

export default function AiOpsContentPage() {
  const { data, loading, error, refetch } = useAiOpsFetch(() => fetchAiContent(), []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [newBlock, setNewBlock] = useState({ id: '', title: '', body: '' });
  const [createError, setCreateError] = useState('');

  return (
    <div>
      <AdminPageHeader
        title="محتوا"
        description="بلوک‌های محتوای قابل ویرایش محصول — بنر اعلامیه، قوانین لیدربورد، معرفی لندینگ."
        icon={FileText}
        actions={
          <button type="button" onClick={() => setCreating(true)} className="flex items-center gap-1.5 text-sm bg-violet-600 text-white px-3 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> بلوک جدید
          </button>
        }
      />

      {loading && <AiOpsLoadingState />}
      {error && <AiOpsErrorState error={error} />}

      {data && data.blocks.length === 0 && (
        <p className="text-sm text-slate-500 mb-4">هنوز بلوکی ثبت نشده — یک بلوک جدید بسازید.</p>
      )}

      {data && (
        <div className="flex flex-col gap-4">
          {data.blocks.map((b: AiContentBlockRow) => (
            <div key={b.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{b.title}</h3>
                  <p className="text-xs text-slate-400">آخرین ویرایش: {formatFaDateTime(b.updated_at)}</p>
                </div>
                <label className="flex items-center gap-2 text-sm dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={b.is_published}
                    onChange={async (e) => {
                      setBusyId(b.id);
                      await upsertAiContent({ ...b, is_published: e.target.checked });
                      setBusyId(null);
                      refetch();
                    }}
                  />
                  منتشرشده
                </label>
              </div>
              <textarea
                rows={4}
                defaultValue={b.body}
                onChange={(e) => setDrafts((d) => ({ ...d, [b.id]: e.target.value }))}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              />
              <button
                disabled={busyId === b.id}
                onClick={async () => {
                  setBusyId(b.id);
                  await upsertAiContent({ ...b, body: drafts[b.id] ?? b.body });
                  setBusyId(null);
                  refetch();
                }}
                className="mt-2 text-sm bg-violet-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-50"
              >
                ذخیره
              </button>
            </div>
          ))}
        </div>
      )}

      <SimpleFormModal
        title="بلوک محتوای جدید"
        open={creating}
        onClose={() => setCreating(false)}
        error={createError}
        onSubmit={async () => {
          setCreateError('');
          const res = await upsertAiContent({
            id: newBlock.id.trim(),
            title: newBlock.title.trim() || newBlock.id.trim(),
            body: newBlock.body,
            kind: 'markdown',
            is_published: false,
          });
          if (!res.ok) {
            setCreateError(res.error);
            return;
          }
          setCreating(false);
          setNewBlock({ id: '', title: '', body: '' });
          refetch();
        }}
      >
        <input className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm" placeholder="شناسه (مثال: promo_banner)" dir="ltr" value={newBlock.id} onChange={(e) => setNewBlock({ ...newBlock, id: e.target.value })} />
        <input className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm" placeholder="عنوان" value={newBlock.title} onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })} />
        <textarea rows={4} className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm" placeholder="متن" value={newBlock.body} onChange={(e) => setNewBlock({ ...newBlock, body: e.target.value })} />
      </SimpleFormModal>
    </div>
  );
}
