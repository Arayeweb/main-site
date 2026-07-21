"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IconCreditUsage, IconX } from "../icons";
import { useArenaAuth } from "../ArenaAuthContext";
import { formatCreditDelta } from "@/lib/aiCreditLabels";

type LedgerRow = {
  id: string;
  created_at: string;
  delta: number;
  reason: string;
  reason_label: string;
  note: string | null;
  balance_after: number | null;
};

type UsagePayload = {
  balance: number;
  plan: string;
  summary: { spent_30d: number; earned_30d: number; requests_30d: number };
  ledger: LedgerRow[];
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

export default function CreditUsagePage() {
  const { authed } = useArenaAuth();
  const [data, setData] = useState<UsagePayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    return fetch("/api/ai/credits/usage", {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) {
          setData({
            balance: d.balance,
            plan: d.plan,
            summary: d.summary,
            ledger: d.ledger || [],
          });
        } else {
          setData(null);
        }
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

  return (
    <main className="ar-container ar-account-page">
      <div className="ar-account-hero">
        <IconCreditUsage size={28} />
        <h1>مصرف اعتبار</h1>
        <p>موجودی، مصرف ۳۰ روز اخیر و تاریخچه تراکنش‌های اعتبار.</p>
      </div>

      {authed === false && (
        <div className="ar-banner error" style={{ marginBottom: 20 }}>
          <IconX size={14} />
          برای دیدن مصرف اعتبار باید وارد حسابت شوی.{" "}
          <button type="button" className="ar-link-btn" onClick={openLogin}>
            ورود / ثبت‌نام
          </button>
        </div>
      )}

      {loading ? (
        <div className="ar-loading-note">
          <span className="ar-spinner" />
          در حال بارگذاری…
        </div>
      ) : authed && data ? (
        <>
          <div className="ar-usage-summary">
            <div className="ar-usage-stat">
              <span className="ar-usage-stat-label">موجودی فعلی</span>
              <span className="ar-usage-stat-value">
                {data.balance.toLocaleString("fa-IR")}
              </span>
            </div>
            <div className="ar-usage-stat">
              <span className="ar-usage-stat-label">مصرف ۳۰ روز</span>
              <span className="ar-usage-stat-value ar-usage-stat-value--spent">
                {data.summary.spent_30d.toLocaleString("fa-IR")}
              </span>
            </div>
            <div className="ar-usage-stat">
              <span className="ar-usage-stat-label">افزایش ۳۰ روز</span>
              <span className="ar-usage-stat-value ar-usage-stat-value--earn">
                {data.summary.earned_30d.toLocaleString("fa-IR")}
              </span>
            </div>
          </div>

          <div className="ar-account-toolbar">
            <Link href="/ai/pricing" className="ar-btn ar-btn-primary ar-btn-sm">
              خرید اعتبار
            </Link>
          </div>

          {data.ledger.length === 0 ? (
            <div className="ar-account-empty">هنوز تراکنشی ثبت نشده.</div>
          ) : (
            <div className="ar-ledger-list">
              {data.ledger.map((row) => (
                <div key={row.id} className="ar-ledger-item">
                  <div className="ar-ledger-item-main">
                    <div className="ar-ledger-item-title">{row.reason_label}</div>
                    <div className="ar-ledger-item-meta">
                      {formatDate(row.created_at)}
                      {row.balance_after != null
                        ? ` · موجودی ${Number(row.balance_after).toLocaleString("fa-IR")}`
                        : ""}
                    </div>
                  </div>
                  <span
                    className={`ar-ledger-delta${
                      row.delta < 0
                        ? " is-spend"
                        : row.delta > 0
                          ? " is-earn"
                          : ""
                    }`}
                  >
                    {formatCreditDelta(row.delta)}
                  </span>
                </div>
              ))}
            </div>
          )}
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
