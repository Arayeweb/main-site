"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { pushGtmEvent } from "@/lib/gtm";
import { type SiteChatSource, type SiteChatPrefill } from "@/lib/openSiteChat";
import { siteWhatsAppUrl } from "@/lib/siteContact";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface QuickReply {
  t: string;
  go?: string;
  set?: Partial<LeadState>;
  action?: "whatsapp";
}

interface ScriptNode {
  msgs: string[];
  quick?: QuickReply[];
  expects?: "business" | "contact_form" | "business_name_only";
}

interface LeadState {
  clickSource: string;
  intent: string;
  business: string;
  name: string;
  contact: string;
  channel: string;
}

interface ChatMessage {
  who: "bot" | "user";
  text: string;
}

/* ------------------------------------------------------------------ */
/*  Conversation script                                                 */
/* ------------------------------------------------------------------ */
const INTENT_LABELS: Record<string, string> = {
  google: "در گوگل دیده شوم",
  website: "سایت یا صفحه فروش",
  map: "در نقشه ثبت شم",
  doctors: "راهکار پزشکان و کلینیک‌ها",
  unsure: "هنوز مطمئن نیستم",
  new: "سایت جدید می‌خواهم",
  redesign: "سایت فعلی نیاز به بازطراحی دارد",
};

const WD_HERO_SOURCE = "Hero طراحی سایت";

const SCRIPT: Record<string, ScriptNode> = {
  start: {
    msgs: ["سلام. برای چه کاری به آرایه سر زده‌اید؟"],
    quick: [
      { t: "در گوگل دیده شوم", go: "business", set: { intent: "google" } },
      { t: "سایت یا صفحه فروش می‌خواهم", go: "business", set: { intent: "website" } },
      { t: "در نقشه ثبت شم", go: "business", set: { intent: "map" } },
      { t: "راهکار پزشکان و کلینیک‌ها", go: "business", set: { intent: "doctors" } },
      { t: "هنوز مطمئن نیستم", go: "business", set: { intent: "unsure" } },
    ],
  },
  business: {
    msgs: ["نوع کسب‌وکار و شماره تماس‌تان را بگذارید."],
    expects: "business",
  },
  wd_business: {
    msgs: ["نام یا حوزه کسب‌وکارتان چیست؟"],
    expects: "business_name_only",
  },
  channel: {
    msgs: ["ترجیح می‌دهید چطور ادامه دهیم؟"],
    quick: [
      { t: "پیام در واتساپ", go: "whatsapp", action: "whatsapp" },
      { t: "درخواست تماس", go: "contact" },
    ],
  },
  contact: {
    msgs: ["نام‌تان را بگذارید تا با شما تماس بگیریم."],
    expects: "contact_form",
  },
  whatsapp: {
    msgs: ["پیام شما در واتساپ آماده است. همان‌جا ادامه دهید."],
    quick: [],
  },
  thanks: {
    msgs: ["ممنون. به‌زودی با شما تماس می‌گیریم."],
    quick: [],
  },
};

/* ------------------------------------------------------------------ */
/*  Tracking & lead submission                                          */
/* ------------------------------------------------------------------ */
function collectUtms(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
    const v = params.get(k);
    if (v) utms[k] = v;
  });
  return utms;
}

function trackGuide(
  event: string,
  lead: LeadState,
  extra: Record<string, string | undefined> = {}
) {
  const utms = collectUtms();
  pushGtmEvent(event, {
    click_source: lead.clickSource,
    intent: lead.intent || undefined,
    business: lead.business || undefined,
    channel: lead.channel || undefined,
    page: window.location.pathname,
    ...utms,
    ...extra,
  });
}

function submitLead(lead: LeadState) {
  const utms = collectUtms();
  fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: lead.clickSource === "website_design_hero" ? "website-design-hero" : "site_guide",
      page: window.location.pathname,
      referrer: document.referrer || undefined,
      name: lead.name || lead.business || undefined,
      contact: lead.contact,
      intent: lead.intent || undefined,
      detail: lead.business || undefined,
      channel: lead.channel || undefined,
      goal:
        lead.clickSource === "website_design_hero"
          ? WD_HERO_SOURCE
          : lead.clickSource || undefined,
      ...utms,
      raw: {
        click_source: lead.clickSource,
        intent: lead.intent,
        business: lead.business,
        channel: lead.channel,
      },
    }),
    keepalive: true,
  }).catch(() => {});
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function toLatin(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}
function isPhone(v: string) {
  return /^(\+98|0098|0)?9\d{9}$/.test(toLatin(v).replace(/[\s\-()+]/g, ""));
}

function whatsAppMessage(lead: LeadState) {
  const intent = INTENT_LABELS[lead.intent] || lead.intent;
  const lines = ["سلام، از سایت آرایه پیام می‌دهم."];
  if (lead.intent === "new" || lead.intent === "redesign") {
    lines.push(`منبع: ${WD_HERO_SOURCE}`);
    lines.push(`نیاز: ${intent}`);
  } else {
    lines.push(`نیاز من: ${intent}`);
  }
  if (lead.business) lines.push(`کسب‌وکار: ${lead.business}`);
  if (lead.contact) lines.push(`تماس: ${lead.contact}`);
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function ChatWidget() {
  const pathname = usePathname();
  const mobileStickyBar = pathname === "/";
  const launcherPosition = mobileStickyBar
    ? "fixed bottom-20 left-4 z-50 sm:bottom-5 sm:left-5"
    : "fixed bottom-5 left-5 z-50";
  const panelPosition = mobileStickyBar
    ? "fixed bottom-[5.75rem] left-4 z-50 flex w-[calc(100vw-32px)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xl animate-fade-up sm:bottom-5 sm:left-5 sm:w-[calc(100vw-40px)]"
    : "fixed bottom-5 left-5 z-50 flex w-[calc(100vw-40px)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xl animate-fade-up";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [businessType, setBusinessType] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [expecting, setExpecting] = useState<"business" | "contact_form" | "business_name_only" | null>(null);
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const lead = useRef<LeadState>({
    clickSource: "launcher",
    intent: "",
    business: "",
    name: "",
    contact: "",
    channel: "",
  });
  const threadRef = useRef<HTMLDivElement>(null);
  const businessTypeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, typing, quickReplies, expecting]);

  useEffect(() => {
    if (expecting === "business" && businessTypeRef.current) businessTypeRef.current.focus();
    if (expecting === "business_name_only" && businessTypeRef.current) businessTypeRef.current.focus();
    if (expecting === "contact_form" && nameRef.current) nameRef.current.focus();
  }, [expecting]);

  function addBotMsgs(msgs: string[], node: ScriptNode) {
    if (!msgs.length) {
      afterMsgs(node);
      return;
    }
    const [first, ...rest] = msgs;
    setTyping(true);
    const delay = Math.min(900, 350 + first.length * 12);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { who: "bot", text: first }]);
      setTimeout(() => addBotMsgs(rest, node), 180);
    }, delay);
  }

  function afterMsgs(node: ScriptNode) {
    if (node.expects) {
      setExpecting(node.expects);
      setQuickReplies([]);
      return;
    }
    setExpecting(null);
    setQuickReplies(node.quick || []);
  }

  function renderNode(id: string) {
    const node = SCRIPT[id];
    if (!node) return;
    setQuickReplies([]);
    setExpecting(null);
    addBotMsgs([...node.msgs], node);
  }

  const openChat = useCallback(
    (source: SiteChatSource = "launcher", prefill?: SiteChatPrefill) => {
      lead.current.clickSource = source;
      setOpen(true);
      setBadgeVisible(false);
      trackGuide("guide_open", lead.current);

      if (prefill?.flow === "website_design_hero") {
        lead.current.clickSource = "website_design_hero";
        lead.current.intent = prefill.projectType;
        lead.current.contact = prefill.contact;

        const projectLabel = INTENT_LABELS[prefill.projectType] || prefill.projectType;
        setStarted(true);
        setMessages([
          { who: "user", text: projectLabel },
          { who: "user", text: prefill.contact },
        ]);
        setQuickReplies([]);
        setExpecting(null);
        trackGuide("guide_intent", lead.current, { selection: projectLabel });
        setTimeout(() => renderNode("wd_business"), 300);
        return;
      }

      if (!started) {
        setStarted(true);
        setTimeout(() => renderNode("start"), 300);
      }
    },
    [started]
  );

  const openChatRef = useRef(openChat);
  openChatRef.current = openChat;

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ source?: SiteChatSource; prefill?: SiteChatPrefill }>)
        .detail;
      openChatRef.current(detail?.source || "launcher", detail?.prefill);
    };
    window.addEventListener("araaye:open-chat", handler);
    return () => window.removeEventListener("araaye:open-chat", handler);
  }, []);

  function handleQuick(q: QuickReply) {
    setMessages((prev) => [...prev, { who: "user", text: q.t }]);
    setQuickReplies([]);
    if (q.set) Object.assign(lead.current, q.set);

    if (q.set?.intent) {
      trackGuide("guide_intent", lead.current, { selection: q.t });
    }

    if (q.action === "whatsapp") {
      lead.current.channel = "whatsapp";
      trackGuide("guide_channel", lead.current, { selection: q.t });
      trackGuide("guide_whatsapp", lead.current);
      if (lead.current.intent === "new" || lead.current.intent === "redesign") {
        submitLead(lead.current);
      }
      window.open(siteWhatsAppUrl(whatsAppMessage(lead.current)), "_blank", "noopener,noreferrer");
      setTimeout(() => renderNode("whatsapp"), 280);
      return;
    }

    if (q.go === "contact") {
      lead.current.channel = "phone_call";
      trackGuide("guide_channel", lead.current, { selection: q.t });
      if (lead.current.intent === "new" || lead.current.intent === "redesign") {
        submitLead(lead.current);
        setTimeout(() => renderNode("thanks"), 280);
        return;
      }
    }

    if (q.go) {
      const next = q.go;
      setTimeout(() => renderNode(next), 280);
    }
  }

  function normalizePhone(phone: string) {
    const digits = toLatin(phone).replace(/[\s\-()+]/g, "");
    const local = digits.replace(/^(\+98|0098|0)/, "");
    return local.length === 10 ? `0${local}` : digits;
  }

  function handleBusinessNameOnlySubmit(e: React.FormEvent) {
    e.preventDefault();
    const type = businessType.trim();
    if (!type || !lead.current.contact) return;

    lead.current.business = type;
    setMessages((prev) => [...prev, { who: "user", text: type }]);
    setBusinessType("");
    setExpecting(null);
    trackGuide("guide_business", lead.current);
    setTimeout(() => renderNode("channel"), 280);
  }

  function handleBusinessSubmit(e: React.FormEvent) {
    e.preventDefault();
    const type = businessType.trim();
    const phone = businessPhone.trim();
    if (!type || !isPhone(phone)) return;

    lead.current.business = type;
    lead.current.contact = normalizePhone(phone);
    setMessages((prev) => [...prev, { who: "user", text: `${type} — ${phone}` }]);
    setBusinessType("");
    setBusinessPhone("");
    setExpecting(null);
    trackGuide("guide_business", lead.current);
    setTimeout(() => renderNode("channel"), 280);
  }

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = contactName.trim();
    if (!name || !lead.current.contact) return;

    lead.current.name = name;
    setMessages((prev) => [...prev, { who: "user", text: name }]);
    setContactName("");
    setExpecting(null);
    trackGuide("guide_contact_submit", lead.current);
    submitLead(lead.current);
    setTimeout(() => renderNode("thanks"), 280);
  }

  return (
    <>
      {/* Launcher — hidden while panel is open (header has close) */}
      {!open && (
        <div className={launcherPosition}>
          <button
            type="button"
            onClick={() => openChat("launcher")}
            aria-label="راهنمای آرایه"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-white shadow-lg transition-all duration-200 hover:bg-navy-800 hover:shadow-xl active:scale-[0.96]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {badgeVisible && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white ring-2 ring-white">
                1
              </span>
            )}
          </button>
        </div>
      )}

      {/* Guide panel */}
      {open && (
        <div
          dir="rtl"
          className={panelPosition}
          style={{ height: "min(550px, calc(100dvh - 40px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-navy-100 bg-navy-900 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-white">راهنمای آرایه</p>
                <p className="mt-0.5 text-[11px] text-navy-300">برای انتخاب مسیر مناسب</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="بستن"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-navy-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={threadRef}
            className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.who === "user" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                    m.who === "user"
                      ? "rounded-tl-sm bg-navy-900 text-white"
                      : "rounded-tr-sm bg-navy-50 text-navy-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-end">
                <div className="flex items-center gap-1 rounded-2xl rounded-tr-sm bg-navy-50 px-3.5 py-2.5">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-400"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          {quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-navy-50 px-3 py-2">
              {quickReplies.map((q) => (
                <button
                  key={q.t}
                  type="button"
                  onClick={() => handleQuick(q)}
                  className="rounded-lg border border-navy-200 bg-white px-2.5 py-1 text-[11px] font-medium text-navy-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                >
                  {q.t}
                </button>
              ))}
            </div>
          )}

          {/* Business name only — website design hero flow */}
          {expecting === "business_name_only" && (
            <form
              onSubmit={handleBusinessNameOnlySubmit}
              className="flex items-center gap-2 border-t border-navy-100 px-3 py-2.5"
            >
              <input
                ref={businessTypeRef}
                type="text"
                dir="rtl"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="نام یا حوزه کسب‌وکار"
                className="flex-1 rounded-xl bg-navy-50 px-3 py-2 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-400 focus:bg-white focus:ring-2 focus:ring-navy-200"
              />
              <button
                type="submit"
                disabled={!businessType.trim()}
                aria-label="ادامه"
                className="shrink-0 rounded-xl bg-navy-900 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ادامه
              </button>
            </form>
          )}

          {/* Business type + phone */}
          {expecting === "business" && (
            <form
              onSubmit={handleBusinessSubmit}
              className="space-y-2 border-t border-navy-100 px-3 py-2.5"
            >
              <input
                ref={businessTypeRef}
                type="text"
                dir="rtl"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="نوع کسب‌وکار، مثلاً کلینیک دندانپزشکی"
                className="w-full rounded-xl bg-navy-50 px-3 py-2 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-400 focus:bg-white focus:ring-2 focus:ring-navy-200"
              />
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  dir="ltr"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="flex-1 rounded-xl bg-navy-50 px-3 py-2 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-400 focus:bg-white focus:ring-2 focus:ring-navy-200"
                />
                <button
                  type="submit"
                  disabled={!businessType.trim() || !isPhone(businessPhone)}
                  aria-label="ادامه"
                  className="shrink-0 rounded-xl bg-navy-900 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ادامه
                </button>
              </div>
            </form>
          )}

          {/* Contact form — name only; phone collected in business step */}
          {expecting === "contact_form" && (
            <form
              onSubmit={handleContactSubmit}
              className="flex items-center gap-2 border-t border-navy-100 px-3 py-2.5"
            >
              <input
                ref={nameRef}
                type="text"
                dir="rtl"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="نام"
                className="flex-1 rounded-xl bg-navy-50 px-3 py-2 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-400 focus:bg-white focus:ring-2 focus:ring-navy-200"
              />
              <button
                type="submit"
                disabled={!contactName.trim()}
                className="shrink-0 rounded-xl bg-navy-900 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ارسال
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
