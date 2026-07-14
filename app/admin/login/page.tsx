'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

const ROLE_DEFAULT_PANEL: Record<string, string> = {
  admin: '/admin/select-panel',
  sales: '/admin/sales',
  support: '/admin/support',
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'ایمیل یا رمز عبور اشتباه است.',
  account_disabled: 'حساب کاربری غیرفعال است.',
  not_an_admin: 'این حساب دسترسی پنل مدیریت ندارد.',
  rate_limited: 'تلاش زیاد. چند دقیقه بعد دوباره امتحان کنید.',
  config_error: 'تنظیمات سرور ناقص است. با پشتیبانی تماس بگیرید.',
  missing_fields: 'لطفاً همه فیلدها را پر کنید.',
  invalid_body: 'خطای ارتباط با سرور.',
  server_error: 'خطای سرور. دوباره تلاش کنید.',
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(ERROR_MESSAGES[data.error] ?? 'خطای ناشناخته. دوباره تلاش کنید.');
        setLoading(false);
        return;
      }

      // Full navigation so middleware sees the new session cookie (router.push can skip it).
      const next = new URLSearchParams(window.location.search).get('next');
      const dest = next ?? ROLE_DEFAULT_PANEL[data.user.role] ?? '/admin/select-panel';
      window.location.assign(dest);
    } catch {
      setError('خطای شبکه. اتصال اینترنت را بررسی کنید.');
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-4 p-2.5">
            <img src="/assets/logo-icon.svg" alt="آرایه" className="w-full h-full invert" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">ورود به پنل مدیریت</h1>
          <p className="text-sm text-slate-500 mt-1">آرایه — پنل داخلی تیم</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                ایمیل
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@araaye.com"
                  required
                  className="w-full pr-10 pl-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">
                رمز عبور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور"
                  required
                  className="w-full pr-10 pl-10 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال ورود...' : 'ورود به پنل'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
