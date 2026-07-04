"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconTrophy } from "../icons";
import { ModelAvatar } from "../icons";

type Entry = {
  modelId: string;
  name: string;
  wins: number;
  losses: number;
  total: number;
  winRate: number;
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) setEntries(d.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="ar-container ar-leaderboard-page ar-page-secondary">
      <div className="ar-leaderboard-hero ar-secondary-hero">
        <IconTrophy size={28} />
        <h1>لیدربورد مدل‌ها</h1>
        <p>رتبه‌بندی بر اساس رأی کاربران در نبردهای واقعی (حداقل ۵ رأی)</p>
        <Link href="/ai/learn/chatgpt" className="ar-hero-link">
          جایگزین ChatGPT ←
        </Link>
      </div>

      {loading ? (
        <div className="ar-loading-note">
          <span className="ar-spinner" />
          در حال بارگذاری…
        </div>
      ) : entries.length === 0 ? (
        <div className="ar-side-empty" style={{ textAlign: "center", padding: "40px 0" }}>
          هنوز داده کافی نیست — چند نبرد انجام بده و رأی بده.
          <br />
          <Link href="/ai?mode=battle" className="ar-btn ar-btn-primary" style={{ marginTop: 16 }}>
            شروع نبرد
          </Link>
        </div>
      ) : (
        <div className="ar-leaderboard-table-wrap">
          <table className="ar-leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>مدل</th>
                <th>برد</th>
                <th>باخت</th>
                <th>Win%</th>
                <th>رأی</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.modelId}>
                  <td>{(i + 1).toLocaleString("fa-IR")}</td>
                  <td>
                    <span className="ar-lb-model">
                      <ModelAvatar modelId={e.modelId} size={24} />
                      {e.name}
                    </span>
                  </td>
                  <td>{e.wins.toLocaleString("fa-IR")}</td>
                  <td>{e.losses.toLocaleString("fa-IR")}</td>
                  <td>
                    <strong>{e.winRate.toLocaleString("fa-IR")}٪</strong>
                  </td>
                  <td>{e.total.toLocaleString("fa-IR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Link href="/ai?mode=battle" className="ar-btn ar-btn-ghost">
          بازگشت به Arena
        </Link>
      </div>
    </main>
  );
}
