"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Tab = "register" | "login";

const ERRORS: Record<string, string> = {
  missing_fields: "شماره موبایل و رمز عبور را وارد کنید.",
  invalid_phone: "شماره موبایل معتبر نیست. (مثال: ۰۹۱۲۱۲۳۴۵۶۷)",
  password_too_short: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
  phone_taken: "این شماره قبلاً ثبت شده. لطفاً وارد شوید.",
  invalid_credentials: "شماره موبایل یا رمز عبور اشتباه است.",
  rate_limited: "تعداد تلاش زیاد است. چند دقیقه صبر کنید.",
};

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("register");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/auth", {
        method: tab === "register" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(ERRORS[data.error] || "خطایی رخ داد. دوباره تلاش کنید.");
        return;
      }

      router.push("/ai/app");
    } catch {
      setError("خطا در اتصال. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-auth-wrap">
      <div className="ai-auth-card">
        {/* Logo */}
        <div className="ai-auth-logo">
          <div className="name">
            آرایه <span>AI</span>
          </div>
          <div className="tagline">اتاق فکر هوشمند</div>
        </div>

        {/* Tabs */}
        <div className="ai-auth-tabs">
          <button
            className={`ai-auth-tab${tab === "register" ? " active" : ""}`}
            onClick={() => { setTab("register"); setError(""); }}
          >
            ثبت‌نام
          </button>
          <button
            className={`ai-auth-tab${tab === "login" ? " active" : ""}`}
            onClick={() => { setTab("login"); setError(""); }}
          >
            ورود
          </button>
        </div>

        {/* Form */}
        <form className="ai-auth-form" onSubmit={handleSubmit}>
          <div className="ai-field">
            <label className="ai-label">شماره موبایل</label>
            <input
              className="ai-input"
              type="tel"
              dir="ltr"
              placeholder="09121234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>

          <div className="ai-field">
            <label className="ai-label">رمز عبور</label>
            <input
              className="ai-input"
              type="password"
              placeholder={tab === "register" ? "حداقل ۶ کاراکتر" : "رمز عبور"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                tab === "register" ? "new-password" : "current-password"
              }
              required
            />
          </div>

          {error && <p className="ai-form-err">{error}</p>}

          <button
            type="submit"
            className="ai-btn ai-btn-primary ai-btn-block"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading
              ? "..."
              : tab === "register"
              ? "ثبت‌نام و شروع"
              : "ورود به حساب"}
          </button>

          {tab === "register" && (
            <p className="ai-auth-divider">
              ۵ سؤال رایگان — بدون نیاز به کارت بانکی
            </p>
          )}
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link
            href="/ai"
            style={{ fontSize: 13, color: "var(--ai-text3)" }}
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}
