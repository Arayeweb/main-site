'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, AlertCircle } from 'lucide-react';
import { Suspense } from 'react';

function GateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [secret, setSecret] = useState(searchParams.get('s') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitSecret(value: string) {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ secret: value }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError('کد دسترسی نامعتبر است.');
        setLoading(false);
        return;
      }
      const next = searchParams.get('next') || '/admin/login';
      router.push(next);
    } catch {
      setError('خطای شبکه. دوباره تلاش کنید.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-4">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">دسترسی داخلی</h1>
          <p className="text-sm text-slate-500 mt-1">کد دسترسی پنل را وارد کنید</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSecret(secret);
            }}
            className="flex flex-col gap-4"
          >
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="کد دسترسی"
              required
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg"
              dir="ltr"
              autoComplete="off"
            />

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !secret}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
            >
              {loading ? 'در حال بررسی...' : 'ادامه'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminGatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">...</div>}>
      <GateForm />
    </Suspense>
  );
}
