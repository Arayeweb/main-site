"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle } from "lucide-react";
import { loginAdReadyUser, registerAdReadyUser } from "@/lib/adreadyAuthClient";
import {
  parseAdReadyAuthMode,
  resolveAdReadyAuthRedirect,
  type AdReadyAuthMode,
} from "@/lib/adreadyAuth";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams, pickUtmForDb } from "@/lib/utm";

type AdReadyAuthFormProps = {
  initialMode: AdReadyAuthMode;
  nextPath: string | null;
};

const CONTEXT_BULLETS = [
  "پیش‌نمایش صفحه کمپین رایگان",
  "لیدها داخل پنل ذخیره می‌شوند",
  "بدون نیاز به طراحی یا کدنویسی",
];

export default function AdReadyAuthForm({ initialMode, nextPath }: AdReadyAuthFormProps) {
  const phoneRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<AdReadyAuthMode>(initialMode);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    phoneRef.current?.focus();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;

    setError("");
    if (!phone.trim() || !password.trim()) {
      setError("شماره و رمز را وارد کن.");
      return;
    }

    setBusy(true);
    try {
      const result =
        mode === "register"
          ? await registerAdReadyUser({
              phone,
              password,
              utm: pickUtmForDb(getUtmParams()),
            })
          : await loginAdReadyUser({ phone, password });

      if (!result.ok) {
        if (result.error === "phone_taken") {
          setMode("login");
        }
        setError(result.message);
        setBusy(false);
        return;
      }

      pushGtmEvent(mode === "register" ? "adready_signup" : "adready_login", {
        page: "adready_login",
        destination: resolveAdReadyAuthRedirect(mode, nextPath),
      });

      window.location.assign(resolveAdReadyAuthRedirect(mode, nextPath));
    } catch {
      setError("خطایی پیش آمد. دوباره تلاش کن.");
      setBusy(false);
    }
  }

  return (
    <div className="adready-auth-layout">
      <div className="adready-auth-form-col">
        <Link href="/adready" className="adready-auth-back">
          <ArrowLeft size={16} />
          بازگشت به کمپین‌ساز
        </Link>

        <div className="adready-auth-card">
          <h1>
            {mode === "register"
              ? "پیش‌نمایش صفحه کمپین را رایگان بساز"
              : "ورود به کمپین‌ساز آرایه"}
          </h1>
          <p className="adready-auth-lead">
            {mode === "register"
              ? "با شماره موبایل ثبت‌نام کن و صفحه کمپین را ببین."
              : "با شماره موبایل وارد شو و صفحه‌های کمپینت را مدیریت کن."}
          </p>

          <div className="adready-auth-tabs" role="tablist" aria-label="ورود یا ثبت‌نام">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={mode === "register" ? "is-active" : undefined}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              ثبت‌نام
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={mode === "login" ? "is-active" : undefined}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              ورود
            </button>
          </div>

          <form className="adready-auth-form" onSubmit={handleSubmit}>
            <label className="adready-auth-field">
              <span>شماره موبایل</span>
              <input
                ref={phoneRef}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="09xxxxxxxxx"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>

            <label className="adready-auth-field">
              <span>رمز عبور</span>
              <input
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                placeholder={mode === "register" ? "حداقل ۶ کاراکتر" : "رمز عبور"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error ? (
              <p className="adready-auth-error" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="adready-primary-button adready-auth-submit" disabled={busy}>
              {busy ? (
                <LoaderCircle size={18} className="adready-spin" aria-hidden="true" />
              ) : null}
              <span>
                {busy
                  ? "لطفاً صبر کن..."
                  : mode === "register"
                    ? "پیش‌نمایش رایگان بساز"
                    : "ورود"}
              </span>
            </button>

            {mode === "register" ? (
              <p className="adready-auth-note">پرداخت فقط برای انتشار صفحه</p>
            ) : null}
          </form>
        </div>
      </div>

      <aside className="adready-auth-aside" aria-label="مزایای کمپین‌ساز آرایه">
        <div className="adready-auth-aside-inner">
          <span className="adready-auth-aside-badge">کمپین‌ساز آرایه</span>
          <h2>قبل از تبلیغ، صفحه کمپینت را بساز</h2>
          <ul>
            {CONTEXT_BULLETS.map((item) => (
              <li key={item}>
                <Check size={16} />
                {item}
              </li>
            ))}
          </ul>

          <div className="adready-auth-mini">
            <div className="adready-auth-mini-top">
              <span />
              <strong>پنل کمپین</strong>
            </div>
            <div className="adready-auth-mini-stats">
              <div>
                <small>بازدید</small>
                <strong>۱۲۳</strong>
              </div>
              <div>
                <small>لید</small>
                <strong>۱۸</strong>
              </div>
              <div className="is-accent">
                <small>تبدیل</small>
                <strong>۱۴٪</strong>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}