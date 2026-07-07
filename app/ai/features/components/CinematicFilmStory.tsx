"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ensureGsapScroll, gsap, ScrollTrigger } from "../gsapSetup";

const STEPS = [
  { title: "سوالت را بنویس", desc: "به فارسی بنویس — آرایه مسیر را انتخاب می‌کند." },
  { title: "چند مدل جواب می‌دهند", desc: "GPT، Claude، Gemini همزمان پاسخ می‌دهند." },
  { title: "جواب‌ها مقایسه می‌شوند", desc: "تفاوت لحن و دقت را یکجا ببین." },
  { title: "خروجی بهتر آماده است", desc: "نتیجه نهایی — آماده استفاده در کار واقعی." },
];

const FLOAT_MODELS = ["GPT", "Claude", "Gemini", "DeepSeek", "Llama"];

export default function CinematicFilmStory() {
  const rootRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    ensureGsapScroll();
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    const ctx = gsap.context(() => {
      const setStep = (index: number) => {
        stepRefs.current.forEach((el, i) => {
          if (!el) return;
          el.classList.toggle("is-active", i === index);
          el.classList.toggle("is-done", i < index);
        });
      };

      if (reduced) {
        setStep(3);
        gsap.set(root.querySelectorAll(".film-layer"), { opacity: 1, clearProps: "transform" });
        gsap.set(root.querySelector(".film-layer--result"), { opacity: 1 });
        return;
      }

      const pinEnd = mobile ? "+=220%" : coarse ? "+=280%" : "+=320%";

      /* Parallax atmosphere */
      gsap.to(root.querySelector(".film-bg-far"), {
        yPercent: 25,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(root.querySelector(".film-bg-glow"), {
        yPercent: -18,
        scale: 1.15,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      /* Floating model orbs — depth parallax inside pin */
      root.querySelectorAll<HTMLElement>(".film-orb").forEach((orb, i) => {
        const depth = 0.35 + i * 0.12;
        gsap.to(orb, {
          y: () => -40 * depth,
          x: () => (i % 2 === 0 ? 18 : -18) * depth,
          rotateZ: () => (i % 2 === 0 ? 6 : -6),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: pinEnd,
            scrub: true,
          },
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.querySelector(".film-pin"),
          start: "top top",
          end: pinEnd,
          pin: true,
          scrub: mobile ? 0.6 : 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            const step = Math.min(3, Math.floor(self.progress * 4));
            setStep(step);
          },
        },
      });

      const rig = root.querySelector(".film-rig");
      const q = root.querySelector(".film-layer--question");
      const models = root.querySelector(".film-layer--models");
      const answers = root.querySelector(".film-layer--answers");
      const ansA = root.querySelector(".film-ans--a");
      const ansB = root.querySelector(".film-ans--b");
      const result = root.querySelector(".film-layer--result");

      gsap.set(rig, { transformPerspective: 1400, transformStyle: "preserve-3d" });
      gsap.set([q, models, answers, result], { transformStyle: "preserve-3d" });
      gsap.set(q, { opacity: 1, z: 0, rotateX: 0, y: 0 });
      gsap.set([models, answers, result], { opacity: 0 });

      /* Scene 1 — rig flies in from 3D tilt */
      tl.fromTo(
        rig,
        { rotateX: 16, rotateY: mobile ? 0 : -12, z: -140, scale: 0.86 },
        { rotateX: 5, rotateY: mobile ? 0 : -5, z: 0, scale: 1, duration: 1, ease: "power2.out" },
        0
      )
        .call(() => setStep(0), [], 0);

      /* Scene 2 — model chips fly in */
      tl.fromTo(
        models,
        { opacity: 0, z: -160 },
        { opacity: 1, z: 20, duration: 0.7, ease: "power2.out" },
        0.95
      )
        .from(
          root.querySelectorAll(".film-chip"),
          { opacity: 0, z: -90, y: 30, stagger: 0.08, duration: 0.55, ease: "back.out(1.6)" },
          1
        )
        .call(() => setStep(1), [], 1);

      /* Scene 3 — answers split from center (3D) */
      tl.fromTo(
        answers,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 },
        1.85
      )
        .fromTo(
          ansA,
          { x: 120, z: -80, rotateY: mobile ? 0 : 28, opacity: 0 },
          { x: 0, z: 30, rotateY: 0, opacity: 1, duration: 0.75, ease: "power3.out" },
          1.9
        )
        .fromTo(
          ansB,
          { x: -120, z: -80, rotateY: mobile ? 0 : -28, opacity: 0 },
          { x: 0, z: 30, rotateY: 0, opacity: 1, duration: 0.75, ease: "power3.out" },
          1.9
        )
        .to(rig, { rotateY: mobile ? 0 : 6, duration: 0.6, ease: "power1.inOut" }, 2)
        .call(() => setStep(2), [], 2);

      /* Scene 4 — collapse to golden result */
      tl.to([q, models], { opacity: 0.25, z: -60, scale: 0.92, duration: 0.45, ease: "power2.in" }, 2.75)
        .to(
          answers,
          { opacity: 0, z: -100, rotateX: 18, scale: 0.85, duration: 0.5, ease: "power2.in" },
          2.75
        )
        .fromTo(
          result,
          { opacity: 0, z: 160, scale: 0.75, rotateX: -20 },
          { opacity: 1, z: 80, scale: 1, rotateX: 0, duration: 0.85, ease: "power3.out" },
          3.1
        )
        .to(rig, { rotateX: 0, rotateY: 0, z: 40, scale: 1.04, duration: 0.7, ease: "power2.out" }, 3.1)
        .call(() => setStep(3), [], 3.2);

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="feat-film-scene" id="how-it-works">
      <div className="feat-container feat-film-intro">
        <span className="feat-eyebrow feat-eyebrow--film">چطور کار می‌کند</span>
        <h2 className="feat-film-title">یک سؤال؛ چند AI؛ یک خروجی بهتر</h2>
        <p className="feat-film-sub">
          اسکرول کن — مثل یک صحنه فیلم، از سؤال تا نتیجه نهایی حرکت می‌کنی.
        </p>
        <span className="feat-scroll-hint" aria-hidden="true">
          <span className="feat-scroll-hint-line" />
          اسکرول
        </span>
      </div>

      <div className="film-pin">
        <div className="film-bg-far" aria-hidden="true" />
        <div className="film-bg-glow" aria-hidden="true" />

        <div className="film-pin-inner">
          <ol className="film-steps" aria-label="مراحل کار">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className={`film-step${i === 0 ? " is-active" : ""}`}
              >
                <span className="film-step-num">{i + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="film-stage">
            {FLOAT_MODELS.map((m, i) => (
              <span
                key={m}
                className="film-orb"
                style={{
                  top: `${12 + i * 14}%`,
                  right: i % 2 === 0 ? `${-2 + i * 2}%` : "auto",
                  left: i % 2 === 1 ? `${-4 + i}%` : "auto",
                }}
              >
                {m}
              </span>
            ))}

            <div className="film-rig">
              <div className="film-panel">
                <div className="film-panel-chrome">
                  <span />
                  <span />
                  <span />
                  <em>آرایه AI</em>
                </div>

                <div className="film-layer film-layer--question">
                  <label>سؤال شما</label>
                  <p>برای تبلیغ محصولم چه متنی بنویسم؟</p>
                </div>

                <div className="film-layer film-layer--models">
                  <div className="film-chips">
                    {["GPT", "Claude", "Gemini", "DeepSeek"].map((m) => (
                      <span key={m} className="film-chip">
                        {m}
                      </span>
                    ))}
                  </div>
                  <div className="film-loading" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>

                <div className="film-layer film-layer--answers">
                  <div className="film-ans film-ans--a">
                    <span className="film-chip">GPT</span>
                    <p>تخفیف ۳۰٪ فقط تا آخر هفته — فوریت خرید.</p>
                  </div>
                  <div className="film-ans film-ans--b">
                    <span className="film-chip">Claude</span>
                    <p>مزیت محصول + اعتماد قبل از پیشنهاد خرید.</p>
                  </div>
                </div>

                <div className="film-layer film-layer--result">
                  <label>خروجی بهتر</label>
                  <p>
                    ترکیب وضوح GPT با اعتماد Claude — متن تبلیغ کوتاه و آماده
                    اینستاگرام.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="feat-film-outro">
        <Link href="/ai?mode=side_by_side" className="ar-btn ar-btn-primary">
          امتحان مقایسه مدل‌ها
        </Link>
      </div>
    </section>
  );
}
