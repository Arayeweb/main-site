'use client';

import { useCallback, useEffect, useState } from 'react';
import { ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { fetchCmsMedia, uploadCmsMedia } from '@/lib/cmsAdminApi';

export type CmsMediaItem = {
  id: string;
  url: string;
  file_name: string;
  alt_text: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CmsMediaItem) => void;
  title?: string;
};

export function CmsMediaPicker({ open, onClose, onSelect, title = 'انتخاب تصویر' }: Props) {
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [media, setMedia] = useState<CmsMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    setError('');
    const res = await fetchCmsMedia(q);
    if (res.ok) setMedia(res.data.media);
    else setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTab('library');
    setQuery('');
    setError('');
    load();
  }, [open, load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const res = await uploadCmsMedia(file);
    setUploading(false);
    e.target.value = '';
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const item: CmsMediaItem = {
      id: res.data.id,
      url: res.data.url,
      file_name: res.data.file_name,
      alt_text: res.data.alt_text ?? '',
    };
    onSelect(item);
    onClose();
  }

  function pick(item: CmsMediaItem) {
    onSelect(item);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-4">
          <button
            type="button"
            onClick={() => setTab('library')}
            className={`px-3 py-2 text-sm ${tab === 'library' ? 'border-b-2 border-slate-900 font-medium' : 'text-slate-400'}`}
          >
            کتابخانه
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-3 py-2 text-sm ${tab === 'upload' ? 'border-b-2 border-slate-900 font-medium' : 'text-slate-400'}`}
          >
            آپلود جدید
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'library' && (
            <div className="space-y-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load(query)}
                placeholder="جستجو در نام فایل…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => load(query)}
                className="w-full text-xs py-1.5 border rounded-lg hover:bg-slate-50"
              >
                جستجو
              </button>
              {loading ? (
                <div className="flex justify-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : media.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  تصویری نیست — از تب آپلود استفاده کنید
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {media.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => pick(m)}
                      className="group border border-slate-200 rounded-xl overflow-hidden text-right hover:border-slate-400 hover:shadow-md transition"
                    >
                      <img src={m.url} alt={m.alt_text || m.file_name} className="w-full h-28 object-cover" />
                      <div className="p-2 text-[11px] text-slate-500 truncate group-hover:text-slate-800">{m.file_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'upload' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <label className="flex flex-col items-center gap-3 px-8 py-10 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition w-full max-w-sm">
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-400" />
                )}
                <span className="text-sm text-slate-600">{uploading ? 'در حال آپلود…' : 'کلیک کنید یا فایل را بکشید'}</span>
                <span className="text-xs text-slate-400">JPEG, PNG, WebP, GIF — حداکثر ۱۰MB</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
          )}

          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
