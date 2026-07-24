"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import {
  acceptInviteAction,
  sendInviteOtpAction,
  verifyInviteOtpAndAcceptAction,
} from "@/lib/growth-hub/actions/invite";
import { ROLE_LABELS_FA } from "@/lib/growth-hub/permissions";
import type { GrowthHubMemberRole } from "@/lib/growth-hub/database.types";
import styles from "./auth.module.css";
import "../theme/portal-tokens.css";

type Props =
  | { valid: false }
  | {
      valid: true;
      token: string;
      workspaceName: string;
      role: GrowthHubMemberRole;
      phoneMasked: string | null;
      isAuthenticated: boolean;
    };

export function InviteClient(props: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!props.valid) {
    return (
      <div className={`gh-root ${styles.screen}`}>
        <div className={styles.card}>
          <h1 className={styles.title}>دعوت نامعتبر است</h1>
          <p className={styles.subtitle}>
            این دعوت معتبر نیست، منقضی شده یا قبلاً استفاده شده است. برای دریافت دعوت
            تازه با تیم آرایه در تماس باشید.
          </p>
        </div>
      </div>
    );
  }

  const { token, workspaceName, role, phoneMasked, isAuthenticated } = props;

  function goHome(slug: string) {
    router.replace(`/app/${slug}/home`);
    router.refresh();
  }

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

  function onRequestOtp() {
    setError(null);
    startTransition(async () => {
      const result = await sendInviteOtpAction({ token });
      if (!result.ok) {
        setError(result.error);
        if (result.retryAfterSec) startCooldown(result.retryAfterSec);
        return;
      }
      setStep("verify");
      startCooldown(result.cooldownSec ?? 60);
    });
  }

  function onVerify(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await verifyInviteOtpAndAcceptAction({ token, code });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      goHome(result.slug);
    });
  }

  function onAcceptAuthenticated() {
    setError(null);
    startTransition(async () => {
      const result = await acceptInviteAction({ token });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      goHome(result.slug);
    });
  }

  return (
    <div className={`gh-root ${styles.screen}`}>
      <div className={styles.card}>
        <span className={styles.badge}>
          <ShieldCheck size={13} aria-hidden="true" />
          دعوت به مرکز رشد
        </span>
        <h1 className={styles.title}>دعوت به «{workspaceName}»</h1>
        <p className={styles.meta}>نقش شما: {ROLE_LABELS_FA[role]}</p>

        {error ? <p className={styles.error}>{error}</p> : null}

        {isAuthenticated ? (
          <button
            className={styles.submit}
            type="button"
            onClick={onAcceptAuthenticated}
            disabled={pending}
          >
            {pending ? "در حال پذیرش…" : "پذیرش دعوت و ورود"}
          </button>
        ) : step === "request" ? (
          <div>
            <p className={styles.subtitle}>
              برای ورود، کد تأیید به شماره
              <br />
              <strong dir="ltr">{phoneMasked ?? "••••••••••"}</strong>
              <br />
              ارسال می‌شود.
            </p>
            <button
              className={styles.submit}
              type="button"
              onClick={onRequestOtp}
              disabled={pending || cooldown > 0}
            >
              {pending ? "در حال ارسال…" : "دریافت کد ورود"}
            </button>
          </div>
        ) : (
          <form onSubmit={onVerify} noValidate>
            <p className={styles.subtitle}>کد تأیید ارسال‌شده را وارد کنید.</p>
            <label className={styles.field}>
              <span className={styles.label}>کد تأیید</span>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                maxLength={6}
                pattern="\d{6}"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </label>
            <button className={styles.submit} type="submit" disabled={pending || code.length !== 6}>
              {pending ? "در حال تأیید…" : "تأیید و ورود"}
            </button>
            <div style={{ textAlign: "center" }}>
              <button
                type="button"
                className={styles.toggle}
                disabled={pending || cooldown > 0}
                onClick={onRequestOtp}
              >
                {cooldown > 0
                  ? `ارسال مجدد تا ${cooldown} ثانیه دیگر`
                  : "ارسال مجدد کد"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
