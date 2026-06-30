"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconLogout } from "../../icons";

interface UserInfo {
  id: string;
  plan: string;
  credits: number;
  brainstorm_demos: number;
}

const PLAN_LABEL: Record<string, string> = {
  free: "رایگان",
  pro: "Pro",
  business: "Business",
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/auth")
      .then((r) => r.json())
      .then((d) => {
        if (d.authed) setUser(d.user);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/ai/auth", { method: "DELETE" });
    router.push("/ai");
  }

  return (
    <div className="ai-app-shell">
      {/* Header */}
      <header className="ai-app-header">
        <div className="ai-container ai-app-header-inner">
          <Link href="/ai/app" className="ai-back-btn" aria-label="بازگشت">
            <IconArrowRight size={18} />
          </Link>
          <div className="ai-app-logo">تنظیمات</div>
          <div style={{ width: 36 }} />
        </div>
      </header>

      <main className="ai-app-main">
        <div className="ai-container">
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 16,
              }}
            >
              {[80, 60, 100].map((w, i) => (
                <div
                  key={i}
                  className="ai-skeleton"
                  style={{ height: 18, width: `${w}%` }}
                />
              ))}
            </div>
          ) : (
            <>
              {/* Account */}
              <div className="ai-settings-section">
                <h2>حساب کاربری</h2>
                <div className="ai-settings-card">
                  <div className="ai-settings-row">
                    <span className="ai-settings-row-label">پلن فعلی</span>
                    <span className="ai-settings-row-val">
                      {PLAN_LABEL[user?.plan ?? "free"]}
                    </span>
                  </div>
                  <div className="ai-settings-row">
                    <span className="ai-settings-row-label">کردیت باقی‌مانده</span>
                    <span
                      className="ai-settings-row-val"
                      style={{ color: "var(--ai-accent)", fontWeight: 700 }}
                    >
                      {user?.credits ?? 0}
                    </span>
                  </div>
                  {user?.plan === "free" && (
                    <div className="ai-settings-row">
                      <span className="ai-settings-row-label">
                        دمو همفکری رایگان
                      </span>
                      <span className="ai-settings-row-val">
                        {user?.brainstorm_demos ?? 0} بار باقی
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upgrade */}
              {user?.plan !== "business" && (
                <div className="ai-settings-section">
                  <h2>ارتقاء پلن</h2>
                  <div className="ai-settings-card">
                    <div className="ai-settings-row">
                      <div>
                        <div className="ai-settings-row-label">
                          برای دسترسی کامل پلن خود را ارتقاء بده
                        </div>
                        <div
                          className="ai-settings-row-val"
                          style={{ marginTop: 2 }}
                        >
                          همفکری کامل، نقد و اصلاح، کردیت بیشتر
                        </div>
                      </div>
                      <Link
                        href="/ai/pricing"
                        className="ai-btn ai-btn-primary ai-btn-sm"
                        style={{ flexShrink: 0 }}
                      >
                        مشاهده پلن‌ها
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="ai-settings-section">
                <h2>مدیریت حساب</h2>
                <div className="ai-settings-card">
                  <div className="ai-settings-row">
                    <span className="ai-settings-row-label">
                      خروج از حساب
                    </span>
                    <button
                      className="ai-btn ai-btn-ghost ai-btn-sm"
                      onClick={handleLogout}
                      style={{
                        color: "var(--ai-error)",
                        borderColor: "color-mix(in srgb, var(--ai-error) 30%, transparent)",
                      }}
                    >
                      <IconLogout size={15} /> خروج
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
