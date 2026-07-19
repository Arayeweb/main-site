'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminLoadingState } from '@/hooks/useAdminFetch';
import { fetchCmsMedia, uploadCmsMedia } from '@/lib/cmsAdminApi';

export function BlogMediaLibraryPage() {
  const [media, setMedia] = useState<{ id: string; url: string; file_name: string; alt_text: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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
    load();
  }

  if (loading) return <AdminLoadingState />;

  return (
    <div dir="rtl">
      <AdminPageHeader
        title="کتابخانه رسانه"
        description="تصاویر مقالات بلاگ"
        icon={ImageIcon}
        actions={
          <label className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg cursor-pointer">
            {uploading ? 'در حال آپلود…' : 'آپلود تصویر'}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map((m) => (
          <div key={m.id} className="border rounded-xl overflow-hidden bg-white">
            <img src={m.url} alt={m.alt_text || m.file_name} className="w-full h-32 object-cover" />
            <div className="p-2 text-xs text-slate-500 truncate">{m.file_name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
