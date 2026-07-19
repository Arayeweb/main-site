'use client';

import { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { CmsMediaPicker, type CmsMediaItem } from '@/components/admin/blog/CmsMediaPicker';

type FeaturedImage = { id: string; url: string; alt_text: string } | null;

type Props = {
  image: FeaturedImage;
  onChange: (imageId: string | null, preview: FeaturedImage) => void;
};

export function BlogFeaturedImageField({ image, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleSelect(item: CmsMediaItem) {
    onChange(item.id, { id: item.id, url: item.url, alt_text: item.alt_text });
  }

  function handleClear() {
    onChange(null, null);
  }

  return (
    <div className="space-y-2">
      <span className="text-xs text-slate-500 block">تصویر شاخص</span>
      {image ? (
        <div className="relative border rounded-xl overflow-hidden bg-slate-50">
          <img src={image.url} alt={image.alt_text || 'تصویر شاخص'} className="w-full h-36 object-cover" />
          <div className="flex gap-2 p-2 border-t border-slate-100 bg-white">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex-1 text-xs py-1.5 border rounded-lg hover:bg-slate-50"
            >
              تغییر
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
              title="حذف"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="w-full flex flex-col items-center gap-2 py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-slate-400 hover:text-slate-600 transition"
        >
          <ImageIcon className="w-6 h-6" />
          <span className="text-xs">انتخاب تصویر شاخص</span>
        </button>
      )}

      <CmsMediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleSelect} title="تصویر شاخص" />
    </div>
  );
}
