'use client';

import { useState } from 'react';
import { AiOpsSidebar } from './AiOpsSidebar';
import { AiOpsTopbar } from './AiOpsTopbar';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from './useAiOpsFetch';
import { fetchAiMe } from '@/lib/aiAdminApi';
import { AI_OPS_ROLES } from '@/lib/auth';

export function AiOpsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, loading, error } = useAiOpsFetch(() => fetchAiMe(), []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950" dir="rtl">
        <AiOpsLoadingState />
      </div>
    );
  }

  const role = data?.user?.role || '';
  const isAllowed = role === 'admin' || (AI_OPS_ROLES as string[]).includes(role);

  if (error || !data || !isAllowed) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950" dir="rtl">
        <AiOpsErrorState error={error || 'forbidden'} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden" dir="rtl">
      <div className="hidden lg:flex">
        <AiOpsSidebar role={role} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex">
            <AiOpsSidebar role={role} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AiOpsTopbar onMenuClick={() => setSidebarOpen(true)} userName={data.user.name || data.user.email} role={role} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
