"use client";

import { useEffect, useRef, useState } from "react";

const QUESTION = "برای معرفی کسب‌وکارم یک متن کوتاه بنویس";

const MODELS = [
  {
    name: "GPT",
    tagline: "سریع و مستقیم",
    accent: "bg-emerald-400",
    offset: "-translate-y-2 sm:-translate-y-3 sm:-rotate-1",
    delay: "delay-150",
    answer: "ما خدمات تخصصی ارائه می‌دهیم.\nکیفیت و سرعت، اولویت ماست.",
  },
  {
    name: "Claude",
    tagline: "دقیق و کامل",
    accent: "bg-amber-400",
    offset: "translate-y-1 sm:translate-y-2",
    delay: "delay-300",
    answer:
      "کسب‌وکار ما با سال‌ها تجربه، راه‌حل‌های عملی\nبرای نیازهای واقعی مشتریان طراحی می‌کند.",
  },
  {
    name: "Gemini",
    tagline: "زاویه‌ای متفاوت",
    accent: "bg-sky-400",
    offset: "-translate-y-1 sm:-translate-y-2 sm:rotate-1",
    delay: "delay-[450ms]",
    answer: "از دید مشتری: مشکل حل می‌شود،\nاعتماد ساخته می‌شود، نتیجه قابل اندازه‌گیری است.",
  },
] as const;

const FINAL_ANSWER =
  "با سال‌ها تجربه در حوزه تخصصی‌مان، راه‌حل‌های عملی و سریع ارائه می‌دهیم — مشکل را حل می‌کنیم، اعتماد می‌سازیم و نتیجه‌ای قابل اندازه‌گیری تحویل می‌دهیم.";

export default function AraayeAiComparePreview() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FINAL_ANSWER);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div ref={rootRef} className="relative mx-auto mt-10 w-full max-w-[760px] sm:mt-12">
      {/* Question input */}
      <div
        className={`rounded-2xl border border-white/10 bg-navy-800/80 px-5 py-4 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition-all duration-700 ${
          active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <p className="text-[11px] font-semibold text-white/40">سؤال شما</p>
        <p className="mt-1.5 text-sm font-bold leading-relaxed text-white/90 sm:text-[15px]">
          {QUESTION}
        </p>
      </div>

      {/* Model response cards */}
      <div className="relative mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-4">
        {MODELS.map((model) => (
          <div
            key={model.name}
            className={`transition-all duration-700 ease-out ${model.delay} ${
              active ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <div
              className={`h-full transform rounded-xl border border-white/[0.08] bg-navy-800/60 p-3 text-right shadow-lg backdrop-blur-sm sm:p-4 ${model.offset}`}
            >
              <div className="flex items-center justify-end gap-2">
                <div>
                  <p className="text-xs font-bold text-white sm:text-sm">{model.name}</p>
                  <p className="text-[10px] text-white/45 sm:text-[11px]">{model.tagline}</p>
                </div>
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2 ${model.accent}`} aria-hidden />
              </div>
              <p className="mt-2.5 whitespace-pre-line text-[11px] leading-relaxed text-white/65 sm:mt-3 sm:text-[13px]">
                {model.answer}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Connector lines */}
      <div
        className={`relative mx-auto h-14 w-full max-w-[520px] transition-opacity duration-700 delay-500 sm:h-16 ${
          active ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        <svg
          viewBox="0 0 520 64"
          className="h-full w-full"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="araaye-ai-line-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(90, 140, 255, 0.55)" />
              <stop offset="100%" stopColor="rgba(59, 108, 255, 0.85)" />
            </linearGradient>
          </defs>
          {[
            "M 86 0 C 86 36, 260 40, 260 64",
            "M 260 0 L 260 64",
            "M 434 0 C 434 36, 260 40, 260 64",
          ].map((d, i) => (
            <path
              key={d}
              d={d}
              stroke="url(#araaye-ai-line-grad)"
              strokeWidth="1.5"
              strokeLinecap="round"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: active ? 0 : 1,
                transition: `stroke-dashoffset 0.9s ease ${0.55 + i * 0.12}s`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Final answer card */}
      <div
        className={`relative rounded-2xl border border-brand-200/30 bg-gradient-to-b from-white to-brand-50/80 p-5 text-right shadow-[0_20px_60px_rgba(59,108,255,0.18)] transition-all duration-700 delay-[700ms] sm:p-6 ${
          active ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50 active:scale-[0.98]"
          >
            {copied ? "کپی شد" : "کپی پاسخ"}
          </button>
          <p className="text-sm font-extrabold text-brand-700">پاسخ نهایی آرایه</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-navy-700 sm:text-[15px]">{FINAL_ANSWER}</p>
      </div>
    </div>
  );
}
