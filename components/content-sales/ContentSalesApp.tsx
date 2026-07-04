"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  REEL_SCENARIOS,
  CAPTION_TEMPLATES,
  DM_TEMPLATES,
  CAMPAIGN_TEMPLATES,
  ANALYSIS_TEMPLATES,
  BEFORE_AFTER_SAMPLES,
  TUTORIALS,
  AI_TEMPLATES,
  CRITIQUE_SYSTEM,
} from "@/lib/contentSales";
import PromptCard from "@/components/content-sales/PromptCard";

type Tab =
  | "reels"
  | "captions"
  | "dm"
  | "campaigns"
  | "analysis"
  | "tutorials"
  | "samples"
  | "templates"
  | "system";

const TAB_GROUPS: { label: string; tabs: { id: Tab; label: string }[] }[] = [
  {
    label: "محتوا",
    tabs: [
      { id: "reels", label: "ریلز (۳۰)" },
      { id: "captions", label: "کپشن (۳۰)" },
      { id: "dm", label: "دایرکت (۲۰)" },
    ],
  },
  {
    label: "استراتژی",
    tabs: [
      { id: "campaigns", label: "کمپین (۱۰)" },
      { id: "analysis", label: "تحلیل (۱۰)" },
    ],
  },
  {
    label: "AI و آموزش",
    tabs: [
      { id: "tutorials", label: "آموزش (۵)" },
      { id: "samples", label: "قبل/بعد (۵)" },
      { id: "templates", label: "قالب AI (۱۲)" },
      { id: "system", label: "سیستم نقد" },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((g) => g.tabs);

const REEL_TYPES = [...new Set(REEL_SCENARIOS.map((r) => r.pageType))];

export default function ContentSalesApp() {
  const sp = useSearchParams();
  const [tab, setTab] = useState<Tab>("reels");
  const [search, setSearch] = useState("");
  const [reelFilter, setReelFilter] = useState<string | null>(null);
  const [access, setAccess] = useState<{
    buyerName: string;
    oneTimePassword?: string | null;
    needsManualSetup?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const welcome = sp.get("welcome") === "1";
    const url = welcome
      ? "/api/ai/content-sales/access?reveal_setup=1"
      : "/api/ai/content-sales/access";
    fetch(url, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok) {
          setError("دسترسی نداری. با همان حسابی که خریدی وارد AI شو یا پکیج را بخر.");
          return;
        }
        setAccess({
          buyerName: j.order.buyerName,
          oneTimePassword: j.oneTimePassword,
          needsManualSetup: j.needsManualSetup,
        });
      })
      .catch(() => setError("خطا در بارگذاری."));
  }, [sp]);

  const q = search.trim().toLowerCase();

  const filteredReels = useMemo(() => {
    return REEL_SCENARIOS.filter((r) => {
      if (reelFilter && r.pageType !== reelFilter) return false;
      if (!q) return true;
      const hay = `${r.hook} ${r.script} ${r.pageType} ${r.caption}`.toLowerCase();
      return hay.includes(q);
    });
  }, [q, reelFilter]);

  const filteredCaptions = useMemo(() => {
    if (!q) return CAPTION_TEMPLATES;
    return CAPTION_TEMPLATES.filter(
      (c) => c.text.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [q]);

  const filteredDm = useMemo(() => {
    if (!q) return DM_TEMPLATES;
    return DM_TEMPLATES.filter(
      (d) => d.text.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
    );
  }, [q]);

  if (error) {
    return (
      <div className="cs-page cs-empty">
        <h2 className="cs-h2">{error}</h2>
        <div className="cs-app-actions" style={{ justifyContent: "center" }}>
          <Link href="/ai/content-sales#pricing" className="ar-btn ar-btn-primary">
            خرید پکیج
          </Link>
          <Link href="/ai" className="ar-btn ar-btn-ghost">
            ورود به AI
          </Link>
        </div>
      </div>
    );
  }

  if (!access) {
    return <div className="cs-page cs-loading">در حال بارگذاری...</div>;
  }

  function renderTabButton(t: { id: Tab; label: string }, mobile = false) {
    return (
      <button
        key={t.id}
        type="button"
        className={mobile ? `ar-btn ar-btn-sm ${tab === t.id ? "ar-btn-primary" : "ar-btn-ghost"}` : `cs-app-tab${tab === t.id ? " active" : ""}`}
        onClick={() => {
          setTab(t.id);
          setSearch("");
          setReelFilter(null);
        }}
      >
        {t.label}
      </button>
    );
  }

  return (
    <div className="cs-page cs-app">
      <header className="cs-app-header">
        <Link href="/ai" className="cs-app-back">
          ← Araaye AI
        </Link>
        <h1 className="cs-app-title">سلام {access.buyerName} — پکیج محتوا و فروش</h1>
        <p style={{ fontSize: "0.88rem", color: "var(--cs-muted)", marginTop: 8, lineHeight: 1.6 }}>
          منوی AI → «پکیج محتوا» — همیشه از اینجا برمی‌گردی.
        </p>

        {access.needsManualSetup && (
          <div className="cs-error" style={{ marginTop: 14 }}>
            فعال‌سازی AI در حال انجام است — واتساپ: ۰۹۹۹۱۳۰۰۷۸۸
          </div>
        )}

        {access.oneTimePassword && (
          <div className="cs-setup-card">
            <strong>رمز یک‌بارمصرف پنل AI:</strong>
            <code>{access.oneTimePassword}</code>
          </div>
        )}

        <div className="cs-app-actions">
          <Link href="/ai" className="ar-btn ar-btn-primary ar-btn-sm">
            باز کردن Araaye AI
          </Link>
          <Link href="/ai/content-sales" className="ar-btn ar-btn-ghost ar-btn-sm">
            صفحه پکیج
          </Link>
        </div>
      </header>

      <div className="cs-app-tabs-mobile">{ALL_TABS.map((t) => renderTabButton(t, true))}</div>

      <div className="cs-app-layout">
        <aside className="cs-app-sidebar">
          {TAB_GROUPS.map((g) => (
            <div key={g.label} className="cs-app-sidebar-group">
              <div className="cs-app-sidebar-label">{g.label}</div>
              <nav className="cs-app-tabs" aria-label={g.label}>
                {g.tabs.map((t) => renderTabButton(t))}
              </nav>
            </div>
          ))}
        </aside>

        <main>
          <input
            type="search"
            className="cs-search"
            placeholder="جستجو در این بخش…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="جستجو"
          />

          {tab === "reels" && (
            <div className="cs-filter-row">
              <button
                type="button"
                className={`cs-filter-chip${!reelFilter ? " active" : ""}`}
                onClick={() => setReelFilter(null)}
              >
                همه
              </button>
              {REEL_TYPES.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  className={`cs-filter-chip${reelFilter === pt ? " active" : ""}`}
                  onClick={() => setReelFilter(pt)}
                >
                  {pt}
                </button>
              ))}
            </div>
          )}

          {tab === "reels" &&
            filteredReels.map((r) => (
              <PromptCard
                key={r.id}
                title={`#${r.id} — ${r.hook}`}
                tags={[r.pageType]}
                body={`Hook: ${r.hook}\n\n${r.script}\n\nصحنه: ${r.scene}\nکپشن: ${r.caption}\nCTA: ${r.cta}`}
                copyText={`Hook: ${r.hook}\n\n${r.script}\n\n${r.caption}\n\n${r.cta}`}
              />
            ))}

          {tab === "captions" &&
            filteredCaptions.map((c) => (
              <PromptCard
                key={c.id}
                title={`#${c.id} — ${c.category}`}
                tags={[c.category]}
                body={c.text}
              />
            ))}

          {tab === "dm" &&
            filteredDm.map((d) => (
              <PromptCard
                key={d.id}
                title={`#${d.id} — ${d.category}`}
                tags={[d.category]}
                body={d.text}
                showOpenInAi={false}
              />
            ))}

          {tab === "campaigns" &&
            CAMPAIGN_TEMPLATES.map((c) => (
              <PromptCard
                key={c.id}
                title={c.name}
                tags={[c.goal, c.duration]}
                body={`پیام: ${c.mainMessage}\nپیشنهاد: ${c.offer}\nCTA: ${c.cta}\n\n${c.dailyPlan.join("\n")}`}
                copyText={c.dailyPlan.join("\n")}
              />
            ))}

          {tab === "analysis" &&
            ANALYSIS_TEMPLATES.map((a) => (
              <PromptCard
                key={a.id}
                title={a.name}
                tags={a.inputs}
                body={a.prompt}
              />
            ))}

          {tab === "tutorials" &&
            TUTORIALS.map((t) => (
              <article key={t.id} className="cs-card" style={{ marginBottom: 12 }}>
                <h3>{t.title}</h3>
                <p>{t.goal}</p>
                <ul className="cs-list">
                  {t.outline.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
                <pre className="cs-sample-pre">{t.scriptSummary}</pre>
              </article>
            ))}

          {tab === "samples" &&
            BEFORE_AFTER_SAMPLES.map((b) => (
              <PromptCard
                key={b.id}
                title={b.topic}
                body={`ورودی ضعیف: ${b.weakInput}\nخروجی ضعیف: ${b.weakOutput}\nنقد: ${b.critique}\n\nخروجی بهتر:\n${b.betterOutput}\n\nچرا: ${b.whyBetter}`}
                showOpenInAi={false}
              />
            ))}

          {tab === "templates" &&
            AI_TEMPLATES.map((t) => (
              <PromptCard
                key={t.id}
                title={`#${t.id} — ${t.use}`}
                tags={t.inputs}
                body={t.prompt}
              />
            ))}

          {tab === "system" && (
            <PromptCard title="سیستم جواب → نقد → خروجی" body={CRITIQUE_SYSTEM} />
          )}
        </main>
      </div>
    </div>
  );
}
