"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { signInAction, signUpAction } from "@/lib/growth-hub/actions/auth";
import { acceptInviteAction } from "@/lib/growth-hub/actions/invite";
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
      isAuthenticated: boolean;
    };

export function InviteClient(props: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signup");
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

  async function runAccept() {
    const result = await acceptInviteAction({ token: (props as { token: string }).token });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(`/app/${result.slug}/home`);
    router.refresh();
  }

  function onAcceptAuthenticated() {
    setError(null);
    startTransition(runAccept);
  }

  function onAuthAndAccept(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const auth =
        mode === "signin"
          ? await signInAction({ email, password })
          : await signUpAction({ email, password });
      if (!auth.ok) {
        setError(auth.error);
        return;
      }
      await runAccept();
    });
  }

  return (
    <div className={`gh-root ${styles.screen}`}>
      <div className={styles.card}>
        <span className={styles.badge}>
          <ShieldCheck size={13} aria-hidden="true" />
          دعوت به مرکز رشد
        </span>
        <h1 className={styles.title}>پیوستن به «{props.workspaceName}»</h1>
        <p className={styles.meta}>
          نقش شما: {ROLE_LABELS_FA[props.role]}
        </p>

        {error ? <p className={styles.error}>{error}</p> : null}

        {props.isAuthenticated ? (
          <button
            className={styles.submit}
            type="button"
            onClick={onAcceptAuthenticated}
            disabled={pending}
          >
            {pending ? "در حال پذیرش…" : "پذیرش دعوت و ورود"}
          </button>
        ) : (
          <form onSubmit={onAuthAndAccept} noValidate>
            <p className={styles.subtitle}>
              {mode === "signup"
                ? "برای پذیرش دعوت، یک حساب با ایمیل و رمز عبور بسازید."
                : "برای پذیرش دعوت وارد حساب خود شوید."}
            </p>
            <label className={styles.field}>
              <span className={styles.label}>ایمیل</span>
              <input
                className={styles.input}
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>رمز عبور</span>
              <input
                className={styles.input}
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button className={styles.submit} type="submit" disabled={pending}>
              {pending
                ? "در حال پردازش…"
                : mode === "signup"
                  ? "ساخت حساب و پذیرش دعوت"
                  : "ورود و پذیرش دعوت"}
            </button>
            <div style={{ textAlign: "center" }}>
              <button
                type="button"
                className={styles.toggle}
                onClick={() => {
                  setError(null);
                  setMode(mode === "signup" ? "signin" : "signup");
                }}
              >
                {mode === "signup"
                  ? "حساب دارید؟ وارد شوید"
                  : "حساب ندارید؟ ثبت‌نام کنید"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
