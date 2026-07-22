"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PRODUCTION_STAGES } from "./content";
import MiniSite from "./MiniSite";

/**
 * Signature scroll-driven section: business information → published website.
 * The right-hand panel transforms wireframe → structure → typography →
 * images → finished website while the left rail tracks the narrative.
 *
 * - GSAP ScrollTrigger drives ONLY this sequence (scrub, sticky, no pin-jack).
 * - Fully understandable without motion.
 * - Mobile renders a static vertical filmstrip.
 * - Respects prefers-reduced-motion.
 */

function FieldRow({ label, fill }: { label: string; fill: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-[11px] font-bold text-[var(--fw-muted)]">{label}</span>
      <span className="h-6 flex-1 rounded-[3px] border border-[var(--fw-line)] bg-[var(--fw-paper)]" style={{ maxWidth: fill }} />
    </div>
  );
}

/** Stage 1 — raw business brief. */
function StageBrief() {
  return (
    <div className="flex h-full flex-col justify-center gap-4 p-7">
      <span className="fw-annot">BRIEF</span>
      <div className="mt-1 flex flex-col gap-3.5">
        <FieldRow label="کسب‌وکار" fill="70%" />
        <FieldRow label="خدمات" fill="90%" />
        <FieldRow label="مخاطب" fill="55%" />
        <FieldRow label="تماس" fill="75%" />
      </div>
    </div>
  );
}

/** Stage 2 — customer journey. */
function StageJourney() {
  const nodes = ["ورود", "خدمات", "اعتماد", "تماس"];
  return (
    <div className="flex h-full items-center justify-center p-7">
      <div className="flex w-full items-center justify-between">
        {nodes.map((n, i) => (
          <div key={n} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-[var(--fw-ink)] text-[11px] font-extrabold">
                {i + 1}
              </span>
              <span className="text-[11px] font-bold">{n}</span>
            </div>
            {i < nodes.length - 1 && (
              <span className="mx-1 h-[1.5px] flex-1 bg-[var(--fw-line-strong)]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Shared page skeleton used by blueprint → direction → site so the
 *  transformation reads as one continuous object. */
function PageSkeleton({ mode }: { mode: "wire" | "direction" }) {
  const wire = mode === "wire";
  return (
    <div className="flex h-full flex-col gap-2.5 p-4">
      {/* header */}
      <div className="flex items-center justify-between rounded-[3px] border border-[var(--fw-line)] px-3 py-2">
        <span className={`h-2.5 w-14 rounded-[1px] ${wire ? "bg-[var(--fw-line-strong)]" : "bg-[var(--fw-ink)]"}`} />
        <span className={`h-4 w-12 rounded-[2px] ${wire ? "border border-[var(--fw-line-strong)]" : "bg-[var(--fw-accent)]"}`} />
      </div>
      {/* hero */}
      <div className="relative flex-1 overflow-hidden rounded-[4px] border border-[var(--fw-line)]">
        {wire ? (
          <div className="flex h-full items-center justify-center">
            <svg viewBox="0 0 100 60" className="h-full w-full text-[var(--fw-line-strong)]" preserveAspectRatio="none" aria-hidden="true">
              <line x1="0" y1="0" x2="100" y2="60" stroke="currentColor" strokeWidth="0.4" />
              <line x1="100" y1="0" x2="0" y2="60" stroke="currentColor" strokeWidth="0.4" />
            </svg>
          </div>
        ) : (
          <>
            <Image src="/showcase-assets/shiva/hero.jpg" alt="" fill className="object-cover" sizes="320px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <span className="block h-3 w-2/3 rounded-[2px] bg-white/90" />
              <span className="mt-1.5 block h-2 w-1/3 rounded-[2px] bg-[var(--fw-accent)]" />
            </div>
          </>
        )}
      </div>
      {/* three columns */}
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-[3px] border border-[var(--fw-line)] p-2">
            <span className={`block h-2 w-8 rounded-[1px] ${wire ? "bg-[var(--fw-line-strong)]" : "bg-[var(--fw-ink)]"}`} />
            <span className="mt-1.5 block h-1.5 w-full rounded-[1px] bg-[var(--fw-line)]" />
            <span className="mt-1 block h-1.5 w-2/3 rounded-[1px] bg-[var(--fw-line)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StageFinished() {
  return (
    <div className="absolute inset-0">
      <MiniSite variant="clinic" device="desktop" />
    </div>
  );
}

const STAGE_KEYS = ["brief", "journey", "blueprint", "direction", "site"] as const;

function StageVisual({ stage }: { stage: (typeof STAGE_KEYS)[number] }) {
  switch (stage) {
    case "brief":
      return <StageBrief />;
    case "journey":
      return <StageJourney />;
    case "blueprint":
      return <PageSkeleton mode="wire" />;
    case "direction":
      return <PageSkeleton mode="direction" />;
    case "site":
      return <StageFinished />;
  }
}

function StepRail({ active }: { active: number }) {
  return (
    <ol className="relative flex flex-col gap-7">
      <span className="absolute bottom-1 right-[11px] top-1 w-[2px] bg-[var(--fw-line)]" aria-hidden="true" />
      <span
        className="absolute right-[11px] top-1 w-[2px] bg-[var(--fw-accent)] transition-[height] duration-500 ease-out"
        style={{ height: `calc(${(active / (PRODUCTION_STAGES.length - 1)) * 100}% - 0px)` }}
        aria-hidden="true"
      />
      {PRODUCTION_STAGES.map((s, i) => {
        const on = i <= active;
        return (
          <li key={s.key} className="relative flex gap-4 ps-8">
            <span
              className="absolute right-[4px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] transition-colors duration-300"
              style={{
                background: on ? "var(--fw-accent)" : "var(--fw-paper)",
                borderColor: on ? "var(--fw-accent)" : "var(--fw-line-strong)",
              }}
              aria-hidden="true"
            />
            <div className={`transition-opacity duration-300 ${i === active ? "opacity-100" : "opacity-55"}`}>
              <div className="flex items-baseline gap-2">
                <span className="fw-index">{s.index}</span>
                <h3 className="fw-display-3 text-[1.15rem] sm:text-[1.3rem]">{s.title}</h3>
              </div>
              <p className="mt-1 max-w-sm text-[0.9rem] leading-7 text-[var(--fw-muted)]">{s.caption}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function ProductionLine() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    if (reduce || !wide) return;

    let trigger: { kill: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      const gsap = gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const count = PRODUCTION_STAGES.length;
      trigger = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self: { progress: number }) => {
          const idx = Math.min(count - 1, Math.floor(self.progress * count));
          setActive((prev) => (prev === idx ? prev : idx));
        },
      });
    })();

    return () => {
      cancelled = true;
      trigger?.kill();
    };
  }, []);

  return (
    <section aria-labelledby="fw-line-title" className="bg-[var(--fw-paper-2)]">
      <div className="fw-shell py-[var(--fw-section-tight)]">
        <div className="max-w-2xl">
          <span className="fw-annot">فرایند تولید</span>
          <h2 id="fw-line-title" className="fw-display-2 mt-4">
            از اطلاعات کسب‌وکار،
            <br />
            تا یک سایت <span className="fw-accent-word">منتشرشده</span>
          </h2>
        </div>
      </div>

      {/* Desktop: scroll-driven sequence */}
      <div ref={sectionRef} className="relative hidden md:block" style={{ height: "300vh" }}>
        <div className="sticky top-0 flex h-screen items-center">
          <div className="fw-shell grid w-full grid-cols-12 items-center gap-8">
            <div className="col-span-5">
              <StepRail active={active} />
            </div>
            <div className="col-span-7">
              <div className="fw-frame fw-frame-lg fw-stage-panel mx-auto aspect-[16/11] w-full max-w-xl">
                {STAGE_KEYS.map((key, i) => (
                  <div
                    key={key}
                    className="fw-stage-layer"
                    style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
                    aria-hidden={i !== active}
                  >
                    <StageVisual stage={key} />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-[0.8rem] text-[var(--fw-muted)]">
                همان نسخه‌ای که قبل از پرداخت می‌بینی — نه یک تصویر تبلیغاتی.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: static filmstrip (no scroll-jacking, understandable без motion) */}
      <div className="fw-shell space-y-8 pb-[var(--fw-section-tight)] md:hidden">
        {PRODUCTION_STAGES.map((s, i) => (
          <div key={s.key}>
            <div className="flex items-baseline gap-2">
              <span className="fw-index">{s.index}</span>
              <h3 className="fw-display-3 text-[1.2rem]">{s.title}</h3>
            </div>
            <p className="mt-1 text-[0.92rem] leading-7 text-[var(--fw-muted)]">{s.caption}</p>
            <div className="fw-frame fw-frame-lg fw-stage-panel mt-4 aspect-[16/11] w-full">
              <StageVisual stage={STAGE_KEYS[i]} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
