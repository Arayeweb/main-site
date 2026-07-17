"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
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
  IconGlobe,
  IconCode,
  IconColumns,
  IconChat,
  IconLayout,
  IconNewChat,
  IconPaperclip,
  IconMenu,
  IconLock,
  IconDots,
  IconDiamond,
  IconPen,
  IconBulb,
  BrandGlyph,
} from "./icons";
import ModelSelect from "./ModelSelect";
import { resolvePickedModel, type ModelPick } from "./ChatModelBar";
import PlanUpsellBanner from "./PlanUpsellBanner";
import ModeSelector from "./ModeSelector";
import HomeCompactDropdown from "./HomeCompactDropdown";
import { invalidateArenaAuthCache, useArenaAuth } from "./ArenaAuthContext";
import { ArenaChatSkeleton, ArenaPageSkeleton } from "./ArenaSkeleton";

const DirectChatView = dynamic(() => import("./DirectChatView"), {
  loading: () => <ArenaChatSkeleton />,
});
const CompareSessionView = dynamic(() => import("./CompareSessionView"), {
  loading: () => <ArenaChatSkeleton />,
});
const CouncilSessionView = dynamic(() => import("./CouncilSessionView"), {
  loading: () => <ArenaChatSkeleton />,
});
import {
  CS_BOOTSTRAP_PROMPT_KEY,
  consumeContentSalesBootstrapPrompt,
} from "@/lib/contentSalesOpenInAi";
import {
  AI_NEW_CHAT_EVENT,
  AI_ANALYZE_TEXT_EVENT,
  ANALYZE_TEXT_PROMPT,
  consumeAnalyzeTextFlag,
  consumeComposerFocusFlag,
  requestNewChat,
} from "@/lib/aiNewChat";
import {
  wrapPromptWithModes,
  type PendingAttachment,
} from "./composerHelpers";
import { canUseMode, canUseModel, MODE_MIN_PLAN } from "@/lib/aiCredits";
import { PLAN_LABELS, planRank } from "@/lib/aiPackages";
import { directModels, getModel } from "@/lib/aiModels";
import { captureCampaignParams, trackAiPurchase, trackAiSignup } from "@/lib/aiTracking";
import { getStoredPromoCode, pickUtmForDb, getUtmParams } from "@/lib/utm";

type AuthBoot = "pending" | "guest" | "user";

type Mode = "battle" | "side_by_side" | "direct";

type ActiveSession =
  | {
      type: "direct";
      title: string;
      modelId: string;
      bootstrapPrompt: string;
      bootstrapAttachments?: PendingAttachment[];
      codeMode?: boolean;
      webMode?: boolean;
      deepMode?: boolean;
    }
  | {
      type: "compare";
      title: string;
      bootstrapPrompt: string;
      modelA: string;
      modelB: string;
      webMode?: boolean;
    }
  | {
      type: "council";
      title: string;
      bootstrapPrompt: string;
      modelA?: string;
      modelB?: string;
    };

const MODE_META: Record<Mode, { label: string; desc: string; Icon: typeof IconSwords }> = {
  direct: { label: "سریع", desc: "یک مدل، پاسخ فوری", Icon: IconChat },
  side_by_side: { label: "مقایسه", desc: "چند مدل، پاسخ کنار هم", Icon: IconColumns },
  battle: { label: "همفکری", desc: "چند AI، نقد و جمع‌بندی بهتر", Icon: IconSpark },
};

function firstUnlockedMode(plan: string): Mode {
  const order: Mode[] = ["direct", "battle", "side_by_side"];
  return order.find((m) => canUseMode(plan, m)) ?? "battle";
}

const HOME_SUGGESTIONS: {
  key: string;
  title: string;
  subtitle: string;
  prompt: string;
  Icon: typeof IconPen;
  mode?: Mode;
}[] = [
  {
    key: "write",
    title: "نوشتن و بازنویسی",
    subtitle: "یک متن حرفه‌ای بساز",
    prompt: "یک متن حرفه‌ای برای این موضوع بنویس:\n\n",
    Icon: IconPen,
  },
  {
    key: "file",
    title: "تحلیل فایل",
    subtitle: "خلاصه و نکات مهم",
    prompt: "این متن/فایل را خلاصه کن و نکات مهم را بگو:\n\n",
    Icon: IconPaperclip,
  },
  {
    key: "decide",
    title: "تصمیم‌گیری",
    subtitle: "چند دیدگاه متفاوت",
    prompt: "برای این تصمیم چند دیدگاه متفاوت بده و کمک کن انتخاب کنم:\n\n",
    Icon: IconColumns,
    mode: "side_by_side",
  },
  {
    key: "solve",
    title: "حل مسئله",
    subtitle: "راهنمای قدم‌به‌قدم",
    prompt: "این مسئله را قدم‌به‌قدم حل کن:\n\n",
    Icon: IconBulb,
  },
];

const MODEL_PICK_OPTIONS: {
  id: ModelPick;
  label: string;
  desc: string;
  brand?: "openai" | "claude" | "gemini" | "deepseek";
}[] = [
  { id: "auto", label: "خودکار", desc: "انتخاب هوشمند" },
  { id: "precise", label: "GPT", desc: "سریع و عمومی", brand: "openai" },
  { id: "critic", label: "Claude", desc: "تحلیل و نوشتار", brand: "claude" },
  { id: "creative", label: "Gemini", desc: "چندمنظوره", brand: "gemini" },
  { id: "economy", label: "DeepSeek", desc: "اقتصادی و سریع", brand: "deepseek" },
];

const SPEED_OPTIONS = [
  { id: "fast" as const, label: "سریع", desc: "مناسب سؤال‌های روزمره" },
  { id: "deep" as const, label: "عمیق", desc: "استدلال و تحلیل بیشتر" },
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
  children,
}: {
  children?: ReactNode;
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

  const [authed, setAuthed] = useState<boolean | null>(ctxAuthed);
  const [authBoot, setAuthBoot] = useState<AuthBoot>(
    ctxAuthed === null ? "pending" : ctxAuthed ? "user" : "guest"
  );
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>(ctxPlan);
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
  const [modelPick, setModelPick] = useState<ModelPick>("auto");

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
  const [authRedirect, setAuthRedirect] = useState<string | null>(null);
  const [composerFlash, setComposerFlash] = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const [webMode, setWebMode] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [composerNotice, setComposerNotice] = useState("");
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
    const next = params.get("next");
    if (next?.startsWith("/") && !next.startsWith("//")) {
      setAuthRedirect(next);
    }

    // Prefill from /prompts "Run in Araaye AI" links (?prompt=...)
    const urlPrompt = params.get("prompt");
    if (urlPrompt) {
      try {
        sessionStorage.setItem(CS_BOOTSTRAP_PROMPT_KEY, urlPrompt);
      } catch {
        /* ignore */
      }
    }

    if (p || params.get("login") || urlPrompt || next) {
      window.history.replaceState({}, "", "/ai");
    }

    const urlMode = params.get("mode");
    const urlModeValid =
      urlMode === "battle" || urlMode === "direct" || urlMode === "side_by_side";

    if (urlModeValid) {
      setMode(urlMode as Mode);
    } else if (ctxAuthed === false) {
      setMode("direct");
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
    const mq = window.matchMedia("(max-width: 900px)");
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
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
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
    setComposerNotice("");
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
        {
          url: data.url,
          mime: data.mime,
          preview: data.mime?.startsWith("image/") ? data.url : "",
          name: data.name,
          size: data.size,
          text: data.text,
        },
      ]);
      if (String(data.mime ?? "").startsWith("image/")) ensureVisionDirectModel();
    } catch {
      setSendErr("server_error");
    }
    setUploading(false);
  }

  function ensureVisionDirectModel(resolvedModel?: string): string | null {
    const currentId = resolvedModel ?? resolvePickedModel(modelPick, deepMode, plan, directModel);
    const current = getModel(currentId);
    if (current?.capabilities?.vision && canUseModel(plan, current)) {
      return currentId;
    }

    const next = directModels().find((m) => m.capabilities?.vision && canUseModel(plan, m));
    if (!next) return null;

    setDirectModel(next.id);
    setModelPick(next.id as ModelPick);
    setComposerNotice(`برای تحلیل تصویر، مدل به ${next.name} تغییر کرد.`);
    return next.id;
  }

  function startDirectChat(q: string) {
    const attach = [...attachments];
    const useWeb = deepMode ? webMode : false;
    const picked = resolvePickedModel(modelPick, deepMode, plan, directModel);
    const hasImageAttachment = attach.some((a) => a.mime.startsWith("image/"));
    const resolved = hasImageAttachment ? ensureVisionDirectModel(picked) : picked;
    if (hasImageAttachment && !resolved) {
      setSendErr("no_vision");
      return;
    }
    const finalModel = resolved ?? picked;
    setPrompt("");
    setSendErr("");
    setComposerNotice("");
    setAttachments([]);
    setSession({
      type: "direct",
      title: q,
      modelId: finalModel,
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
      title: q,
      bootstrapPrompt: wrapPromptWithModes(q, { codeMode }),
      modelA,
      modelB,
      webMode,
    });
  }

  function startCouncilChat(q: string) {
    setPrompt("");
    setSendErr("");
    setAttachments([]);
    setSession({
      type: "council",
      title: q,
      bootstrapPrompt: wrapPromptWithModes(q, { codeMode }),
      modelA,
      modelB,
    });
  }

  function promptGuestLogin(q?: string) {
    if (q) setPendingPrompt(q);
    setSendErr("");
    setShowSheet(true);
    setTimeout(() => phoneRef.current?.focus(), 100);
  }

  function requireGuestAuth(): boolean {
    if (authBoot === "guest") {
      promptGuestLogin();
      return true;
    }
    return false;
  }

  function isModeLocked(m: Mode): boolean {
    // Compare is free to try; only council stays plan-gated (Pro).
    if (m === "battle") {
      if (authBoot === "guest") return true;
      return planRank(plan) < planRank("pro");
    }
    return false;
  }

  function handleModeSelect(m: Mode) {
    if (isModeLocked(m)) {
      if (authBoot === "guest") {
        setShowSheet(true);
        setTimeout(() => phoneRef.current?.focus(), 100);
        return;
      }
      setSendErr("mode_locked");
      return;
    }
    setMode(m);
    setSendErr("");
  }

  function handleSubmit() {
    if (uploading) return;
    const q = prompt.trim();
    if (!q && attachments.length === 0) {
      if (authBoot === "guest") {
        promptGuestLogin();
        return;
      }
      return;
    }
    if (authBoot === "guest") {
      promptGuestLogin(q);
      return;
    }
    if (authBoot === "user" && !canUseMode(plan, mode)) {
      setSendErr("mode_locked");
      return;
    }
    if ((mode === "side_by_side" || mode === "battle") && modelA === modelB) {
      setSendErr("same_model");
      return;
    }
    if (mode === "direct") {
      startDirectChat(q);
      return;
    }
    if (mode === "battle") {
      if (planRank(plan) < planRank("pro")) {
        setSendErr("mode_locked");
        return;
      }
      startCouncilChat(q);
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
      invalidateArenaAuthCache();
      window.dispatchEvent(new Event("ai:refresh"));

      if (authRedirect) {
        window.location.assign(authRedirect);
        return;
      }

      const q = pendingPrompt || prompt.trim();
      setPendingPrompt("");
      if (q) {
        if (mode === "direct") startDirectChat(q);
        else if (mode === "battle") startCouncilChat(q);
        else startCompareChat(q);
      }
    } catch {
      setAuthErr(AUTH_ERRORS.default);
      setAuthBusy(false);
    }
  }

  function applyHomeSuggestion(item: (typeof HOME_SUGGESTIONS)[number]) {
    if (item.mode) {
      if (isModeLocked(item.mode)) {
        handleModeSelect(item.mode);
        return;
      }
      setMode(item.mode);
    } else {
      setMode("direct");
    }
    setPrompt(item.prompt);
    setSendErr("");
    focusComposer(true);
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

  // تغییر حالت در حین چت = شروع گفتگوی تازه با همان حالت
  const switchModeFromChat = useCallback(
    (m: Mode) => {
      setSession(null);
      setMode(m);
      setPrompt("");
      setSendErr("");
      setModeOpen(false);
      setPendingPrompt("");
      focusComposer(true);
    },
    [focusComposer]
  );

  useEffect(() => {
    const onNewChat = () => resetHome();
    const onAnalyze = () => {
      setSession(null);
      setMode("direct");
      setPrompt(ANALYZE_TEXT_PROMPT);
      focusComposer(false);
    };
    window.addEventListener(AI_NEW_CHAT_EVENT, onNewChat);
    window.addEventListener(AI_ANALYZE_TEXT_EVENT, onAnalyze);
    return () => {
      window.removeEventListener(AI_NEW_CHAT_EVENT, onNewChat);
      window.removeEventListener(AI_ANALYZE_TEXT_EVENT, onAnalyze);
    };
  }, [resetHome, focusComposer]);

  useEffect(() => {
    if (consumeComposerFocusFlag()) {
      focusComposer(true);
    }
    if (consumeAnalyzeTextFlag()) {
      setSession(null);
      setMode("direct");
      setPrompt(ANALYZE_TEXT_PROMPT);
      focusComposer(false);
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
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const min = 40;
    const max = 100;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, min), max)}px`;
  }, [prompt, session]);

  useEffect(() => {
    return () => {
      if (composerFlashTimer.current) clearTimeout(composerFlashTimer.current);
    };
  }, []);

  function handleNewChat() {
    requestNewChat({ pathname, navigate: (p) => router.push(p) });
  }

  const CurrentModeIcon = MODE_META[mode].Icon;
  function renderModePicker(extraClass?: string) {
    const modeItems = (Object.keys(MODE_META) as Mode[]).map((m) => {
      const Meta = MODE_META[m];
      const locked = isModeLocked(m);
      const minPlan = MODE_MIN_PLAN[m];
      return (
        <button
          key={m}
          type="button"
          className={`ar-mode-item${mode === m ? " selected" : ""}${locked ? " disabled" : ""}`}
          onClick={() => {
            if (locked) {
              if (authBoot === "guest") {
                setShowSheet(true);
                setTimeout(() => phoneRef.current?.focus(), 100);
                setModeOpen(false);
                return;
              }
              setSendErr("mode_locked");
              return;
            }
            if (session) {
              if (m !== mode) switchModeFromChat(m);
              else setModeOpen(false);
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
            <span className="lock" title={`نیاز به ${PLAN_LABELS[minPlan === "free" && m === "battle" ? "pro" : minPlan]}`}>
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

  function renderComposer(opts: {
    docked?: boolean;
    showMode?: boolean;
    simplified?: boolean;
    compactHome?: boolean;
    placeholder?: string;
  }) {
    const {
      docked = false,
      showMode = true,
      simplified = docked,
      compactHome = false,
      placeholder,
    } = opts;
    const showModelsInComposer = !simplified && ((!docked && showMode) || (docked && mode === "direct"));
    const attachAllowed = authBoot === "user" && mode === "direct";
    const hasInput = !!prompt.trim() || attachments.length > 0;
    const sendReady = hasInput;
    const sendDisabled = uploading || !hasInput;

    const syncTextareaHeight = (el: HTMLTextAreaElement) => {
      el.style.height = "auto";
      const min = compactHome ? 40 : docked ? 52 : 88;
      const max = compactHome ? 100 : 180;
      el.style.height = `${Math.min(Math.max(el.scrollHeight, min), max)}px`;
    };

    const overflowMenu = toolsOpen && (
      <div className="ar-composer-overflow-menu" role="menu">
        <button
          type="button"
          role="menuitem"
          className={`ar-composer-overflow-item${codeMode ? " active" : ""}`}
          onClick={() => {
            setToolsOpen(false);
            if (requireGuestAuth()) return;
            router.push("/ai/code");
          }}
        >
          <IconCode size={16} />
          استودیو کد
        </button>
        <button
          type="button"
          role="menuitem"
          className={`ar-composer-overflow-item${webMode ? " active" : ""}`}
          onClick={() => {
            setToolsOpen(false);
            if (requireGuestAuth()) return;
            if (!deepMode) setDeepMode(true);
            setWebMode((v) => !v);
          }}
        >
          <IconGlobe size={16} />
          جستجوی وب
        </button>
        {(simplified || showMode) && (
          <>
            {(Object.keys(MODE_META) as Mode[]).map((m) => {
              const Meta = MODE_META[m];
              const locked = isModeLocked(m);
              return (
                <button
                  key={m}
                  type="button"
                  role="menuitem"
                  className={`ar-composer-overflow-item${mode === m ? " active" : ""}`}
                  onClick={() => {
                    setToolsOpen(false);
                    if (locked) {
                      handleModeSelect(m);
                      return;
                    }
                    setMode(m);
                    setSendErr("");
                    if (m === "side_by_side") focusComposer(true);
                  }}
                >
                  <Meta.Icon size={16} />
                  {Meta.label}
                </button>
              );
            })}
          </>
        )}
      </div>
    );

    const modelDropdownOptions = MODEL_PICK_OPTIONS.map((m) => {
      const locked =
        m.id !== "auto" &&
        (() => {
          const model = getModel(m.id);
          return model ? !canUseModel(plan, model) : false;
        })();
      return {
        id: m.id,
        label: m.label,
        desc: m.desc,
        locked,
        glyph: m.brand ? <BrandGlyph brand={m.brand} size={13} /> : undefined,
      };
    });

    const body = (
      <>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,text/markdown,text/csv,application/json,.docx"
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
          onChange={(e) => {
            setPrompt(e.target.value);
            syncTextareaHeight(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={
            placeholder ??
            (compactHome
              ? "سؤالت را بنویس…"
              : "سوالت را بنویس؛ آرایه بهترین مسیر پاسخ را انتخاب می‌کند...")
          }
          maxLength={4000}
          rows={compactHome ? 1 : docked ? 2 : undefined}
        />
        {(attachments.length > 0 || uploading) && (
          <div className="ar-attach-preview-row">
            {attachments.map((a) => (
              <div key={a.url} className="ar-attach-preview">
                {a.mime.startsWith("image/") ? (
                  <img src={a.preview} alt="" />
                ) : (
                  <span className="ar-attach-file-label">{a.name?.split(".").pop()?.toUpperCase() || "FILE"}</span>
                )}
                <button
                  type="button"
                  aria-label="حذف"
                  onClick={() => setAttachments((x) => x.filter((y) => y.url !== a.url))}
                >
                  <IconX size={12} />
                </button>
              </div>
            ))}
            {uploading && (
              <div className="ar-attach-preview ar-attach-uploading" role="status" aria-live="polite">
                <span className="ar-upload-spinner" aria-hidden="true" />
                <span>در حال آپلود</span>
              </div>
            )}
          </div>
        )}
        <div
          className={`ar-composer-foot${simplified || compactHome ? " ar-composer-foot--simple" : ""}${
            compactHome ? " ar-composer-foot--compact" : ""
          }`}
        >
          <div className="ar-composer-toolstrip">
            <button
              type="button"
              className={`ar-composer-tool-btn ar-composer-tool-primary${attachments.length > 0 || uploading ? " active" : ""}${!attachAllowed ? " ar-composer-tool-btn--muted" : ""}`}
              disabled={uploading || (attachAllowed && attachments.length >= 2)}
              title={
                attachAllowed
                  ? "پیوست تصویر"
                  : authBoot !== "user"
                    ? "برای پیوست وارد شو"
                    : "فقط در چت مستقیم"
              }
              aria-label="پیوست تصویر"
              onClick={() => {
                if (authBoot !== "user") {
                  promptGuestLogin();
                  return;
                }
                if (!attachAllowed) return;
                fileRef.current?.click();
              }}
            >
              {uploading ? <span className="ar-upload-spinner" aria-hidden="true" /> : <IconPaperclip size={16} />}
            </button>
            {!simplified && !compactHome && (
              <div className="ar-composer-tool-secondary">
                <button
                  type="button"
                  className={`ar-composer-tool-btn${codeMode ? " active" : ""}`}
                  title="استودیو کد"
                  aria-label="استودیو کد"
                  onClick={() => {
                    if (requireGuestAuth()) return;
                    router.push("/ai/code");
                  }}
                >
                  <IconCode size={16} />
                </button>
                <button
                  type="button"
                  className={`ar-composer-tool-btn${webMode ? " active" : ""}`}
                  title="جستجوی وب"
                  aria-label="جستجوی وب"
                  onClick={() => {
                    if (requireGuestAuth()) return;
                    if (!deepMode) setDeepMode(true);
                    setWebMode((v) => !v);
                  }}
                >
                  <IconGlobe size={16} />
                </button>
              </div>
            )}
            <div className="ar-composer-overflow-wrap" ref={toolsRef}>
              <button
                type="button"
                className="ar-composer-tool-btn ar-composer-overflow-btn"
                aria-label="گزینه‌ها"
                title="گزینه‌ها — کد، وب، حالت چت"
                aria-expanded={toolsOpen}
                onClick={() => setToolsOpen((v) => !v)}
              >
                <IconDots size={16} />
              </button>
              {overflowMenu}
            </div>
            {compactHome && (
              <div className="ar-composer-home-dds">
                {mode === "direct" && (
                  <HomeCompactDropdown
                    value={modelPick}
                    options={modelDropdownOptions}
                    ariaLabel="انتخاب مدل"
                    onChange={(id) => {
                      setModelPick(id);
                      setSendErr("");
                    }}
                    onLocked={() => setSendErr("plan_locked")}
                  />
                )}
                <HomeCompactDropdown
                  value={deepMode ? "deep" : "fast"}
                  options={SPEED_OPTIONS}
                  ariaLabel="سرعت پاسخ"
                  onChange={(id) => {
                    setDeepMode(id === "deep");
                    if (id === "fast") setWebMode(false);
                  }}
                />
              </div>
            )}
            {!compactHome && (mode === "direct" || simplified) && (
              <div className="ar-speed-switch" role="group" aria-label="کیفیت پاسخ">
                <button
                  type="button"
                  className={`ar-speed-switch-btn${!deepMode ? " active" : ""}`}
                  aria-pressed={!deepMode}
                  title="پاسخ سریع — مناسب سؤال‌های روزمره"
                  onClick={() => {
                    setDeepMode(false);
                    setWebMode(false);
                  }}
                >
                  پاسخ سریع
                </button>
                <button
                  type="button"
                  className={`ar-speed-switch-btn${deepMode ? " active" : ""}`}
                  aria-pressed={deepMode}
                  title="پاسخ عمیق — استدلال و تحلیل بیشتر"
                  onClick={() => setDeepMode(true)}
                >
                  پاسخ عمیق
                </button>
              </div>
            )}
            {!simplified && !compactHome && showModelsInComposer && renderModePicker()}
            {!simplified && !compactHome && showModelsInComposer && mode === "side_by_side" && (
              <>
                <ModelSelect picker="compare" value={modelA} onChange={setModelA} plan={plan} exclude={modelB} />
                <ModelSelect picker="compare" value={modelB} onChange={setModelB} plan={plan} exclude={modelA} />
              </>
            )}
            {!simplified && !compactHome && showModelsInComposer && mode === "battle" && (
              <>
                <ModelSelect picker="council" value={modelA} onChange={setModelA} plan={plan} exclude={modelB} />
                <ModelSelect picker="council" value={modelB} onChange={setModelB} plan={plan} exclude={modelA} />
              </>
            )}
            {!simplified && !compactHome && showModelsInComposer && mode === "direct" && (
              <ModelSelect picker="direct" value={directModel} onChange={setDirectModel} plan={plan} />
            )}
          </div>
          <div className="ar-composer-actions">
            {!simplified && !compactHome && showModelsInComposer && (
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
              className={`ar-send-btn${docked ? " ar-send-btn--dock" : ""}${sendReady ? " ar-send-btn--ready" : ""}`}
              onClick={handleSubmit}
              disabled={sendDisabled}
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
        className={`ar-composer${docked ? " ar-composer--dock" : ""}${compactHome ? " ar-composer--compact-home" : ""}${composerFlash ? " ar-composer--flash" : ""}`}
      >
        <div className="ar-composer-box">{body}</div>
        {sendErr === "guest_limit" && (
          <div className="ar-composer-err">برای ارسال پیام وارد شو یا ثبت‌نام کن.</div>
        )}
        {sendErr === "guest_direct_limit" && (
          <div className="ar-composer-err">
            برای ارسال پیام{" "}
            <button type="button" className="ar-link-btn" onClick={() => setShowSheet(true)}>
              وارد شو
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
        {composerNotice && <div className="ar-composer-note">{composerNotice}</div>}
        {sendErr === "same_model" && (
          <div className="ar-composer-err">برای مقایسه، دو مدل متفاوت انتخاب کن.</div>
        )}
        {sendErr === "no_vision" && (
          <div className="ar-composer-err">برای این پلن، مدل مناسبی برای تحلیل تصویر پیدا نشد.</div>
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

  function renderEmptyHome() {
    const creditChip =
      credits !== null ? (
        <Link href="/ai/pricing" className="ar-home-header-credit" title="کردیت — خرید">
          <IconDiamond size={12} />
          <b>{credits.toLocaleString("fa-IR")}</b>
        </Link>
      ) : authBoot === "guest" && guestDirectRemaining !== null ? (
        <span className="ar-home-header-credit ar-home-header-credit--guest">
          <IconDiamond size={12} />
          <b>{guestDirectRemaining.toLocaleString("fa-IR")}</b>
        </span>
      ) : (
        <span className="ar-home-topbar-spacer" />
      );

    return (
      <>
        <header className="ar-home-header ar-home-header--empty">
          <button
            type="button"
            className="ar-home-menu"
            onClick={() => window.dispatchEvent(new Event("ai:open-drawer"))}
            aria-label="باز کردن منو"
          >
            <IconMenu size={18} />
          </button>
          <span className="ar-home-header-brand">هوش مصنوعی آرایه</span>
          {creditChip}
        </header>
        <div className="ar-home-stack ar-home-stack--empty">
          <div className="ar-home-center ar-home-marketing">
            <p className="ar-chat-brand-eyebrow">هوش مصنوعی آرایه</p>
            <h1 className="ar-home-prompt">
              هوش مصنوعی آرایه؛ یک سؤال، چند{" "}
              <span className="ar-home-prompt-accent">AI</span>، یک پاسخ بهتر
            </h1>
            <p className="ar-chat-brand-sub">
              چند مدل همزمان پاسخ می‌دهند؛ آرایه کمک می‌کند جواب بهتر را سریع‌تر پیدا کنی.
            </p>
            <p className="ar-chat-brand-sub ar-chat-brand-sub--muted">
              اگر «هوش مصنوعی ارایه» یا «Araaye AI» را جست‌وجو کرده‌ای، این همان پلتفرم آرایه
              است.
            </p>
            {authBoot === "guest" && (
              <p className="ar-home-trial-note">۱۰ پیام رایگان برای شروع</p>
            )}
            <div className="ar-hero-badges">
              <span className="ar-hero-badge">فارسی</span>
              <span className="ar-hero-badge">بدون VPN</span>
              <span className="ar-hero-badge">پرداخت تومانی</span>
            </div>
          </div>

          <div className="ar-home-mode-row">
            <ModeSelector
              value={mode}
              onChange={handleModeSelect}
              isLocked={isModeLocked}
              compact={isMobile}
            />
          </div>

          <section className="ar-home-suggest" aria-label="پیشنهادها">
            <h2 className="ar-home-suggest-title">چه کاری می‌خوای انجام بدی؟</h2>
            <div className="ar-suggest-grid ar-suggest-grid--home">
              {HOME_SUGGESTIONS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="ar-suggest-card"
                  onClick={() => applyHomeSuggestion(item)}
                >
                  <span className="ar-suggest-icon" aria-hidden>
                    <item.Icon size={16} />
                  </span>
                  <span className="ar-suggest-copy">
                    <b>{item.title}</b>
                    <small>{item.subtitle}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="ar-home-flex-spacer" aria-hidden />

          <div className="ar-home-composer ar-home-composer--empty">
            {(mode === "side_by_side" || mode === "battle") && (
              <div className="ar-home-modelbar ar-home-modelbar--inline">
                <ModelSelect
                  variant="bar"
                  sheetOnMobile
                  picker={mode === "battle" ? "council" : "compare"}
                  value={modelA}
                  onChange={setModelA}
                  plan={plan}
                  exclude={modelB}
                  label="مدل A"
                  preferOpenDown
                />
                <ModelSelect
                  variant="bar"
                  sheetOnMobile
                  picker={mode === "battle" ? "council" : "compare"}
                  value={modelB}
                  onChange={setModelB}
                  plan={plan}
                  exclude={modelA}
                  label="مدل B"
                  preferOpenDown
                />
              </div>
            )}
            {renderComposer({
              docked: true,
              showMode: false,
              simplified: true,
              compactHome: true,
              placeholder: "سؤالت را بنویس…",
            })}
            {(sendErr === "plan_locked" || sendErr === "mode_locked") && (
              <PlanUpsellBanner
                variant={sendErr === "mode_locked" ? "mode" : "plan"}
                onDismiss={() => setSendErr("")}
              />
            )}
          </div>

          {children}
        </div>
      </>
    );
  }

  function sessionSummaryLabel(s: ActiveSession): string {
    if (s.type === "direct") {
      const name = getModel(s.modelId)?.name ?? "خودکار";
      return `${name} · ${s.deepMode ? "پاسخ عمیق" : "پاسخ سریع"}`;
    }
    if (s.type === "council") {
      const a = getModel(s.modelA ?? "")?.name ?? "A";
      const b = getModel(s.modelB ?? "")?.name ?? "B";
      return `${MODE_META.battle.label} · ${a} + ${b}`;
    }
    const a = getModel(s.modelA)?.name ?? "A";
    const b = getModel(s.modelB)?.name ?? "B";
    return `${MODE_META.side_by_side.label} · ${a} vs ${b}`;
  }

  function renderSessionTopbar() {
    if (!session) return null;
    const title = session.title?.trim() || "گفتگو";
    const summary = sessionSummaryLabel(session);
    const creditChip =
      credits !== null ? (
        <Link href="/ai/pricing" className="ar-chat-topbar-credit" title="کردیت — خرید">
          <IconDiamond size={12} />
          <b>{credits.toLocaleString("fa-IR")}</b>
        </Link>
      ) : authBoot === "guest" && guestDirectRemaining !== null ? (
        <span className="ar-chat-topbar-credit ar-chat-topbar-credit--guest">
          {guestDirectRemaining.toLocaleString("fa-IR")} پیام رایگان
        </span>
      ) : null;

    return (
      <header className="ar-home-header ar-chat-topbar-header">
        <div className="ar-home-topbar ar-chat-topbar">
          <button
            type="button"
            className="ar-home-menu"
            onClick={() => window.dispatchEvent(new Event("ai:open-drawer"))}
            aria-label="باز کردن منو"
          >
            <IconMenu size={19} />
          </button>

          <div className="ar-chat-topbar-title">
            <span className="ar-chat-topbar-name">{title}</span>
            <span className="ar-chat-topbar-summary">{summary}</span>
          </div>

          <div className="ar-chat-topbar-controls">
            {renderModePicker("ar-chat-topbar-mode")}
            {session.type === "direct" && (
              <div className="ar-chat-topbar-model">
                <ModelSelect
                  picker="direct"
                  variant="bar"
                  sheetOnMobile
                  value={session.modelId}
                  onChange={(id) =>
                    setSession((s) => (s && s.type === "direct" ? { ...s, modelId: id } : s))
                  }
                  plan={plan}
                />
              </div>
            )}
            {session.type === "council" && session.modelA && session.modelB && (
              <div className="ar-chat-topbar-model ar-chat-topbar-model--dual">
                <ModelSelect
                  picker="council"
                  variant="bar"
                  sheetOnMobile
                  value={session.modelA}
                  onChange={(id) =>
                    setSession((s) => (s && s.type === "council" ? { ...s, modelA: id } : s))
                  }
                  plan={plan}
                  exclude={session.modelB}
                />
                <ModelSelect
                  picker="council"
                  variant="bar"
                  sheetOnMobile
                  value={session.modelB}
                  onChange={(id) =>
                    setSession((s) => (s && s.type === "council" ? { ...s, modelB: id } : s))
                  }
                  plan={plan}
                  exclude={session.modelA}
                />
              </div>
            )}
            {creditChip}
          </div>

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
      </header>
    );
  }

  return (
    <>
      {authBoot === "pending" && (
        <div className="ar-home-workspace">
          <ArenaPageSkeleton label="در حال بارگذاری" />
        </div>
      )}
      {(authBoot === "user" || authBoot === "guest") && (
        <div className="ar-home-workspace">
          {renderBanners()}
          {session && renderSessionTopbar()}
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
                  hideModelBar
                  onModelChange={(id) =>
                    setSession((s) => (s && s.type === "direct" ? { ...s, modelId: id } : s))
                  }
                />
              ) : session.type === "compare" ? (
                <CompareSessionView
                  bootstrapPrompt={session.bootstrapPrompt}
                  webSearch={session.webMode}
                  modelAId={session.modelA}
                  modelBId={session.modelB}
                  onCreditsChange={(n) => {
                    setCredits(n);
                    setCtxCredits(n);
                  }}
                />
              ) : (
                <CouncilSessionView
                  bootstrapPrompt={session.bootstrapPrompt}
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
            renderEmptyHome()
          )}
        </div>
      )}

      {/* Auth sheet */}
      {showSheet && (
        <div
          className="ar-sheet-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSheet(false);
          }}
        >
          <div className="ar-sheet ar-sheet--auth">
            <div className="ar-sheet-head">
              <h3>ورود به آرایه AI</h3>
              <button className="ar-sheet-close" onClick={() => setShowSheet(false)} aria-label="بستن">
                <IconX size={13} />
              </button>
            </div>
            <p className="ar-sheet-sub">
              {pendingPrompt
                ? "برای ارسال پیام، با شماره موبایل وارد شو یا ثبت‌نام کن."
                : "با شماره موبایل وارد شو یا ثبت‌نام کن."}
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
              <label>رمز عبور</label>
              <input
                type="password"
                placeholder={authTab === "register" ? "حداقل ۶ کاراکتر" : "رمز عبور"}
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
                  ? "شروع رایگان"
                  : "ورود"}
            </button>

            {authTab === "register" && (
              <p className="ar-auth-note">
                ۱۰ پیام رایگان بعد از ثبت‌نام فعال می‌شود.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
