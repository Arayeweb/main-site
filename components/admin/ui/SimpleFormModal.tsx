'use client';

interface SimpleFormModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  submitLabel?: string;
  busy?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function SimpleFormModal({
  title,
  open,
  onClose,
  onSubmit,
  submitLabel = 'ذخیره',
  busy = false,
  error,
  children,
}: SimpleFormModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-slate-900">{title}</h3>
        {children}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onSubmit()}
            className="flex-1 bg-slate-900 text-white rounded-lg py-2 text-sm disabled:opacity-50"
          >
            {busy ? 'در حال ذخیره...' : submitLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-200 rounded-lg py-2 text-sm"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
