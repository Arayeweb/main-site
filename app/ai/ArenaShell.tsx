"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconChat,
  IconChevronDown,
  IconColumns,
  IconDiamond,
  IconDots,
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
  IconPanel,
  IconSearch,
  IconSpark,
  IconSwords,
  IconMusic,
  IconX,
  IconCopy,
  IconCheck,
  IconSettings,
  IconTrophy,
  IconPen,
  IconCode,
  IconDownload,
  IconDevices,
  IconCreditUsage,
} from "./icons";
import TelegramBanner from "./TelegramBanner";
import { useArenaAuth } from "./ArenaAuthContext";
import { invalidateArenaAuthCache } from "./ArenaAuthContext";
import { historyTierLabel, type HistoryItem } from "@/lib/aiHistory";
import { requestAnalyzeText, requestNewChat } from "@/lib/aiNewChat";
import { usePwaInstall } from "./PWAInstallProvider";
import { trackPwaEvent } from "@/lib/ai/pwaInstall";

const SIDEBAR_COLLAPSED_KEY = "ar_sidebar_collapsed";
const HISTORY_HIDDEN_KEY = "ar_history_hidden";
const HISTORY_TITLES_KEY = "ar_history_titles";

function tierIcon(tier: string) {
  if (tier === "image_gen") return IconImage;
  if (tier === "video_gen") return IconVideo;
  if (tier === "audio_gen" || tier === "transcribe") return IconMic;
  if (tier === "music_gen") return IconMusic;
  if (tier === "persona") return IconSpark;
  if (tier === "code_studio") return IconCode;
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
  if (tier === "code_studio") return `/ai/code/${id}`;
  // personaKey wins even when tier was stored as "direct" (runs pipeline)
  if (personaKey) return `/ai/personas/${personaKey}?thread=${id}`;
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
  return "قدیمی‌تر";
}

function isAiHomePath(pathname: string) {
  return pathname === "/ai" || pathname === "/ai/";
}

function readJsonRecord(key: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function readHiddenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(HISTORY_HIDDEN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeHiddenIds(ids: Set<string>) {
  try {
    localStorage.setItem(HISTORY_HIDDEN_KEY, JSON.stringify([...ids]));
  } catch {
    /* quota */
  }
}

function writeTitleOverrides(map: Record<string, string>) {
  try {
    localStorage.setItem(HISTORY_TITLES_KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
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
  const {
    authed,
    credits,
    historyItems: items,
    hasContentBundle,
    phoneMasked,
    renameHistoryItem,
    removeHistoryItem,
  } = useArenaAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [referral, setReferral] = useState<{
    code: string;
    shareUrl: string;
    totalReferrals: number;
    creditsEarned: number;
  } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [moreToolsOpen, setMoreToolsOpen] = useState(false);
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [menuChatId, setMenuChatId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [titleOverrides, setTitleOverrides] = useState<Record<string, string>>({});
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const profileRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const { eligible: pwaEligible, openInstall } = usePwaInstall();

  const homeMode = isAiHomePath(pathname) ? searchParams.get("mode") : null;

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    try {
      setSideCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
    } catch {
      /* ignore */
    }
    setTitleOverrides(readJsonRecord(HISTORY_TITLES_KEY));
    setHiddenIds(readHiddenIds());
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setProfileOpen(false);
    setSettingsOpen(false);
    setMenuChatId(null);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!profileOpen) return;
    function onDoc(e: MouseEvent) {
      if (!profileRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [profileOpen]);

  useEffect(() => {
    if (!menuChatId) return;
    function onDoc(e: MouseEvent) {
      if (!chatMenuRef.current?.contains(e.target as Node)) setMenuChatId(null);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuChatId]);

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

  useEffect(() => {
    if (chatSearchOpen) searchInputRef.current?.focus();
  }, [chatSearchOpen]);

  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus();
  }, [renamingId]);

  function setCollapsed(next: boolean) {
    setSideCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  async function openReferral() {
    setProfileOpen(false);
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
    setProfileOpen(false);
    await fetch("/api/ai/auth", { method: "DELETE", credentials: "same-origin" });
    invalidateArenaAuthCache();
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

  function chatTitle(it: HistoryItem) {
    return titleOverrides[it.id] || it.title || "گفتگو";
  }

  function startRename(it: HistoryItem) {
    setMenuChatId(null);
    setRenamingId(it.id);
    setRenameValue(chatTitle(it));
  }

  function commitRename() {
    if (!renamingId) return;
    const next = renameValue.trim().slice(0, 80);
    if (next) {
      renameHistoryItem(renamingId, next);
      const map = { ...titleOverrides, [renamingId]: next };
      setTitleOverrides(map);
      writeTitleOverrides(map);
    }
    setRenamingId(null);
    setRenameValue("");
  }

  function deleteChat(it: HistoryItem) {
    setMenuChatId(null);
    if (!window.confirm("این گفتگو از لیست حذف شود؟")) return;
    removeHistoryItem(it.id);
    const next = new Set(hiddenIds);
    next.add(it.id);
    setHiddenIds(next);
    writeHiddenIds(next);
    if (renamingId === it.id) {
      setRenamingId(null);
      setRenameValue("");
    }
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

  const visibleItems = useMemo(() => {
    const q = chatQuery.trim().toLowerCase();
    return items.filter((it) => {
      if (hiddenIds.has(it.id)) return false;
      if (!q) return true;
      return chatTitle(it).toLowerCase().includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chatTitle depends on titleOverrides
  }, [items, hiddenIds, chatQuery, titleOverrides]);

  const groups: { label: string; items: HistoryItem[] }[] = [];
  for (const it of visibleItems) {
    const label = groupLabel(it.createdAt);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(it);
    else groups.push({ label, items: [it] });
  }

  const profileLabel = phoneMasked || "حساب من";

  const sidebarInner = (
    <div className="ar-side-panel">
      <div className="ar-side-top">
        <div className="ar-side-head">
          <Link href="/ai" className="ar-logo" onClick={closeDrawer}>
            آرایه <span>AI</span>
          </Link>
          <button
            type="button"
            className="ar-side-close ar-side-close--drawer"
            onClick={closeDrawer}
            aria-label="بستن منو"
          >
            <IconX size={15} />
          </button>
          <button
            type="button"
            className="ar-side-collapse"
            onClick={() => setCollapsed(true)}
            aria-label="جمع‌کردن سایدبار"
          >
            <IconPanel size={15} />
          </button>
        </div>

        <button type="button" className="ar-newchat" onClick={startNewChat}>
          <IconNewChat size={15} />
          گفت‌وگوی جدید
        </button>

        {!authed && authed !== null && (
          <p className="ar-side-hint">برای ذخیره گفتگوها وارد شوید.</p>
        )}

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
            <button type="button" className="ar-side-nav-item" onClick={goAnalyzeText}>
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
            <button
              type="button"
              className={`ar-side-nav-item ar-side-nav-item--toggle${moreToolsOpen ? " open" : ""}`}
              onClick={() => setMoreToolsOpen((v) => !v)}
              aria-expanded={moreToolsOpen}
            >
              <IconSpark size={14} />
              <span className="ar-side-nav-item-text">ابزارهای بیشتر</span>
              <IconChevronDown size={12} className="ar-side-caret" />
            </button>
            {moreToolsOpen && (
              <div className="ar-side-subnav">
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
                <Link
                  href="/ai/music"
                  className={`ar-side-nav-item${pathname.startsWith("/ai/music") ? " active" : ""}`}
                  onClick={closeDrawer}
                >
                  <IconMusic size={14} />
                  <span className="ar-side-nav-item-text">موزیک</span>
                </Link>
                <Link
                  href="/ai/audio"
                  className={`ar-side-nav-item${pathname.startsWith("/ai/audio") ? " active" : ""}`}
                  onClick={closeDrawer}
                >
                  <IconMic size={14} />
                  <span className="ar-side-nav-item-text">صوت</span>
                </Link>
                <span className="ar-side-nav-item ar-side-nav-item--soon" aria-disabled="true">
                  <IconVideo size={14} />
                  <span className="ar-side-nav-item-text">ساخت ویدیو</span>
                  <span className="ar-side-soon">به‌زودی</span>
                </span>
              </div>
            )}
          </nav>

          <div className="ar-side-group-label">کشف بیشتر</div>
          <nav className="ar-side-nav" aria-label="کشف بیشتر">
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
            {pwaEligible && (
              <button
                type="button"
                className="ar-side-nav-item"
                onClick={() => {
                  trackPwaEvent("pwa_install_cta_clicked", { entry: "sidebar" });
                  openInstall("sidebar");
                  closeDrawer();
                }}
              >
                <IconDownload size={14} />
                <span className="ar-side-nav-item-text">نصب آرایه روی دستگاه</span>
              </button>
            )}
          </nav>
        </div>
      </div>

      <div className="ar-side-scroll">
        <div className="ar-side-chats-head">
          <span className="ar-side-chats-title">گفت‌وگوها</span>
          <button
            type="button"
            className={`ar-side-icon-btn${chatSearchOpen ? " active" : ""}`}
            onClick={() => {
              setChatSearchOpen((v) => {
                if (v) setChatQuery("");
                return !v;
              });
            }}
            aria-label="جست‌وجوی چت"
            aria-pressed={chatSearchOpen}
          >
            <IconSearch size={14} />
          </button>
        </div>

        {chatSearchOpen && (
          <div className="ar-side-search">
            <input
              ref={searchInputRef}
              type="search"
              className="ar-side-search-input"
              placeholder="جست‌وجو در گفتگوها…"
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              aria-label="جست‌وجو در گفتگوها"
            />
          </div>
        )}

        {authed && groups.length === 0 && (
          <div className="ar-side-empty">
            {chatQuery.trim() ? "نتیجه‌ای پیدا نشد." : "هنوز گفتگویی نداری."}
          </div>
        )}

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
              const title = chatTitle(it);
              const isRenaming = renamingId === it.id;
              const menuOpen = menuChatId === it.id;

              return (
                <div
                  key={`${it.source ?? "legacy"}:${it.id}`}
                  className={`ar-side-item-wrap${active ? " active" : ""}${menuOpen ? " menu-open" : ""}`}
                  ref={menuOpen ? chatMenuRef : undefined}
                >
                  {isRenaming ? (
                    <form
                      className="ar-side-rename"
                      onSubmit={(e) => {
                        e.preventDefault();
                        commitRename();
                      }}
                    >
                      <input
                        ref={renameInputRef}
                        className="ar-side-rename-input"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setRenamingId(null);
                            setRenameValue("");
                          }
                        }}
                        maxLength={80}
                        aria-label="نام جدید گفتگو"
                      />
                    </form>
                  ) : (
                    <>
                      <Link
                        href={href}
                        className={`ar-side-item${active ? " active" : ""}`}
                        onClick={closeDrawer}
                        title={modeLabel}
                      >
                        <Icon size={14} />
                        <span className="ar-side-item-text">{title}</span>
                      </Link>
                      <button
                        type="button"
                        className="ar-side-item-menu-btn"
                        aria-label="عملیات گفتگو"
                        aria-expanded={menuOpen}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuChatId(menuOpen ? null : it.id);
                        }}
                      >
                        <IconDots size={14} />
                      </button>
                      {menuOpen && (
                        <div className="ar-side-item-menu" role="menu">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => startRename(it)}
                          >
                            تغییر نام
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className="danger"
                            onClick={() => deleteChat(it)}
                          >
                            حذف
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="ar-side-foot">
        {credits !== null && (
          <div className="ar-side-credits">
            <Link
              href="/ai/usage"
              className="ar-side-credits-left"
              onClick={closeDrawer}
              title="مصرف اعتبار"
            >
              <IconDiamond size={13} />
              <b>{credits.toLocaleString("fa-IR")}</b>
              <span>اعتبار</span>
            </Link>
            <Link
              href="/ai/pricing"
              className="ar-side-credits-buy"
              onClick={closeDrawer}
            >
              خرید
            </Link>
          </div>
        )}

        {authed ? (
          <div className="ar-side-profile" ref={profileRef}>
            <button
              type="button"
              className={`ar-side-profile-btn${profileOpen ? " open" : ""}`}
              onClick={() => {
                setProfileOpen((v) => !v);
                setSettingsOpen(false);
              }}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <span className="ar-side-profile-name">{profileLabel}</span>
              <IconChevronDown size={13} className="ar-side-caret" />
            </button>
            {profileOpen && (
              <div className="ar-side-profile-pop" role="menu">
                <Link
                  href="/ai/pricing"
                  className={`ar-side-nav-item${isPricingActive ? " active" : ""}`}
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    closeDrawer();
                  }}
                >
                  <IconDiamond size={14} />
                  <span className="ar-side-nav-item-text">اشتراک</span>
                </Link>
                <button
                  type="button"
                  className={`ar-side-nav-item${settingsOpen ? " active" : ""}`}
                  role="menuitem"
                  aria-expanded={settingsOpen}
                  onClick={() => setSettingsOpen((v) => !v)}
                >
                  <IconSettings size={14} />
                  <span className="ar-side-nav-item-text">تنظیمات</span>
                  <IconChevronDown size={12} className="ar-side-caret" />
                </button>
                {settingsOpen && (
                  <div className="ar-side-settings-sub">
                    <Link
                      href="/ai/devices"
                      className={`ar-side-nav-item${pathname.startsWith("/ai/devices") ? " active" : ""}`}
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        closeDrawer();
                      }}
                    >
                      <IconDevices size={14} />
                      <span className="ar-side-nav-item-text">دستگاه‌ها</span>
                    </Link>
                    <Link
                      href="/ai/usage"
                      className={`ar-side-nav-item${pathname.startsWith("/ai/usage") ? " active" : ""}`}
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        closeDrawer();
                      }}
                    >
                      <IconCreditUsage size={14} />
                      <span className="ar-side-nav-item-text">مصرف اعتبار</span>
                    </Link>
                    <button
                      type="button"
                      className="ar-side-nav-item"
                      role="menuitem"
                      onClick={openReferral}
                    >
                      <IconGift size={14} />
                      <span className="ar-side-nav-item-text">کد معرفی من</span>
                    </button>
                    <Link
                      href="/ai/support"
                      className={`ar-side-nav-item${pathname.startsWith("/ai/support") ? " active" : ""}`}
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
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
                        setProfileOpen(false);
                        closeDrawer();
                      }}
                    >
                      <IconGlobe size={14} />
                      <span className="ar-side-nav-item-text">امکانات</span>
                    </Link>
                    <Link
                      href="/prompts"
                      className="ar-side-nav-item"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        closeDrawer();
                      }}
                    >
                      <IconGlobe size={14} />
                      <span className="ar-side-nav-item-text">پرامپت‌های آماده</span>
                    </Link>
                    <Link
                      href="/about"
                      className="ar-side-nav-item"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        closeDrawer();
                      }}
                    >
                      <IconGlobe size={14} />
                      <span className="ar-side-nav-item-text">درباره آرایه</span>
                    </Link>
                  </div>
                )}
                <button
                  type="button"
                  className="ar-side-nav-item ar-side-nav-item--danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <IconLogout size={14} />
                  <span className="ar-side-nav-item-text">خروج از حساب</span>
                </button>
              </div>
            )}
          </div>
        ) : authed === false ? (
          <button type="button" className="ar-side-auth primary" onClick={handleLogin}>
            ورود / ثبت‌نام
          </button>
        ) : (
          <span className="ar-side-auth-placeholder" aria-hidden="true" />
        )}
      </div>
    </div>
  );

  return (
    <div className={`ar-shell${sideCollapsed ? " ar-shell--side-collapsed" : ""}`}>
      <a href="#ar-main-content" className="ar-skip-link">
        رفتن به محتوای اصلی
      </a>
      <aside className="ar-sidebar">{sidebarInner}</aside>

      <button
        type="button"
        className="ar-side-reopen"
        onClick={() => setCollapsed(false)}
        aria-label="باز کردن سایدبار"
      >
        <IconPanel size={16} />
      </button>

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
        <TelegramBanner />
        {children}
      </div>
    </div>
  );
}
