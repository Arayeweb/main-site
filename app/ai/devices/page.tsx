"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IconDevices, IconX } from "../icons";
import { useArenaAuth } from "../ArenaAuthContext";
import { invalidateArenaAuthCache } from "../ArenaAuthContext";

type DeviceRow = {
  id: string;
  created_at: string;
  last_seen_at: string;
  device_label: string;
  device_kind: string;
  ip: string | null;
  is_current: boolean;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function kindLabel(kind: string) {
  if (kind === "mobile") return "موبایل";
  if (kind === "tablet") return "تبلت";
  if (kind === "desktop") return "دسکتاپ";
  return "دستگاه";
}

export default function DevicesPage() {
  const { authed } = useArenaAuth();
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    return fetch("/api/ai/devices", { credentials: "same-origin", cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) setDevices(d.devices || []);
        else if (d?.error === "unauthorized") setDevices([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (authed === true) load();
    else if (authed === false) setLoading(false);
  }, [authed, load]);

  function openLogin() {
    window.dispatchEvent(new Event("ai:open-login"));
  }

  async function revokeOne(id: string, isCurrent: boolean) {
    if (busyId) return;
    const msg = isCurrent
      ? "از این دستگاه خارج می‌شوی. ادامه می‌دهی؟"
      : "این نشست لغو شود؟";
    if (!window.confirm(msg)) return;

    setBusyId(id);
    setErr("");
    try {
      const res = await fetch("/api/ai/devices", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setErr("لغو نشست ناموفق بود.");
        setBusyId(null);
        return;
      }
      if (data.revokedCurrent) {
        invalidateArenaAuthCache();
        window.location.href = "/ai";
        return;
      }
      await load();
    } catch {
      setErr("خطایی پیش آمد.");
    }
    setBusyId(null);
  }

  async function revokeOthers() {
    if (revokingOthers) return;
    if (!window.confirm("همه دستگاه‌های دیگر از حساب خارج شوند؟")) return;
    setRevokingOthers(true);
    setErr("");
    try {
      const res = await fetch("/api/ai/devices", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ others: true }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setErr("عملیات ناموفق بود.");
        setRevokingOthers(false);
        return;
      }
      await load();
    } catch {
      setErr("خطایی پیش آمد.");
    }
    setRevokingOthers(false);
  }

  const othersCount = devices.filter((d) => !d.is_current).length;

  return (
    <main className="ar-container ar-account-page">
      <div className="ar-account-hero">
        <IconDevices size={28} />
        <h1>دستگاه‌ها</h1>
        <p>نشست‌های فعال حسابت را ببین و در صورت نیاز خارج کن.</p>
      </div>

      {authed === false && (
        <div className="ar-banner error" style={{ marginBottom: 20 }}>
          <IconX size={14} />
          برای مدیریت دستگاه‌ها باید وارد حسابت شوی.{" "}
          <button type="button" className="ar-link-btn" onClick={openLogin}>
            ورود / ثبت‌نام
          </button>
        </div>
      )}

      {err && <div className="ar-auth-err" style={{ marginBottom: 12 }}>{err}</div>}

      {loading ? (
        <div className="ar-loading-note">
          <span className="ar-spinner" />
          در حال بارگذاری…
        </div>
      ) : authed && devices.length === 0 ? (
        <div className="ar-account-empty">
          هنوز نشستی ثبت نشده.
          <br />
          <span className="ar-account-empty-hint">
            بعد از ورود بعدی، این دستگاه اینجا دیده می‌شود.
          </span>
        </div>
      ) : authed ? (
        <>
          {othersCount > 0 && (
            <div className="ar-account-toolbar">
              <button
                type="button"
                className="ar-btn ar-btn-ghost ar-btn-sm"
                onClick={revokeOthers}
                disabled={revokingOthers}
              >
                {revokingOthers ? "در حال خروج…" : "خروج از بقیه دستگاه‌ها"}
              </button>
            </div>
          )}
          <div className="ar-device-list">
            {devices.map((d) => (
              <div
                key={d.id}
                className={`ar-device-item${d.is_current ? " is-current" : ""}`}
              >
                <div className="ar-device-item-main">
                  <div className="ar-device-item-title">
                    <span>{d.device_label}</span>
                    {d.is_current && (
                      <span className="ar-device-badge">این دستگاه</span>
                    )}
                  </div>
                  <div className="ar-device-item-meta">
                    {kindLabel(d.device_kind)}
                    {" · "}
                    آخرین فعالیت {formatDate(d.last_seen_at)}
                    {d.ip && d.ip !== "unknown" ? ` · ${d.ip}` : ""}
                  </div>
                </div>
                <button
                  type="button"
                  className="ar-btn ar-btn-ghost ar-btn-sm ar-device-revoke"
                  disabled={busyId === d.id}
                  onClick={() => revokeOne(d.id, d.is_current)}
                >
                  {busyId === d.id ? "…" : d.is_current ? "خروج" : "لغو"}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Link href="/ai" className="ar-btn ar-btn-ghost">
          بازگشت
        </Link>
      </div>
    </main>
  );
}
