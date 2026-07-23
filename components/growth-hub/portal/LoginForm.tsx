"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInAction } from "@/lib/growth-hub/actions/auth";
import { safeNextPath } from "@/lib/growth-hub/redirect";
import styles from "./auth.module.css";
import "../theme/portal-tokens.css";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signInAction({ email, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace(safeNextPath(next));
      router.refresh();
    });
  }

  return (
    <div className={`gh-root ${styles.screen}`}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img className={styles.brandMark} src="/assets/logo-icon.svg" alt="" />
          <div>
            <p className={styles.brandTitle}>مرکز رشد آرایه</p>
            <p className={styles.brandSubtitle}>پنل مشتریان آرایه</p>
          </div>
        </div>

        <h1 className={styles.title}>ورود به حساب</h1>
        <p className={styles.subtitle}>
          با ایمیل و رمز عبوری که هنگام پذیرش دعوت ساخته‌اید وارد شوید.
        </p>

        {error ? <p className={styles.error}>{error}</p> : null}

        <form onSubmit={onSubmit} noValidate>
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
              autoComplete="current-password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className={styles.submit} type="submit" disabled={pending}>
            {pending ? "در حال ورود…" : "ورود"}
          </button>
        </form>

        <p className={styles.hint}>
          حساب کاربری ندارید؟ دسترسی به مرکز رشد از طریق دعوت تیم آرایه فراهم می‌شود.
        </p>
      </div>
    </div>
  );
}
