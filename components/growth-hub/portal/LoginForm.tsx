"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  sendLoginOtpAction,
  verifyLoginOtpAction,
} from "@/lib/growth-hub/actions/auth";
import styles from "./auth.module.css";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function startCooldown(sec: number) {
    setCooldown(sec);
    const timer = window.setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  function onSendOtp(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await sendLoginOtpAction({ phone });
      if (!result.ok) {
        setError(result.error);
        if (result.retryAfterSec) startCooldown(result.retryAfterSec);
        return;
      }
      setStep("otp");
      startCooldown(result.cooldownSec ?? 60);
    });
  }

  function onVerify(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await verifyLoginOtpAction({ phone, code, next });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace(result.next ?? next);
      router.refresh();
    });
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>ورود به مرکز رشد</h1>
      <p className={styles.subtitle}>
        با شماره موبایلی که دعوت شده‌اید وارد شوید.
      </p>
      {error ? <p className={styles.error}>{error}</p> : null}

      {step === "phone" ? (
        <form onSubmit={onSendOtp} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>شماره موبایل</span>
            <input
              className={styles.input}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="0912…"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>
          <button className={styles.submit} type="submit" disabled={pending}>
            {pending ? "در حال ارسال…" : "دریافت کد ورود"}
          </button>
        </form>
      ) : (
        <form onSubmit={onVerify} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>کد تأیید</span>
            <input
              className={styles.input}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              dir="ltr"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          </label>
          <button
            className={styles.submit}
            type="submit"
            disabled={pending || code.length !== 6}
          >
            {pending ? "در حال تأیید…" : "تأیید و ورود"}
          </button>
          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              className={styles.toggle}
              disabled={pending || cooldown > 0}
              onClick={() => onSendOtp({ preventDefault() {} } as React.FormEvent)}
            >
              {cooldown > 0
                ? `ارسال مجدد تا ${cooldown} ثانیه دیگر`
                : "ارسال مجدد کد"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
