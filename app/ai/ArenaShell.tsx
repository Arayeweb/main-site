"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconChat,
  IconColumns,
  IconDiamond,
  IconGift,
  IconGlobe,
  IconImage,
  IconVideo,
  IconMic,
  IconLayout,
  IconLogout,
  IconMenu,
  IconPhone,
  IconNewChat,
  IconSpark,
  IconSwords,
  IconMusic,
  IconX,
  IconCopy,
  IconCheck,
  IconSettings,
  IconTrophy,
  IconPen,
} from "./icons";
import PWAInstallBanner from "./PWAInstallBanner";
import TelegramBanner from "./TelegramBanner";
import { useArenaAuth } from "./ArenaAuthContext";
import { writeHistoryCache } from "@/lib/aiHistoryCache";
import { historyTierLabel, type HistoryItem } from "@/lib/aiHistory";
import { requestAnalyzeText, requestNewChat } from "@/lib/aiNewChat";

function tierIcon(tier: string) {
  if (tier === "image_gen") return IconImage;
  if (tier === "video_gen") return IconVideo;
  if (tier === "audio_gen" || tier === "transcribe") return IconMic;
  if (tier === "music_gen") return IconMusic;
  if (tier === "persona") return IconSpark;
  if (tier === "direct") return IconChat;
  if (tier === "side_by_side") return IconColumns;
  if (tier === "council" || tier === "battle") return IconSwords;
  return IconSwords;
}

function historyHref(
  tier: string,
  id: string,
  personaKey?: string | null,
  source?: "run" | "legacy",
  latestRunId?: string
) {
  if (tier === "image_gen") return `/ai/image/${id}`;
  if (tier === "video_gen") return `/ai/video/${id}`;
  if (tier === "audio_gen" || tier === "transcribe") return `/ai/audio/${id}`;
  if (tier === "music_gen") return `/ai/music/${id}`;
  if (tier === "persona" && personaKey) return `/ai/personas/${personaKey}?thread=${id}`;
  if (source === "run") return `/ai/runs/${latestRunId ?? id}`;
  return `/ai/battle/${id}`;
}

function groupLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.floor((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (diffDays <= 0) return "امروز";
  if (diffDays === 1) return "دیروز";
  if (diffDays < 7) return "۷ روز گذشته";
  return "قبل‌تر";
}

function isAiHomePath(pathname: string) {
  return pathname === "/ai" || pathname === "/ai/";
}

export default function ArenaShell({
  children,
  onLoginClick,
}: {
  children: React.ReactNode;
  onLoginClick?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { authed, credits, historyItems: items, hasContentBundle } = useArenaAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [referral, setReferral] = useState<{
    code: string;
    shareUrl: string;
    totalReferrals: number;
    creditsEarned: number;
  } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const homeMode = isAiHomePath(pathname) ? searchParams.get("mode") : null;

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    setDrawerOpen(false);
    setSettingsOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!settingsOpen) return;
    function onDoc(e: MouseEvent) {
      if (!settingsRef.current?.contains(e.target as Node)) setSettingsOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [settingsOpen]);

  useEffect(() => {
    const openDrawer = () => setDrawerOpen(true);
    window.addEventListener("ai:open-drawer", openDrawer);
    return () => window.removeEventListener("ai:open-drawer", openDrawer);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  async function openReferral() {
    setSettingsOpen(false);
    closeDrawer();
    setReferralOpen(true);
    if (referral) return;
    try {
      const res = await fetch("/api/ai/referral/me", { credentials: "same-origin" });
      const data = await res.json();
      if (data?.ok) {
        setReferral({
          code: data.code,
          shareUrl: data.shareUrl,
          totalReferrals: data.totalReferrals,
          creditsEarned: data.creditsEarned,
        });
      }
    } catch {
      /* ignore */
    }
  }

  async function copyReferralCode() {
    if (!referral?.code) return;
    try {
      await navigator.clipboard.writeText(referral.code);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function handleLogout() {
    closeDrawer();
    await fetch("/api/ai/auth", { method: "DELETE" });
    writeHistoryCache([]);
    window.location.href = "/ai";
  }

  function handleLogin() {
    closeDrawer();
    if (onLoginClick) onLoginClick();
    else window.dispatchEvent(new Event("ai:open-login"));
  }

  function startNewChat() {
    closeDrawer();
    requestNewChat({ pathname, navigate: (p) => router.push(p) });
  }

  function goAnalyzeText() {
    closeDrawer();
    requestAnalyzeText({ pathname, navigate: (p) => router.push(p) });
  }

  const activeRunItem = items.find(
    (it) =>
      it.source === "run" &&
      (pathname === `/ai/runs/${it.id}` ||
        (it.latestRunId && pathname === `/ai/runs/${it.latestRunId}`))
  );

  const isChatActive =
    (isAiHomePath(pathname) && (!homeMode || homeMode === "direct")) ||
    activeRunItem?.tier === "direct";
  const isPricingActive = pathname.startsWith("/ai/pricing");
  const isSettingsActive =
    settingsOpen ||
    pathname.startsWith("/ai/support") ||
    pathname.startsWith("/ai/features");

  const groups: { label: string; items: HistoryItem[] }[] = [];
  for (const it of items) {
    const label = groupLabel(it.createdAt);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(it);
    else groups.push({ label, items: [it] });
  }

  const sidebarInner = (
    <div className="ar-side-panel">
      <div className="ar-side-top">
        <div className="ar-side-head">
          <Link href="/ai" className="ar-logo" onClick={closeDrawer}>
            آرایه <span>AI</span>
          </Link>
          <button
            type="button"
            className="ar-side-close"
            onClick={closeDrawer}
            aria-label="بستن منو"
          >
            <IconX size={15} />
          </button>
        </div>

        <button type="button" className="ar-newchat" onClick={startNewChat}>
          <IconNewChat size={15} />
          گفتگوی جدید
        </button>

        {!authed && authed !== null && (
          <p className="ar-side-hint">برای ذخیره گفتگوها وارد شوید.</p>
        )}
      </div>

      <div className="ar-side-scroll">
        <div className="ar-side-tools">
          <div className="ar-side-group-label">اصلی</div>
          <nav className="ar-side-nav" aria-label="اصلی">
            <Link
              href="/ai"
              className={`ar-side-nav-item${isChatActive ? " active" : ""}`}
              onClick={closeDrawer}
            >
              <IconChat size={14} />
              <span className="ar-side-nav-item-text">چت AI</span>
            </Link>
          </nav>

          <div className="ar-side-group-label">ابزارها</div>
          <nav className="ar-side-nav" aria-label="ابزارها">
            {hasContentBundle && (
              <Link
                href="/ai/content-sales/app"
                className={`ar-side-nav-item${pathname.startsWith("/ai/content-sales/app") ? " active" : ""}`}
                onClick={closeDrawer}
              >
                <IconLayout size={14} />
                <span className="ar-side-nav-item-text">تولید محتوا</span>
              </Link>
            )}
            <button
              type="button"
              className="ar-side-nav-item"
              onClick={goAnalyzeText}
            >
              <IconPen size={14} />
              <span className="ar-side-nav-item-text">تحلیل متن</span>
            </button>
            <Link
              href="/ai/image"
              className={`ar-side-nav-item${pathname.startsWith("/ai/image") ? " active" : ""}`}
              onClick={closeDrawer}
            >
              <IconImage size={14} />
              <span className="ar-side-nav-item-text">ساخت عکس</span>
            </Link>
            <Link
              href="/ai/video"
              className={`ar-side-nav-item${pathname.startsWith("/ai/video") ? " active" : ""}`}
              onClick={closeDrawer}
            >
              <IconVideo size={14} />
              <span className="ar-side-nav-item-text">ساخت ویدیو</span>
              <span className="ar-side-beta">Beta</span>
            </Link>
            <Link
              href="/ai/music"
              className={`ar-side-nav-item${pathname.startsWith("/ai/music") ? " active" : ""}`}
              onClick={closeDrawer}
            >
              <IconMusic size={14} />
              <span className="ar-side-nav-item-text">موزیک</span>
            </Link>
          </nav>

          <div className="ar-side-group-label">آزمایشی</div>
          <nav className="ar-side-nav" aria-label="آزمایشی">
            <Link
              href="/ai/personas"
              className={`ar-side-nav-item${pathname.startsWith("/ai/personas") ? " active" : ""}`}
              onClick={closeDrawer}
            >
              <IconSpark size={14} />
              <span className="ar-side-nav-item-text">شخصیت‌ها</span>
            </Link>
            <Link
              href="/ai/leaderboard"
              className={`ar-side-nav-item${pathname.startsWith("/ai/leaderboard") ? " active" : ""}`}
              onClick={closeDrawer}
            >
              <IconTrophy size={14} />
              <span className="ar-side-nav-item-text">لیدربورد مدل‌ها</span>
            </Link>
          </nav>
        </div>

        {authed && groups.length === 0 && (
          <div className="ar-side-empty">هنوز گفتگویی نداری.</div>
        )}
        {groups.length > 0 && <div className="ar-side-group-label">چت‌ها</div>}
        {groups.map((g) => (
          <div key={g.label} className="ar-side-group">
            <div className="ar-side-group-label">{g.label}</div>
            {g.items.map((it) => {
              const Icon = tierIcon(it.tier);
              const href = historyHref(it.tier, it.id, it.personaKey, it.source, it.latestRunId);
              const active =
                pathname === href ||
                (it.source === "run" &&
                  (pathname === `/ai/runs/${it.id}` ||
                    (it.latestRunId != null && pathname === `/ai/runs/${it.latestRunId}`))) ||
                (it.tier === "image_gen" && pathname.startsWith(`/ai/image/${it.id}`)) ||
                (it.tier === "video_gen" && pathname.startsWith(`/ai/video/${it.id}`)) ||
                ((it.tier === "audio_gen" || it.tier === "transcribe") &&
                  pathname.startsWith(`/ai/audio/${it.id}`));
              const modeLabel = historyTierLabel(it.tier, it.source);
              return (
                <Link
                  key={`${it.source ?? "legacy"}:${it.id}`}
                  href={href}
                  className={`ar-side-item${active ? " active" : ""}`}
                  onClick={closeDrawer}
                  title={modeLabel}
                >
                  <Icon size={14} />
                  <span className="ar-side-item-text">{it.title}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="ar-side-foot">
        {credits !== null && (
          <Link href="/ai/pricing" className="ar-side-credits" onClick={closeDrawer}>
            <IconDiamond size={13} />
            <b>{credits.toLocaleString("fa-IR")}</b> کردیت
            <span className="buy">خرید</span>
          </Link>
        )}
        <nav className="ar-side-nav ar-side-nav--account" aria-label="حساب">
          <Link
            href="/ai/pricing"
            className={`ar-side-nav-item${isPricingActive ? " active" : ""}`}
            onClick={closeDrawer}
          >
            <IconDiamond size={14} />
            <span className="ar-side-nav-item-text">اشتراک</span>
          </Link>
          <div className="ar-side-settings" ref={settingsRef}>
            <button
              type="button"
              className={`ar-side-nav-item${isSettingsActive ? " active" : ""}`}
              onClick={() => setSettingsOpen((v) => !v)}
              aria-expanded={settingsOpen}
              aria-haspopup="menu"
            >
              <IconSettings size={14} />
              <span className="ar-side-nav-item-text">تنظیمات</span>
              <span className="caret">▾</span>
            </button>
            {settingsOpen && (
              <div className="ar-side-settings-pop" role="menu">
                {authed && (
                  <button
                    type="button"
                    className="ar-side-nav-item"
                    role="menuitem"
                    onClick={openReferral}
                  >
                    <IconGift size={14} />
                    <span className="ar-side-nav-item-text">کد معرفی من</span>
                  </button>
                )}
                <Link
                  href="/ai/support"
                  className={`ar-side-nav-item${pathname.startsWith("/ai/support") ? " active" : ""}`}
                  role="menuitem"
                  onClick={() => {
                    setSettingsOpen(false);
                    closeDrawer();
                  }}
                >
                  <IconPhone size={14} />
                  <span className="ar-side-nav-item-text">پشتیبانی</span>
                </Link>
                <Link
                  href="/ai/features"
                  className={`ar-side-nav-item${pathname.startsWith("/ai/features") ? " active" : ""}`}
                  role="menuitem"
                  onClick={() => {
                    setSettingsOpen(false);
                    closeDrawer();
                  }}
                >
                  <IconGlobe size={14} />
                  <span className="ar-side-nav-item-text">امکانات</span>
                </Link>
                <Link
                  href="/"
                  className="ar-side-nav-item"
                  role="menuitem"
                  onClick={() => {
                    setSettingsOpen(false);
                    closeDrawer();
                  }}
                >
                  <IconGlobe size={14} />
                  <span className="ar-side-nav-item-text">درباره آرایه</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
        {authed ? (
          <button type="button" className="ar-side-auth" onClick={handleLogout}>
            <IconLogout size={14} />
            خروج از حساب
          </button>
        ) : (
          <button type="button" className="ar-side-auth primary" onClick={handleLogin}>
            ورود / ثبت‌نام
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="ar-shell">
      <a href="#ar-main-content" className="ar-skip-link">
        رفتن به محتوای اصلی
      </a>
      <aside className="ar-sidebar">{sidebarInner}</aside>

      <header className="ar-mobilebar">
        <button
          type="button"
          className="ar-mobilebar-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label="باز کردن منو"
        >
          <IconMenu size={19} />
        </button>
        <Link href="/ai" className="ar-logo">
          آرایه <span>AI</span>
        </Link>
        {credits !== null ? (
          <Link href="/ai/pricing" className="ar-credits-chip">
            <IconDiamond size={12} />
            <span className="num">{credits.toLocaleString("fa-IR")}</span>
          </Link>
        ) : (
          <span style={{ width: 36 }} />
        )}
      </header>

      {drawerOpen && (
        <div
          className="ar-drawer-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDrawer();
          }}
        >
          <aside className="ar-drawer" role="dialog" aria-label="منوی ناوبری">
            {sidebarInner}
          </aside>
        </div>
      )}

      {referralOpen && (
        <div
          className="ar-sheet-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReferralOpen(false);
          }}
        >
          <div className="ar-sheet ar-referral-sheet">
            <div className="ar-sheet-head">
              <h3>کد معرفی تو</h3>
              <button
                className="ar-sheet-close"
                onClick={() => setReferralOpen(false)}
                aria-label="بستن"
              >
                <IconX size={14} />
              </button>
            </div>
            {referral ? (
              <>
                <p className="ar-sheet-sub">
                  دوستانت با این کد ۱۰٪ تخفیف می‌گیرند — تو هم ۱۰ کردیت پاداش برای هر خرید موفق.
                </p>
                <div className="ar-ref-code" dir="ltr">
                  {referral.code}
                </div>
                <div className="ar-ref-stats">
                  <span>{referral.totalReferrals.toLocaleString("fa-IR")} معرفی</span>
                  <span>{referral.creditsEarned.toLocaleString("fa-IR")} کردیت پاداش</span>
                </div>
                <button
                  type="button"
                  className="ar-btn ar-btn-primary ar-btn-block"
                  onClick={copyReferralCode}
                >
                  {copiedRef ? (
                    <>
                      <IconCheck size={14} /> کپی شد
                    </>
                  ) : (
                    <>
                      <IconCopy size={14} /> کپی کد معرفی
                    </>
                  )}
                </button>
              </>
            ) : (
              <p className="ar-sheet-sub">در حال بارگذاری…</p>
            )}
          </div>
        </div>
      )}

      <div className="ar-main" id="ar-main-content">
        <PWAInstallBanner />
        <TelegramBanner />
        {children}
      </div>
    </div>
  );
}
