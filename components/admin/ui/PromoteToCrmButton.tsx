'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { promoteToCrmLead } from '@/lib/adminApi';

interface PromoteToCrmButtonProps {
  sourceType: 'bizcard' | 'website_brief' | 'fastweb' | 'content_sales' | 'adready';
  sourceId: string;
  className?: string;
}

export function PromoteToCrmButton({ sourceType, sourceId, className }: PromoteToCrmButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function handlePromote() {
    setBusy(true);
    setMsg('');
    const res = await promoteToCrmLead(sourceType, sourceId);
    setBusy(false);
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    const leadId = res.data.id;
    if (res.data.already_exists) {
      setMsg('قبلاً به CRM منتقل شده');
    }
    router.push(`/admin/sales/leads/${leadId}`);
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={busy}
        onClick={() => void handlePromote()}
        className="inline-flex items-center gap-2 text-sm bg-teal-700 text-white rounded-lg px-4 py-2 hover:bg-teal-800 disabled:opacity-50"
      >
        <UserPlus className="w-4 h-4" />
        {busy ? 'در حال انتقال...' : 'انتقال به CRM'}
      </button>
      {msg && <p className="text-xs text-slate-500 mt-1">{msg}</p>}
    </div>
  );
}
