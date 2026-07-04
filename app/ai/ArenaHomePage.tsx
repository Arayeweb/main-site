"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconSend,
  IconSpark,
  IconSwords,
  IconX,
  IconCheck,
  IconLayout,
  IconChart,
  IconBulb,
  IconPen,
  IconGlobe,
  IconCode,
  IconColumns,
  IconChat,
  IconShield,
  IconPhone,
  IconNewChat,
  IconPaperclip,
  IconImage,
  IconVideo,
  IconMenu,
  IconLock,
  IconDots,
  IconMusic,
} from "./icons";
import ModelSelect from "./ModelSelect";
import { useArenaAuth } from "./ArenaAuthContext";
import { ArenaChatSkeleton, ArenaPageSkeleton } from "./ArenaSkeleton";

const DirectChatView = dynamic(() => import("./DirectChatView"), {
  loading: () => <ArenaChatSkeleton />,
});
const CompareSessionView = dynamic(() => import("./CompareSessionView"), {
  loading: () => <ArenaChatSkeleton />,
});
import { consumeContentSalesBootstrapPrompt } from "@/lib/contentSalesOpenInAi";
import {
  AI_NEW_CHAT_EVENT,
  consumeComposerFocusFlag,
  requestNewChat,
} from "@/lib/aiNewChat";
import {
  wrapPromptWithModes,
  type PendingAttachment,
} from "./composerHelpers";
import { canUseMode, canUseModel, MODE_MIN_PLAN } from "@/lib/aiCredits";
import { PLAN_LABELS } from "@/lib/aiPackages";
import { getModel } from "@/lib/aiModels";
import { formatFreeAllowanceGuest, formatStarterCredits, MAX_GUEST_DIRECT } from "@/lib/aiFreeMessaging";
import PersonaHomeRow from "./PersonaHomeRow";
import { captureCampaignParams, trackAiPurchase, trackAiSignup } from "@/lib/aiTracking";
import { getStoredPromoCode, pickUtmForDb, getUtmParams } from "@/lib/utm";

type AuthBoot = "pending" | "guest" | "user";

type Mode = "battle" | "side_by_side" | "direct";

type ActiveSession =
  | {
      type: "direct";
      modelId: string;
      bootstrapPrompt: string;
      bootstrapAttachments?: PendingAttachment[];
      codeMode?: boolean;
      webMode?: boolean;
      deepMode?: boolean;
    }
  | {
      type: "compare";
      mode: "battle" | "side_by_side";
      bootstrapPrompt: string;
      modelA: string;
      modelB: string;
      webMode?: boolean;
    };

const MODE_META: Record<Mode, { label: string; desc: string; Icon: typeof IconSwords }> = {
  direct: { label: "گفتگوی مستقیم", desc: "پرسش از یک مدل مشخص", Icon: IconChat },
  side_by_side: { label: "مقایسه دو مدل", desc: "دو مدل به انتخاب خودت", Icon: IconColumns },
  battle: { label: "نبرد مدل‌ها", desc: "دو مدل ناشناس — تو رأی می‌دهی", Icon: IconSwords },
};

function firstUnlockedMode(plan: string): Mode {
  const order: Mode[] = ["direct", "battle", "side_by_side"];
  return order.find((m) => canUseMode(plan, m)) ?? "battle";
}

function resolveDirectModel(deepMode: boolean, plan: string, picked: string): string {
  const pickedModel = getModel(picked);
  if (pickedModel && canUseModel(plan, pickedModel)) return picked;
  if (!deepMode) {
    const economy = getModel("economy");
    if (economy && canUseModel(plan, economy)) return "economy";
    return picked;
  }
  const precise = getModel("precise");
  if (precise && canUseModel(plan, precise)) return "precise";
  return "economy";
}

const SUGGESTIONS = [
  {
    Icon: IconLayout,
    title: "متن لندینگ‌پیج بنویس",
    desc: "برای معرفی یک محصول جدید",
    prompt: "برای لندینگ‌پیج یک اپلیکیشن مدیریت مالی شخصی، تیتر اصلی، زیرتیتر و سه مزیت کلیدی بنویس.",
  },
  {
    Icon: IconChart,
    title: "تحلیل کسب‌وکار",
    desc: "نقاط قوت و ضعف را بسنج",
    prompt: "می‌خواهم یک کافه تخصصی قهوه در تهران باز کنم. مهم‌ترین ریسک‌ها و فرصت‌های این کسب‌وکار را تحلیل کن.",
  },
  {
    Icon: IconBulb,
    title: "ایده‌پردازی محتوا",
    desc: "برای شبکه‌های اجتماعی",
    prompt: "۱۰ ایده محتوای اینستاگرام برای یک کلینیک دندانپزشکی پیشنهاد بده که تعامل بالا بگیرد.",
  },
  {
    Icon: IconPen,
    title: "بازنویسی حرفه‌ای",
    desc: "متن را قوی‌تر کن",
    prompt: "این جمله را به سه شکل حرفه‌ای‌تر بازنویسی کن: «ما بهترین خدمات را با قیمت مناسب ارائه می‌دهیم.»",
  },
  {
    Icon: IconGlobe,
    title: "برنامه سفر بچین",
    desc: "سه روز، بودجه مشخص",
    prompt: "یک برنامه سفر سه‌روزه به اصفهان با بودجه متوسط بچین؛ جاهای دیدنی، غذا و جابه‌جایی.",
  },
  {
    Icon: IconCode,
    title: "تابع لاگین بنویس",
    desc: "استودیو کد — مثل arena.ai",
    prompt: "یک تابع لاگین ساده با JWT برای Next.js بنویس",
    codeStudio: true,
  },
];

const AUTH_ERRORS: Record<string, string> = {
  phone_taken: "این شماره قبلاً ثبت‌نام کرده — وارد شو.",
  invalid_credentials: "شماره یا رمز اشتباه است.",
  invalid_phone: "شماره موبایل معتبر نیست.",
  password_too_short: "رمز باید حداقل ۶ کاراکتر باشد.",
  rate_limited: "تلاش زیاد؛ یک دقیقه بعد دوباره امتحان کن.",
  default: "خطایی پیش آمد. دوباره تلاش کن.",
};

export default function ArenaHomePage({
  initialAuthBoot,
}: {
  initialAuthBoot: "user" | "guest";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    authed: ctxAuthed,
    credits: ctxCredits,
    plan: ctxPlan,
    guestBattlesRemaining: ctxGuestRemaining,
    guestDirectRemaining: ctxGuestDirectRemaining,
    refresh: authRefresh,
    setCredits: setCtxCredits,
  } = useArenaAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const composerFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [authed, setAuthed] = useState<boolean | null>(
    initialAuthBoot === "user" ? true : false
  );
  const [authBoot, setAuthBoot] = useState<AuthBoot>(initialAuthBoot);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [prompt, setPrompt] = useState("");
  const [sendErr, setSendErr] = useState("");
  const [banner, setBanner] = useState<"success" | "failed" | null>(null);

  // Mode & models — پیش‌فرض: گفتگوی مستقیم (سریع)
  const [mode, setMode] = useState<Mode>("direct");
  const [deepMode, setDeepMode] = useState(false);
  const [guestRemaining, setGuestRemaining] = useState<number | null>(null);
  const [guestDirectRemaining, setGuestDirectRemaining] = useState<number | null>(null);
  const [modeOpen, setModeOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [modelA, setModelA] = useState("cmp-deepseek-v4");
  const [modelB, setModelB] = useState("cmp-grok-4");
  const [directModel, setDirectModel] = useState("economy");

  // حالت چت inline — hero مخفی
  const [session, setSession] = useState<ActiveSession | null>(null);

  // Auth sheet
  const [showSheet, setShowSheet] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [authTab, setAuthTab] = useState<"register" | "login">("register");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [composerFlash, setComposerFlash] = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const [webMode, setWebMode] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ctxAuthed === null) return;
    setAuthed(ctxAuthed);
    setAuthBoot(ctxAuthed ? "user" : "guest");
    if (ctxAuthed) {
      setCredits(ctxCredits);
      setPlan(ctxPlan);
    } else {
      setCredits(null);
      if (typeof ctxGuestRemaining === "number") setGuestRemaining(ctxGuestRemaining);
      if (typeof ctxGuestDirectRemaining === "number") setGuestDirectRemaining(ctxGuestDirectRemaining);
    }
  }, [ctxAuthed, ctxCredits, ctxPlan, ctxGuestRemaining, ctxGuestDirectRemaining]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    captureCampaignParams();

    const p = params.get("payment");
    if (p === "success") {
      setBanner("success");
      trackAiPurchase({ promoCode: getStoredPromoCode() || undefined });
    } else if (p === "failed") setBanner("failed");
    if (params.get("login") === "1") {
      setShowSheet(true);
      setTimeout(() => phoneRef.current?.focus(), 150);
    }
    if (p || params.get("login")) window.history.replaceState({}, "", "/ai");

    const urlMode = params.get("mode");
    const urlModeValid =
      urlMode === "battle" || urlMode === "direct" || urlMode === "side_by_side";

    if (urlModeValid) {
      setMode(urlMode as Mode);
    } else if (ctxAuthed === false) {
      setMode("battle");
    } else if (ctxAuthed === true) {
      setMode(canUseMode(ctxPlan, "direct") ? "direct" : firstUnlockedMode(ctxPlan));
    }
  }, [ctxAuthed, ctxPlan]);

  useEffect(() => {
    const onRefresh = () => authRefresh();
    window.addEventListener("ai:refresh", onRefresh);
    return () => window.removeEventListener("ai:refresh", onRefresh);
  }, [authRefresh]);

  useEffect(() => {
    const openLogin = () => {
      setPendingPrompt("");
      setShowSheet(true);
      setTimeout(() => phoneRef.current?.focus(), 100);
    };
    window.addEventListener("ai:open-login", openLogin);
    return () => window.removeEventListener("ai:open-login", openLogin);
  }, []);

  useEffect(() => {
    const onGuestRemaining = (e: Event) => {
      const n = (e as CustomEvent<number>).detail;
      if (typeof n === "number") setGuestRemaining(n);
    };
    const onGuestLimit = () => {
      setSession(null);
      setSendErr("guest_limit");
    };
    window.addEventListener("ai:guest-remaining", onGuestRemaining);
    window.addEventListener("ai:guest-limit", onGuestLimit);
    const onGuestDirectRemaining = (e: Event) => {
      const n = (e as CustomEvent<number>).detail;
      if (typeof n === "number") setGuestDirectRemaining(n);
    };
    window.addEventListener("ai:guest-direct-remaining", onGuestDirectRemaining);
    return () => {
      window.removeEventListener("ai:guest-remaining", onGuestRemaining);
      window.removeEventListener("ai:guest-limit", onGuestLimit);
      window.removeEventListener("ai:guest-direct-remaining", onGuestDirectRemaining);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!toolsOpen) return;
    function onDoc(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [toolsOpen]);

  useEffect(() => {
    if (!modeOpen || isMobile) return;
    function onDoc(e: MouseEvent) {
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) {
        setModeOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [modeOpen, isMobile]);

  useEffect(() => {
    if (!modeOpen || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modeOpen, isMobile]);

  useEffect(() => {
    if (authBoot === "guest") return;
    if (canUseMode(plan, mode)) return;
    setMode(firstUnlockedMode(plan));
  }, [plan, authBoot, mode]);

  async function uploadFile(file: File) {
    if (attachments.length >= 2 || authBoot !== "user") return;
    setUploading(true);
    setSendErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ai/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setSendErr("server_error");
        setUploading(false);
        return;
      }
      setAttachments((a) => [
        ...a,
        { url: data.url, mime: data.mime, preview: data.url },
      ]);
    } catch {
      setSendErr("server_error");
    }
    setUploading(false);
  }

  function startDirectChat(q: string) {
    const attach = [...attachments];
    const useWeb = deepMode ? webMode : false;
    setPrompt("");
    setSendErr("");
    setAttachments([]);
    setSession({
      type: "direct",
      modelId: resolveDirectModel(deepMode, plan, directModel),
      bootstrapPrompt: q,
      bootstrapAttachments: attach.length ? attach : undefined,
      codeMode: deepMode ? codeMode : false,
      webMode: useWeb,
      deepMode,
    });
  }

  function startCompareChat(q: string) {
    setPrompt("");
    setSendErr("");
    setAttachments([]);
    setSession({
      type: "compare",
      mode: mode === "side_by_side" ? "side_by_side" : "battle",
      bootstrapPrompt: wrapPromptWithModes(q, { codeMode }),
      modelA,
      modelB,
      webMode,
    });
  }

  function handleSubmit() {
    const q = prompt.trim();
    if (!q && attachments.length === 0) return;
    if (authBoot === "user" && !canUseMode(plan, mode)) {
      setSendErr("mode_locked");
      return;
    }
    if (mode === "side_by_side" && modelA === modelB) {
      setSendErr("same_model");
      return;
    }
    if (authBoot === "guest" && mode === "side_by_side") {
      setPendingPrompt(q);
      setShowSheet(true);
      setTimeout(() => phoneRef.current?.focus(), 100);
      return;
    }
    if (authBoot === "guest" && mode === "direct" && guestDirectRemaining === 0) {
      setSendErr("guest_direct_limit");
      setShowSheet(true);
      setTimeout(() => phoneRef.current?.focus(), 100);
      return;
    }
    if (authBoot === "guest" && mode === "battle" && guestRemaining === 0) {
      setSendErr("guest_limit");
      setShowSheet(true);
      setTimeout(() => phoneRef.current?.focus(), 100);
      return;
    }
    if (mode === "direct") {
      startDirectChat(q);
      return;
    }
    startCompareChat(q);
  }

  async function handleAuth() {
    if (authBusy) return;
    setAuthErr("");
    if (!phone.trim() || !password.trim()) {
      setAuthErr("شماره و رمز را وارد کن.");
      return;
    }
    setAuthBusy(true);
    try {
      const utm = pickUtmForDb(getUtmParams());
      const res = await fetch("/api/ai/auth", {
        method: authTab === "register" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password, ...utm }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        const code = data?.error as string;
        if (code === "phone_taken") setAuthTab("login");
        setAuthErr(AUTH_ERRORS[code] ?? AUTH_ERRORS.default);
        setAuthBusy(false);
        return;
      }

      setAuthed(true);
      setAuthBoot("user");
      if (authTab === "register") trackAiSignup();
      if (data.user) {
        setCredits(data.user.credits as number);
        setPlan((data.user.plan as string) || "free");
      }
      setShowSheet(false);
      setAuthBusy(false);
      window.dispatchEvent(new Event("ai:refresh"));

      const q = pendingPrompt || prompt.trim();
      setPendingPrompt("");
      if (q) {
        if (mode === "direct") startDirectChat(q);
        else startCompareChat(q);
      }
    } catch {
      setAuthErr(AUTH_ERRORS.default);
      setAuthBusy(false);
    }
  }

  function useSuggestion(p: string) {
    setPrompt(p);
    textareaRef.current?.focus();
  }

  function pickSuggestion(p: string, openCodeStudio = false) {
    if (openCodeStudio && authBoot === "user") {
      router.push(`/ai/code?q=${encodeURIComponent(p)}`);
      return;
    }
    if (authBoot === "guest" && mode === "side_by_side") {
      setPendingPrompt(p);
      setShowSheet(true);
      setTimeout(() => phoneRef.current?.focus(), 100);
      return;
    }
    if (authBoot === "guest" && mode === "direct" && guestDirectRemaining === 0) {
      setPendingPrompt(p);
      setShowSheet(true);
      return;
    }
    if (authBoot === "user" && !canUseMode(plan, mode)) {
      setSendErr("mode_locked");
      return;
    }
    if (mode === "side_by_side" && modelA === modelB) {
      setSendErr("same_model");
      return;
    }
    setSendErr("");
    if (mode === "direct") {
      startDirectChat(p);
      return;
    }
    startCompareChat(p);
  }

  const focusComposer = useCallback((flash = true) => {
    if (flash) {
      setComposerFlash(true);
      if (composerFlashTimer.current) clearTimeout(composerFlashTimer.current);
      composerFlashTimer.current = setTimeout(() => setComposerFlash(false), 550);
    }
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const resetHome = useCallback(() => {
    setSession(null);
    setPrompt("");
    setSendErr("");
    setModeOpen(false);
    setPendingPrompt("");
    document.querySelector(".ar-home-center")?.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector(".ar-main")?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
    focusComposer(true);
  }, [focusComposer]);

  useEffect(() => {
    const onNewChat = () => resetHome();
    window.addEventListener(AI_NEW_CHAT_EVENT, onNewChat);
    return () => window.removeEventListener(AI_NEW_CHAT_EVENT, onNewChat);
  }, [resetHome]);

  useEffect(() => {
    if (consumeComposerFocusFlag()) {
      focusComposer(true);
    }
    const csPrompt = consumeContentSalesBootstrapPrompt();
    if (csPrompt) {
      setPrompt(csPrompt);
      if (authBoot === "user" && canUseMode(plan, "direct")) {
        setMode("direct");
      }
      focusComposer(true);
    }
  }, [focusComposer, authBoot, plan]);

  useEffect(() => {
    return () => {
      if (composerFlashTimer.current) clearTimeout(composerFlashTimer.current);
    };
  }, []);

  function handleNewChat() {
    requestNewChat({ pathname, navigate: (p) => router.push(p) });
  }

  const CurrentModeIcon = MODE_META[mode].Icon;
  const isLoggedIn = authBoot === "user";

  function renderModePicker(extraClass?: string) {
    const modeItems = (Object.keys(MODE_META) as Mode[]).map((m) => {
      const Meta = MODE_META[m];
      const locked =
        (authBoot === "user" && !canUseMode(plan, m)) ||
        (authBoot === "guest" && m === "side_by_side");
      const minPlan = MODE_MIN_PLAN[m];
      return (
        <button
          key={m}
          type="button"
          className={`ar-mode-item${mode === m ? " selected" : ""}${locked ? " disabled" : ""}`}
          onClick={() => {
            if (locked) {
              if (authBoot === "guest" && m === "side_by_side") {
                setShowSheet(true);
                setTimeout(() => phoneRef.current?.focus(), 100);
                setModeOpen(false);
                return;
              }
              setSendErr("mode_locked");
              return;
            }
            setMode(m);
            setModeOpen(false);
            setSendErr("");
          }}
        >
          <span className="icon"><Meta.Icon size={16} /></span>
          <span className="info">
            <b>{Meta.label}</b>
            <small>{Meta.desc}</small>
          </span>
          {locked ? (
            <span className="lock" title={`نیاز به ${PLAN_LABELS[minPlan]}`}>
              <IconLock size={12} />
            </span>
          ) : mode === m ? (
            <IconCheck size={13} />
          ) : null}
        </button>
      );
    });

    const modeSheet =
      modeOpen &&
      isMobile &&
      mounted &&
      createPortal(
        <div
          className="ar-mselect-sheet-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModeOpen(false);
          }}
        >
          <div className="ar-mselect-sheet" role="dialog" aria-label="انتخاب حالت">
            <div className="ar-mselect-sheet-head">
              <h4>انتخاب حالت</h4>
              <button
                type="button"
                className="ar-mselect-sheet-close"
                onClick={() => setModeOpen(false)}
                aria-label="بستن"
              >
                <IconX size={14} />
              </button>
            </div>
            <div className="ar-mode-sheet-list">{modeItems}</div>
            {authBoot === "user" &&
              (Object.keys(MODE_META) as Mode[]).some((m) => !canUseMode(plan, m)) && (
                <div className="ar-mselect-foot">
                  حالت‌های قفل‌شده با <Link href="/ai/pricing">خرید پکیج</Link> باز می‌شوند.
                </div>
              )}
          </div>
        </div>,
        document.body
      );

    return (
      <>
        <div className={`ar-mode-picker${extraClass ? ` ${extraClass}` : ""}`} ref={modeRef}>
          <button
            type="button"
            className="ar-mode-chip clickable"
            onClick={() => setModeOpen((v) => !v)}
          >
            <CurrentModeIcon size={13} />
            {MODE_META[mode].label}
            <span className="caret">▾</span>
          </button>
          {modeOpen && !isMobile && (
            <div className="ar-mode-pop">
              {modeItems}
              {authBoot === "user" &&
                (Object.keys(MODE_META) as Mode[]).some((m) => !canUseMode(plan, m)) && (
                  <div className="ar-mselect-foot">
                    حالت‌های قفل‌شده با <Link href="/ai/pricing">خرید پکیج</Link> باز می‌شوند.
                  </div>
                )}
            </div>
          )}
        </div>
        {modeSheet}
      </>
    );
  }

  function renderComposer(opts: { docked?: boolean; showMode?: boolean }) {
    const { docked = false, showMode = true } = opts;
    const showModelsInComposer = (!docked && showMode) || (docked && mode === "direct");

    const attachAllowed = authBoot === "user" && mode === "direct";

    const body = (
      <>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }}
        />
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="هر چی می‌خوای بپرس…"
          maxLength={4000}
          rows={docked ? 2 : undefined}
        />
        {attachments.length > 0 && (
          <div className="ar-attach-preview-row">
            {attachments.map((a) => (
              <div key={a.url} className="ar-attach-preview">
                <img src={a.preview} alt="" />
                <button
                  type="button"
                  aria-label="حذف"
                  onClick={() => setAttachments((x) => x.filter((y) => y.url !== a.url))}
                >
                  <IconX size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="ar-composer-foot">
          <div className="ar-composer-toolstrip">
            <button
              type="button"
              className={`ar-composer-tool-btn ar-composer-tool-primary${attachments.length > 0 ? " active" : ""}`}
              disabled={!attachAllowed || uploading || attachments.length >= 2}
              title={
                attachAllowed
                  ? "پیوست تصویر"
                  : authBoot !== "user"
                    ? "برای پیوست وارد شو"
                    : "فقط در گفتگوی مستقیم"
              }
              aria-label="پیوست تصویر"
              onClick={() => fileRef.current?.click()}
            >
              <IconPaperclip size={16} />
            </button>
            <div className="ar-composer-tool-secondary">
              <button
                type="button"
                className={`ar-composer-tool-btn${codeMode ? " active" : ""}`}
                title="استودیو کد — چت + فایل + ادیتور"
                aria-label="استودیو کد"
                onClick={() => {
                  if (authBoot === "user") {
                    router.push("/ai/code");
                    return;
                  }
                  setCodeMode((v) => !v);
                }}
              >
                <IconCode size={16} />
              </button>
              <button
                type="button"
                className={`ar-composer-tool-btn${webMode ? " active" : ""}`}
                title={
                  deepMode
                    ? "جستجوی وب واقعی — اطلاعات به‌روز از اینترنت"
                    : "جستجوی وب فقط در حالت تفکر عمیق"
                }
                aria-label="جستجوی وب"
                disabled={!deepMode}
                onClick={() => setWebMode((v) => !v)}
              >
                <IconGlobe size={16} />
              </button>
            </div>
            <div className="ar-composer-overflow-wrap" ref={toolsRef}>
              <button
                type="button"
                className="ar-composer-tool-btn ar-composer-overflow-btn"
                aria-label="ابزارهای بیشتر"
                aria-expanded={toolsOpen}
                onClick={() => setToolsOpen((v) => !v)}
              >
                <IconDots size={16} />
              </button>
              {toolsOpen && (
                <div className="ar-composer-overflow-menu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className={`ar-composer-overflow-item${codeMode ? " active" : ""}`}
                    onClick={() => {
                      setToolsOpen(false);
                      if (authBoot === "user") {
                        router.push("/ai/code");
                        return;
                      }
                      setCodeMode((v) => !v);
                    }}
                  >
                    <IconCode size={16} />
                    استودیو کد
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={`ar-composer-overflow-item${webMode ? " active" : ""}`}
                    disabled={!deepMode}
                    onClick={() => {
                      setToolsOpen(false);
                      setWebMode((v) => !v);
                    }}
                  >
                    <IconGlobe size={16} />
                    جستجوی وب
                  </button>
                </div>
              )}
            </div>
            {(mode === "direct") && (
              <div className="ar-speed-switch" role="group" aria-label="سرعت پاسخ">
                <button
                  type="button"
                  className={`ar-speed-switch-btn${!deepMode ? " active" : ""}`}
                  aria-pressed={!deepMode}
                  onClick={() => {
                    setDeepMode(false);
                    setWebMode(false);
                  }}
                >
                  سریع
                </button>
                <button
                  type="button"
                  className={`ar-speed-switch-btn${deepMode ? " active" : ""}`}
                  aria-pressed={deepMode}
                  onClick={() => setDeepMode(true)}
                >
                  تفکر عمیق
                </button>
              </div>
            )}
            {showModelsInComposer && renderModePicker()}
            {showModelsInComposer && mode === "side_by_side" && (
              <>
                <ModelSelect picker="compare" value={modelA} onChange={setModelA} plan={plan} exclude={modelB} />
                <ModelSelect picker="compare" value={modelB} onChange={setModelB} plan={plan} exclude={modelA} />
              </>
            )}
            {showModelsInComposer && mode === "direct" && (
              <ModelSelect picker="direct" value={directModel} onChange={setDirectModel} plan={plan} />
            )}
          </div>
          <div className="ar-composer-actions">
            {showModelsInComposer && (
              <button
                type="button"
                className="ar-composer-tool-btn"
                aria-label="حالت گفتگو"
                title={MODE_META[mode].label}
                onClick={() => setModeOpen((v) => !v)}
              >
                <IconLayout size={16} />
              </button>
            )}
            <button
              type="button"
              className={`ar-send-btn${docked ? " ar-send-btn--dock" : ""}`}
              onClick={handleSubmit}
              disabled={(!prompt.trim() && attachments.length === 0) || uploading}
              aria-label="ارسال"
            >
              <IconSend size={docked ? 16 : 17} />
            </button>
          </div>
        </div>
      </>
    );

    return (
      <div
        className={`ar-composer${docked ? " ar-composer--dock" : ""}${composerFlash ? " ar-composer--flash" : ""}`}
      >
        <div className="ar-composer-box">{body}</div>
        {sendErr === "guest_limit" && (
          <div className="ar-composer-err">۲ نبرد رایگان تمام شد — برای ادامه ثبت‌نام کن.</div>
        )}
        {sendErr === "guest_direct_limit" && (
          <div className="ar-composer-err">
            {MAX_GUEST_DIRECT.toLocaleString("fa-IR")} پیام رایگان تمام شد —{" "}
            <button type="button" className="ar-link-btn" onClick={() => setShowSheet(true)}>
              ثبت‌نام کن
            </button>
          </div>
        )}
        {sendErr === "credits_out" && (
          <div className="ar-composer-err">
            کردیت‌هایت تمام شده —{" "}
            <Link href="/ai/content-sales">Content & Sales Bundle</Link>
            {" · "}
            <Link href="/ai/pricing">خرید کردیت</Link>
          </div>
        )}
        {sendErr === "plan_locked" && (
          <div className="ar-composer-err">
            این مدل در پلن فعلی تو نیست — <Link href="/ai/pricing">ارتقاء پلن</Link>
          </div>
        )}
        {sendErr === "mode_locked" && (
          <div className="ar-composer-err">
            این حالت در پلن فعلی تو نیست — <Link href="/ai/pricing">خرید پکیج</Link>
          </div>
        )}
        {sendErr === "same_model" && (
          <div className="ar-composer-err">برای مقایسه، دو مدل متفاوت انتخاب کن.</div>
        )}
        {sendErr === "ai_error" && (
          <div className="ar-composer-err">مدل‌ها پاسخ ندادند. دوباره تلاش کن.</div>
        )}
        {sendErr === "server_error" && (
          <div className="ar-composer-err">خطایی پیش آمد. دوباره تلاش کن.</div>
        )}
      </div>
    );
  }

  function renderBanners() {
    return (
      <>
        {banner === "success" && (
          <div className="ar-banner success">
            <IconCheck size={15} />
            پرداخت موفق بود — کردیت‌ها به حسابت اضافه شد.
          </div>
        )}
        {banner === "failed" && (
          <div className="ar-banner error">
            <IconX size={14} />
            پرداخت ناموفق بود. دوباره تلاش کن.
          </div>
        )}
      </>
    );
  }

  function renderModelBar() {
    if (mode === "battle" || mode === "direct") return null;
    return (
      <div className="ar-home-modelbar">
        {mode === "side_by_side" && (
          <>
            <ModelSelect
              variant="bar"
              sheetOnMobile
              picker="compare"
              value={modelA}
              onChange={setModelA}
              plan={plan}
              exclude={modelB}
              label="مدل A"
            />
            <ModelSelect
              variant="bar"
              sheetOnMobile
              picker="compare"
              value={modelB}
              onChange={setModelB}
              plan={plan}
              exclude={modelA}
              label="مدل B"
            />
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {authBoot === "pending" && (
        <div className="ar-home-workspace">
          <ArenaPageSkeleton label="در حال بارگذاری" />
        </div>
      )}
      {isLoggedIn ? (
        <div className="ar-home-workspace">
          {renderBanners()}
          <header className="ar-home-header">
            <div className="ar-home-topbar">
              <button
                type="button"
                className="ar-home-menu"
                onClick={() => window.dispatchEvent(new Event("ai:open-drawer"))}
                aria-label="باز کردن منو"
              >
                <IconMenu size={19} />
              </button>
              {renderModePicker("ar-home-mode")}
              <button
                type="button"
                className="ar-home-newchat"
                onClick={handleNewChat}
                aria-label="گفتگوی جدید"
                title="گفتگوی جدید"
              >
                <IconNewChat size={17} />
              </button>
            </div>
            {!session && renderModelBar()}
          </header>
          {session ? (
            <div className="ar-main--chat">
              {session.type === "direct" ? (
                <DirectChatView
                  modelId={session.modelId}
                  bootstrapPrompt={session.bootstrapPrompt}
                  bootstrapAttachments={session.bootstrapAttachments}
                  initialCodeMode={session.codeMode}
                  initialWebMode={session.webMode}
                  onCreditsChange={(n) => {
                    setCredits(n);
                    setCtxCredits(n);
                  }}
                  plan={plan}
                />
              ) : (
                <CompareSessionView
                  mode={session.mode}
                  bootstrapPrompt={session.bootstrapPrompt}
                  webSearch={session.webMode}
                  modelAId={session.modelA}
                  modelBId={session.modelB}
                  onCreditsChange={(n) => {
                    setCredits(n);
                    setCtxCredits(n);
                  }}
                />
              )}
            </div>
          ) : (
            <>
              <div className="ar-home-center">
                <h2 className="ar-home-prompt">چه کاری می‌خوای انجام بدی؟</h2>
                <p className="ar-home-sub">
                  سؤال بپرس، تصویر بساز، یا دو مدل را مقایسه کن —{" "}
                  {credits !== null
                    ? formatStarterCredits(credits)
                    : "≈ ۵۰ پرسش سریع · ≈ ۲ تصویر · ≈ ۱ ویدیو کوتاه"}
                </p>
                <div className="ar-quick-pills" role="navigation" aria-label="میانبرها">
                  <Link href="/ai/image" className="ar-quick-pill ar-quick-pill--image">
                    <span className="ar-quick-pill-icon" aria-hidden>
                      <IconImage size={15} />
                    </span>
                    <span className="ar-quick-pill-text">ساخت عکس</span>
                  </Link>
                  <Link href="/ai/video" className="ar-quick-pill ar-quick-pill--video">
                    <span className="ar-quick-pill-icon" aria-hidden>
                      <IconVideo size={15} />
                    </span>
                    <span className="ar-quick-pill-text">ساخت ویدیو</span>
                  </Link>
                  <Link href="/ai/personas" className="ar-quick-pill ar-quick-pill--persona">
                    <span className="ar-quick-pill-icon" aria-hidden>
                      <IconSpark size={15} />
                    </span>
                    <span className="ar-quick-pill-text">شخصیت‌ها</span>
                  </Link>
                  <Link href="/ai/music" className="ar-quick-pill ar-quick-pill--music">
                    <span className="ar-quick-pill-icon" aria-hidden>
                      <IconMusic size={15} />
                    </span>
                    <span className="ar-quick-pill-text">ساخت موزیک</span>
                  </Link>
                  <button
                    type="button"
                    className="ar-quick-pill ar-quick-pill--battle"
                    onClick={() => {
                      setMode("battle");
                      focusComposer(true);
                    }}
                  >
                    <span className="ar-quick-pill-icon" aria-hidden>
                      <IconSwords size={15} />
                    </span>
                    <span className="ar-quick-pill-text">نبرد مدل‌ها</span>
                  </button>
                </div>
                <PersonaHomeRow />
                <div className="ar-suggest-label">شروع کن</div>
                <div className="ar-suggest-grid ar-suggest-grid--home">
                  {SUGGESTIONS.slice(0, 4).map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className="ar-suggest-card"
                      onClick={() =>
                        pickSuggestion(
                          s.prompt,
                          "codeStudio" in s && !!(s as { codeStudio?: boolean }).codeStudio
                        )
                      }
                    >
                      <span className="ar-suggest-icon">
                        <s.Icon size={16} />
                      </span>
                      <span>
                        <b>{s.title}</b>
                        <small>{s.desc}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="ar-home-composer">
                {renderComposer({ docked: true, showMode: false })}
              </div>
            </>
          )}
        </div>
      ) : authBoot === "guest" ? (
        <>
      {session ? (
        <div className="ar-home-workspace ar-guest-session">
          <div className="ar-main--chat">
            {session.type === "direct" ? (
              <DirectChatView
                modelId="economy"
                bootstrapPrompt={session.bootstrapPrompt}
                bootstrapAttachments={session.bootstrapAttachments}
                guestMode
              />
            ) : (
              <CompareSessionView
                mode={session.mode}
                bootstrapPrompt={session.bootstrapPrompt}
                webSearch={session.webMode}
                modelAId={session.modelA}
                modelBId={session.modelB}
              />
            )}
          </div>
        </div>
      ) : (
      <main className="ar-container ar-guest-home">
        {renderBanners()}

        <div className="ar-quick-pills ar-quick-pills--guest" role="navigation" aria-label="میانبرها">
          <Link href="/ai/image" className="ar-quick-pill ar-quick-pill--image">
            <span className="ar-quick-pill-icon" aria-hidden>
              <IconImage size={15} />
            </span>
            <span className="ar-quick-pill-text">ساخت عکس</span>
          </Link>
          <Link href="/ai/video" className="ar-quick-pill ar-quick-pill--video">
            <span className="ar-quick-pill-icon" aria-hidden>
              <IconVideo size={15} />
            </span>
            <span className="ar-quick-pill-text">ساخت ویدیو</span>
          </Link>
          <Link href="/ai/personas" className="ar-quick-pill ar-quick-pill--persona">
            <span className="ar-quick-pill-icon" aria-hidden>
              <IconSpark size={15} />
            </span>
            <span className="ar-quick-pill-text">شخصیت‌ها</span>
          </Link>
          <Link href="/ai/music" className="ar-quick-pill ar-quick-pill--music">
            <span className="ar-quick-pill-icon" aria-hidden>
              <IconMusic size={15} />
            </span>
            <span className="ar-quick-pill-text">ساخت موزیک</span>
          </Link>
        </div>

        {renderComposer({ showMode: true })}

        <PersonaHomeRow />

        <section className="ar-hero ar-hero--slim">
          <div className="ar-hero-mark">
            <IconSpark size={18} />
            آرایه AI
          </div>
          <h1>
            چت فارسی، <span className="ar-hl">بدون VPN</span> — پرداخت تومان
          </h1>
          <p className="ar-hero-proof">
            {guestDirectRemaining !== null && guestRemaining !== null
              ? `${formatFreeAllowanceGuest(guestRemaining, guestDirectRemaining)} — بعد ثبت‌نام ۵ پرسش`
              : `${formatFreeAllowanceGuest(2, MAX_GUEST_DIRECT)} — بعد ثبت‌نام ۵ پرسش`}
          </p>
          <Link href="/ai/leaderboard" className="ar-hero-link">
            لیدربورد مدل‌ها ←
          </Link>
        </section>

        <div className="ar-suggest-label">شروع کن</div>
        <div className="ar-suggest-grid">
          {SUGGESTIONS.slice(0, 4).map((s, i) => (
            <button key={i} className="ar-suggest-card" onClick={() => useSuggestion(s.prompt)}>
              <span className="ar-suggest-icon">
                <s.Icon size={16} />
              </span>
              <span>
                <b>{s.title}</b>
                <small>{s.desc}</small>
              </span>
            </button>
          ))}
        </div>
        {/* Trust — درباره ما / پشتیبانی / پرداخت امن */}
        <section className="ar-trust" id="support">
          <div className="ar-trust-grid">
            <div className="ar-trust-card">
              <div className="head">
                <IconSpark size={16} />
                درباره ما
              </div>
              <p>
                آرایه AI محصولی از <a href="/">آرایه</a> است — تیم توسعه نرم‌افزار
                اختصاصی که برای ده‌ها کسب‌وکار ایرانی سایت، CRM و ابزار هوش مصنوعی
                ساخته است. این محصول با همان استاندارد، دسترسی به بهترین مدل‌های
                دنیا را بدون VPN و دلار ممکن می‌کند.
              </p>
            </div>
            <div className="ar-trust-card">
              <div className="head">
                <IconPhone size={16} />
                پشتیبانی
              </div>
              <p>پاسخ‌گوی سؤال، مشکل پرداخت یا هر ابهامی هستیم:</p>
              <div className="row">
                تلفن: <a href="tel:02128426699" dir="ltr">۰۲۱-۲۸۴۲۶۶۹۹</a>
              </div>
              <div className="row">
                ایمیل: <a href="mailto:support@araaye.com" dir="ltr">support@araaye.com</a>
              </div>
            </div>
            <div className="ar-trust-card">
              <div className="head">
                <IconShield size={16} />
                پرداخت امن
              </div>
              <p>
                پرداخت‌ها از طریق درگاه رسمی زیبال انجام می‌شود و کردیت‌ها
                بلافاصله به حسابت اضافه می‌شوند و منقضی نمی‌شوند. اگر پرداختی
                ناموفق بود ولی مبلغ کسر شد، طبق قوانین شاپرک برمی‌گردد.
              </p>
            </div>
          </div>
        </section>
      </main>
      )}

      <footer className="ar-footer">
        <div className="ar-container">
          محصولی از <Link href="/">آرایه</Link> — پاسخ‌ها توسط مدل‌های هوش مصنوعی تولید می‌شوند و ممکن است نادرست باشند.
        </div>
      </footer>

        </>
      ) : null}

      {/* Auth sheet */}
      {showSheet && (
        <div
          className="ar-sheet-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSheet(false);
          }}
        >
          <div className="ar-sheet">
            <div className="ar-sheet-head">
              <h3>{authTab === "register" ? "ثبت‌نام سریع" : "ورود"}</h3>
              <button className="ar-sheet-close" onClick={() => setShowSheet(false)} aria-label="بستن">
                <IconX size={14} />
              </button>
            </div>
            <p className="ar-sheet-sub">
              {pendingPrompt
                ? "برای شروع، فقط شماره موبایل و یک رمز لازم است."
                : "با شماره موبایل و رمز وارد شو."}
            </p>

            <div className="ar-tabs">
              <button
                className={`ar-tab${authTab === "register" ? " active" : ""}`}
                onClick={() => { setAuthTab("register"); setAuthErr(""); }}
              >
                ثبت‌نام
              </button>
              <button
                className={`ar-tab${authTab === "login" ? " active" : ""}`}
                onClick={() => { setAuthTab("login"); setAuthErr(""); }}
              >
                ورود
              </button>
            </div>

            <div className="ar-field">
              <label>شماره موبایل</label>
              <input
                ref={phoneRef}
                type="tel"
                inputMode="tel"
                placeholder="09xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
            <div className="ar-field">
              <label>{authTab === "register" ? "یک رمز بساز (حداقل ۶ کاراکتر)" : "رمز عبور"}</label>
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                autoComplete={authTab === "register" ? "new-password" : "current-password"}
              />
            </div>

            {authErr && <div className="ar-auth-err">{authErr}</div>}

            <button className="ar-btn ar-btn-primary ar-btn-block" onClick={handleAuth} disabled={authBusy}>
              {authBusy
                ? "لطفاً صبر کن…"
                : authTab === "register"
                  ? "ثبت‌نام و شروع"
                  : "ورود"}
            </button>

            <p className="ar-auth-note">
              با ثبت‌نام ۵ پرسش رایگان می‌گیری.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
