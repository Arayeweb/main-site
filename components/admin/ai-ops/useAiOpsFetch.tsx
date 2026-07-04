'use client';

import { useEffect, useState } from 'react';
import type { ApiResult } from '@/lib/aiAdminApi';

export function useAiOpsFetch<T>(fetcher: () => Promise<ApiResult<T>>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setError(res.error);
          setData(null);
        } else {
          setData(res.data);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError('network_error');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { data, loading, error, refetch: () => setReloadKey((k) => k + 1) };
}

export function AiOpsLoadingState({ label = 'در حال بارگذاری...' }: { label?: string }) {
  return <div className="flex items-center justify-center py-16 text-sm text-slate-500 dark:text-slate-400">{label}</div>;
}

export function AiOpsErrorState({ error }: { error: string }) {
  const messages: Record<string, string> = {
    unauthorized: 'دسترسی غیرمجاز — دوباره وارد شوید.',
    forbidden: 'دسترسی شما به این بخش محدود است.',
    network_error: 'خطا در اتصال به سرور.',
    db_error: 'خطا در خواندن داده از پایگاه داده.',
  };
  return (
    <div className="flex items-center justify-center py-16 text-sm text-red-600 dark:text-red-400">
      {messages[error] ?? `خطا: ${error}`}
    </div>
  );
}
