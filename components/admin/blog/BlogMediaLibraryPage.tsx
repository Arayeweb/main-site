'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Image as ImageIcon } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminLoadingState } from '@/hooks/useAdminFetch';
import { fetchCmsMedia, uploadCmsMedia, updateCmsMedia } from '@/lib/cmsAdminApi';

type MediaItem = { id: string; url: string; file_name: string; alt_text: string };

export function BlogMediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetchCmsMedia();
    if (res.ok) setMedia(res.data.media);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await uploadCmsMedia(file);
    setUploading(false);
    e.target.value = '';
    load();
  }

  async function copyUrl(item: MediaItem) {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  }

  async function saveAlt(item: MediaItem, altText: string) {
    setSavingId(item.id);
    const res = await updateCmsMedia(item.id, { alt_text: altText });
    setSavingId(null);
    if (res.ok) {
      setMedia((prev) => prev.map((m) => (m.id === item.id ? { ...m, alt_text: altText } : m)));
    }
  }

  if (loading) return <AdminLoadingState />;

  return (
    <div dir="rtl">
      <AdminPageHeader
        title="کتابخانه رسانه"
        description="تصاویر مقالات بلاگ — alt text برای SEO مهم است"
        icon={ImageIcon}
        actions={
          <label className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg cursor-pointer">
            {uploading ? 'در حال آپلود…' : 'آپلود تصویر'}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {media.map((m) => (
          <MediaCard
            key={m.id}
            item={m}
            copied={copiedId === m.id}
            saving={savingId === m.id}
            onCopy={() => copyUrl(m)}
            onSaveAlt={(alt) => saveAlt(m, alt)}
          />
        ))}
      </div>
    </div>
  );
}

function MediaCard({
  item,
  copied,
  saving,
  onCopy,
  onSaveAlt,
}: {
  item: MediaItem;
  copied: boolean;
  saving: boolean;
  onCopy: () => void;
  onSaveAlt: (alt: string) => void;
}) {
  const [alt, setAlt] = useState(item.alt_text);

  useEffect(() => {
    setAlt(item.alt_text);
  }, [item.alt_text]);

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <img src={item.url} alt={alt || item.file_name} className="w-full h-36 object-cover" />
      <div className="p-3 space-y-2">
        <div className="text-xs text-slate-500 truncate">{item.file_name}</div>
        <label className="block">
          <span className="text-[10px] text-slate-400">متن جایگزین (alt)</span>
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onBlur={() => alt !== item.alt_text && onSaveAlt(alt)}
            placeholder="توضیح تصویر برای SEO"
            className="w-full mt-0.5 border rounded-lg px-2 py-1 text-xs"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 border rounded-lg hover:bg-slate-50"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            {copied ? 'کپی شد' : 'کپی URL'}
          </button>
          {saving && <span className="text-[10px] text-slate-400 self-center">ذخیره…</span>}
        </div>
      </div>
    </div>
  );
}
