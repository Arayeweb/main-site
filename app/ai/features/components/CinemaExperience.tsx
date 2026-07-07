"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { ensureGsapScroll, gsap, refreshScrollTriggers } from "../gsapSetup";

const ACTS = [
  { n: "۰۱", title: "سؤال", line: "یک سؤال بپرس — به فارسی، بدون پیچیدگی." },
  { n: "۰۲", title: "چند مدل", line: "GPT، Claude، Gemini و DeepSeek همزمان فکر می‌کنند." },
  { n: "۰۳", title: "مقایسه", line: "پاسخ‌ها کنار هم — تفاوت‌ها را ببین." },
  { n: "۰۴", title: "خروجی بهتر", line: "بهترین نتیجه — آماده کپی و استفاده." },
];

const ORBS = [
  { label: "GPT", top: "2%", right: "2%" },
  { label: "Claude", top: "14%", left: "0%" },
  { label: "Gemini", top: "38%", right: "0%" },
  { label: "DeepSeek", bottom: "22%", left: "4%" },
  { label: "Llama", bottom: "2%", right: "6%" },
];

const MODELS = ["GPT", "Claude", "Gemini", "DeepSeek"];

export default function CinemaExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const actRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hudStepRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const frameRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    ensureGsapScroll();
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const featRoot = root.closest(".feat-root");

    const setAct = (i: number) => {
      actRefs.current.forEach((el, idx) => el?.classList.toggle("is-live", idx === i));
      hudStepRefs.current.forEach((el, idx) => el?.classList.toggle("is-live", idx === i));
    };

    const setCinemaMode = (active: boolean) => {
      featRoot?.classList.toggle("feat-root--cinema", active);
    };

    const ctx = gsap.context(() => {
      if (reduced) {
        setAct(3);
        setCinemaMode(true);
        gsap.set(".cinema-card", { opacity: 1, clearProps: "transform" });
        gsap.set(".cinema-card:not(.cinema-card--result)", { display: "none" });
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 900px)",
          isMobile: "(max-width: 899px)",
        },
        (context) => {
          const isDesktop = Boolean(context.conditions?.isDesktop);
          const pinScroll = isDesktop ? "+=520%" : "+=360%";
          const tiltY = isDesktop ? 18 : 0;

          const rig = pin.querySelector(".cinema-rig");
          const heroCopy = pin.querySelector(".cinema-hero-copy");
          const depthGrid = pin.querySelector(".cinema-depth-grid");
          const spotlight = pin.querySelector(".cinema-spotlight");
          const progress = pin.querySelector(".cinema-progress-fill");
          const cardQ = pin.querySelector(".cinema-card--question");
          const cardM = pin.querySelector(".cinema-card--models");
          const cardC = pin.querySelector(".cinema-card--compare");
          const cardR = pin.querySelector(".cinema-card--result");
          const ansA = pin.querySelector(".cinema-ans--a");
          const ansB = pin.querySelector(".cinema-ans--b");
          const headlineLines = pin.querySelectorAll(".cinema-headline span");

          if (!rig || !heroCopy || !cardQ || !cardM || !cardC || !cardR || !ansA || !ansB) return;

          gsap.set(rig, { transformStyle: "preserve-3d", force3D: true });
          gsap.set([cardQ, cardM, cardC, cardR], {
            transformStyle: "preserve-3d",
            force3D: true,
            backfaceVisibility: "hidden",
          });

          gsap.set(cardQ, { opacity: 0, z: -420, rotateX: 42, y: 90 });
          gsap.set(cardM, { opacity: 0, z: -520, rotateX: 32, scale: 0.94 });
          gsap.set(cardC, { opacity: 0, z: -520, rotateX: 32, scale: 0.94 });
          gsap.set(cardR, { opacity: 0, z: -640, rotateX: -28, scale: 0.65 });
          gsap.set(heroCopy, { opacity: 0, y: 50, filter: "blur(14px)" });
          gsap.set(headlineLines, { opacity: 0, y: 36, rotateX: 18 });
          if (depthGrid) gsap.set(depthGrid, { opacity: 0, y: 80 });
          if (spotlight) gsap.set(spotlight, { opacity: 0, scale: 0.6 });

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: pinScroll,
              pin: true,
              pinSpacing: true,
              scrub: 0.65,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              ...(isDesktop
                ? {
                    snap: {
                      snapTo: [0, 0.22, 0.48, 0.72, 1],
                      duration: { min: 0.15, max: 0.45 },
                      delay: 0.02,
                      ease: "power2.inOut",
                    },
                  }
                : {}),
              onEnter: () => setCinemaMode(true),
              onEnterBack: () => setCinemaMode(true),
              onLeave: () => setCinemaMode(false),
              onLeaveBack: () => setCinemaMode(false),
              onUpdate: (self) => {
                if (progress instanceof HTMLElement) {
                  progress.style.transform = `scaleX(${self.progress})`;
                }
                if (frameRef.current) {
                  frameRef.current.textContent = String(
                    Math.min(999, Math.floor(self.progress * 999) + 1)
                  ).padStart(3, "0");
                }
                const p = self.progress;
                const act = p < 0.22 ? 0 : p < 0.48 ? 1 : p < 0.72 ? 2 : 3;
                setAct(act);
              },
            },
          });

          tl.to(heroCopy, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.1 }, 0)
            .to(
              headlineLines,
              { opacity: 1, y: 0, rotateX: 0, stagger: 0.025, duration: 0.08, ease: "power3.out" },
              0.02
            )
            .to(depthGrid, { opacity: 0.55, y: 0, duration: 0.12 }, 0)
            .to(spotlight, { opacity: 0.7, scale: 1, duration: 0.14 }, 0.04)
            .fromTo(
              rig,
              { rotateX: 24, rotateY: -tiltY, z: -360, scale: 0.68 },
              { rotateX: 10, rotateY: -tiltY * 0.35, z: -30, scale: 0.98, duration: 0.2 },
              0
            )
            .to(
              cardQ,
              { opacity: 1, z: 0, rotateX: 0, y: 0, duration: 0.14, ease: "power3.out" },
              0.08
            )
            .to(heroCopy, { opacity: 0.08, y: -36, filter: "blur(10px)", duration: 0.1 }, 0.2)
            .to(cardQ, { z: -200, scale: 0.9, opacity: 0.3, duration: 0.12 }, 0.22)
            .to(
              cardM,
              { opacity: 1, z: 50, rotateX: 0, scale: 1, duration: 0.14, ease: "power3.out" },
              0.26
            )
            .from(
              pin.querySelectorAll(".cinema-chip"),
              { opacity: 0, z: -140, y: 50, stagger: 0.02, duration: 0.1, ease: "back.out(2.2)" },
              0.28
            )
            .from(
              pin.querySelectorAll(".cinema-orb"),
              { opacity: 0, scale: 0.6, z: -200, stagger: 0.015, duration: 0.1, ease: "back.out(1.8)" },
              0.27
            )
            .to(rig, { rotateY: tiltY * 0.35, duration: 0.1 }, 0.28)
            .to(cardM, { opacity: 0.15, z: -220, duration: 0.1 }, 0.44)
            .to(cardC, { opacity: 1, z: 60, scale: 1, duration: 0.1 }, 0.46)
            .fromTo(
              ansA,
              isDesktop
                ? { x: 120, z: -180, rotateY: -tiltY * 2.2, opacity: 0 }
                : { y: 60, z: -120, opacity: 0 },
              isDesktop
                ? { x: 0, z: 50, rotateY: 0, opacity: 1, duration: 0.12, ease: "power3.out" }
                : { y: 0, z: 40, opacity: 1, duration: 0.12, ease: "power3.out" },
              0.48
            )
            .fromTo(
              ansB,
              isDesktop
                ? { x: -120, z: -180, rotateY: tiltY * 2.2, opacity: 0 }
                : { y: 60, z: -120, opacity: 0 },
              isDesktop
                ? { x: 0, z: 50, rotateY: 0, opacity: 1, duration: 0.12, ease: "power3.out" }
                : { y: 0, z: 40, opacity: 1, duration: 0.12, ease: "power3.out" },
              0.5
            )
            .to(rig, { rotateY: -tiltY * 0.55, rotateX: 5, duration: 0.1 }, 0.52)
            .to([cardQ, cardM, cardC], { opacity: 0, z: -300, rotateX: 28, duration: 0.12 }, 0.68)
            .to(
              cardR,
              { opacity: 1, z: 140, rotateX: 0, scale: 1, duration: 0.16, ease: "power3.out" },
              0.74
            )
            .to(rig, { rotateX: 0, rotateY: 0, z: 80, scale: 1.08, duration: 0.14 }, 0.74);

          const bloom = pin.querySelector(".cinema-bloom");
          if (bloom) {
            tl.to(bloom, { opacity: 0.9, scale: 1.25, duration: 0.12 }, 0.76);
          }
          if (spotlight) {
            tl.to(spotlight, { opacity: 1, scale: 1.15, duration: 0.1 }, 0.74);
          }

          pin.querySelectorAll<HTMLElement>(".cinema-orb").forEach((orb, i) => {
            gsap.to(orb, {
              y: (i % 2 === 0 ? -1 : 1) * 44,
              x: (i % 2 === 0 ? 1 : -1) * 22,
              rotateZ: (i % 2 === 0 ? 1 : -1) * 10,
              ease: "none",
              scrollTrigger: {
                trigger: pin,
                start: "top top",
                end: pinScroll,
                scrub: true,
              },
            });
          });

          if (depthGrid) {
            gsap.to(depthGrid, {
              y: -120,
              rotateX: 8,
              ease: "none",
              scrollTrigger: { trigger: pin, start: "top top", end: pinScroll, scrub: true },
            });
          }

          const beamA = pin.querySelector(".cinema-beam--a");
          const beamB = pin.querySelector(".cinema-beam--b");
          if (beamA) {
            gsap.to(beamA, {
              yPercent: 35,
              opacity: 0.65,
              ease: "none",
              scrollTrigger: { trigger: pin, start: "top top", end: pinScroll, scrub: true },
            });
          }
          if (beamB) {
            gsap.to(beamB, {
              yPercent: -25,
              opacity: 0.45,
              ease: "none",
              scrollTrigger: { trigger: pin, start: "top top", end: pinScroll, scrub: true },
            });
          }
        }
      );
    }, root);

    const t1 = requestAnimationFrame(() => refreshScrollTriggers());
    const t2 = window.setTimeout(() => refreshScrollTriggers(), 600);
    const onResize = () => refreshScrollTriggers();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", onResize);
      featRoot?.classList.remove("feat-root--cinema");
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="cinema-root" id="how-it-works">
      <div ref={pinRef} className="cinema-pin">
        <div className="cinema-letterbox cinema-letterbox--top" aria-hidden="true" />
        <div className="cinema-letterbox cinema-letterbox--bottom" aria-hidden="true" />
        <div className="cinema-grain" aria-hidden="true" />
        <div className="cinema-vignette" aria-hidden="true" />
        <div className="cinema-depth-grid" aria-hidden="true" />
        <div className="cinema-beam cinema-beam--a" aria-hidden="true" />
        <div className="cinema-beam cinema-beam--b" aria-hidden="true" />
        <div className="cinema-spotlight" aria-hidden="true" />
        <div className="cinema-bloom" aria-hidden="true" />

        <div className="cinema-hud">
          <div className="cinema-hud-rec" aria-hidden="true">
            <span className="cinema-hud-rec-dot" />
            REC
          </div>
          <div className="cinema-hud-steps" aria-hidden="true">
            {ACTS.map((a, i) => (
              <span
                key={a.n}
                ref={(el) => {
                  hudStepRefs.current[i] = el;
                }}
                className={`cinema-hud-dot${i === 0 ? " is-live" : ""}`}
              />
            ))}
          </div>
          <div className="cinema-hud-frame" aria-hidden="true">
            FRM <span ref={frameRef}>001</span>
          </div>
          <div className="cinema-progress">
            <div className="cinema-progress-fill" />
          </div>
        </div>

        <div className="cinema-layout">
          <div className="cinema-col cinema-col--copy">
            <div className="cinema-hero-copy">
              <p className="cinema-kicker">یک سؤال؛ چند AI؛ یک خروجی بهتر</p>
              <h1 className="cinema-headline">
                <span>یک سؤال بپرس،</span>
                <span>چند AI جواب بدهند،</span>
                <span className="cinema-headline-accent">خروجی بهتر بگیر</span>
              </h1>
              <p className="cinema-lead">
                پنل فارسی برای پرسیدن، مقایسه و ساختن — بدون VPN، با پرداخت تومان.
              </p>
              <div className="cinema-hero-cta">
                <Link href="/ai" className="ar-btn ar-btn-primary feat-btn-lg">
                  شروع استفاده
                </Link>
                <span className="cinema-scroll-cue">
                  <span className="cinema-scroll-line" />
                  اسکرول کن
                </span>
              </div>
            </div>

            <div className="cinema-act-titles" aria-live="polite">
              {ACTS.map((act, i) => (
                <div
                  key={act.n}
                  ref={(el) => {
                    actRefs.current[i] = el;
                  }}
                  className={`cinema-act${i === 0 ? " is-live" : ""}`}
                >
                  <span className="cinema-act-n">{act.n}</span>
                  <h2>{act.title}</h2>
                  <p>{act.line}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="cinema-col cinema-col--stage">
            <div className="cinema-stage">
              {ORBS.map((o) => (
                <span
                  key={o.label}
                  className="cinema-orb"
                  style={{
                    top: o.top,
                    right: o.right,
                    left: o.left,
                    bottom: o.bottom,
                  }}
                >
                  {o.label}
                </span>
              ))}

              <div className="cinema-rig">
                <article className="cinema-card cinema-card--question">
                  <header className="cinema-card-head">
                    <span />
                    <span />
                    <span />
                    <em>آرایه AI</em>
                  </header>
                  <label>سؤال شما</label>
                  <p className="cinema-q-text">برای تبلیغ محصولم چه متنی بنویسم؟</p>
                </article>

                <article className="cinema-card cinema-card--models">
                  <header className="cinema-card-head">
                    <span />
                    <span />
                    <span />
                    <em>در حال پردازش…</em>
                  </header>
                  <div className="cinema-chips">
                    {MODELS.map((m) => (
                      <span key={m} className="cinema-chip">
                        {m}
                      </span>
                    ))}
                  </div>
                  <div className="cinema-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                </article>

                <article className="cinema-card cinema-card--compare">
                  <header className="cinema-card-head">
                    <span />
                    <span />
                    <span />
                    <em>مقایسه</em>
                  </header>
                  <div className="cinema-compare-grid">
                    <div className="cinema-ans cinema-ans--a">
                      <span className="cinema-chip">GPT</span>
                      <p>تخفیف ۳۰٪ — فوریت خرید. کوتاه و مستقیم.</p>
                    </div>
                    <div className="cinema-ans cinema-ans--b">
                      <span className="cinema-chip">Claude</span>
                      <p>مزیت محصول + اعتماد — بعد دعوت به خرید.</p>
                    </div>
                  </div>
                </article>

                <article className="cinema-card cinema-card--result">
                  <header className="cinema-card-head">
                    <span />
                    <span />
                    <span />
                    <em>خروجی بهتر</em>
                  </header>
                  <label>نتیجه نهایی</label>
                  <p>
                    ترکیب وضوح GPT با اعتماد Claude — متن تبلیغ کوتاه، حرفه‌ای و آماده
                    اینستاگرام.
                  </p>
                  <Link href="/ai" className="ar-btn ar-btn-primary cinema-card-cta">
                    استفاده کن
                  </Link>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cinema-exit">
        <p>ادامه را ببین — قابلیت‌ها، کاربردها و قیمت‌ها</p>
      </div>
    </section>
  );
}
