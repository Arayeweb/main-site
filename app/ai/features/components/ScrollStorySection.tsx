"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { easePremium, fadeUp, scaleIn, staggerFast } from "../motion";

const STEPS = [
  {
    title: "سوالت را بنویس",
    desc: "به فارسی بنویس — آرایه مسیر پاسخ را انتخاب می‌کند.",
    visual: "question" as const,
  },
  {
    title: "چند مدل جواب می‌دهند",
    desc: "GPT، Claude، Gemini و … همزمان پاسخ می‌دهند.",
    visual: "models" as const,
  },
  {
    title: "جواب‌ها کنار هم مقایسه می‌شوند",
    desc: "تفاوت لحن، دقت و کاربرد را یکجا ببین.",
    visual: "compare" as const,
  },
  {
    title: "خروجی نهایی آماده می‌شود",
    desc: "بهترین نتیجه — آماده کپی و استفاده در کار واقعی.",
    visual: "result" as const,
  },
];

function StoryVisual({ visual }: { visual: (typeof STEPS)[number]["visual"] }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={visual}
        className="feat-story-visual-inner"
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
        transition={{ duration: 0.4, ease: easePremium }}
      >
        {visual === "question" && (
          <div className="feat-story-state feat-story-state--question">
            <label>سؤال</label>
            <p>ایده کمپین فروش برای محصول جدیدم چیست؟</p>
          </div>
        )}
        {visual === "models" && (
          <div className="feat-story-state feat-story-state--models">
            <motion.div className="feat-story-model-row" variants={staggerFast} initial="hidden" animate="visible">
              {["GPT", "Claude", "Gemini", "DeepSeek"].map((m) => (
                <motion.span key={m} className="feat-story-model-chip" variants={scaleIn}>
                  {m}
                </motion.span>
              ))}
            </motion.div>
            <div className="feat-story-loading">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1, 0.85] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
        {visual === "compare" && (
          <div className="feat-story-state feat-story-state--compare">
            <motion.div
              className="feat-story-compare-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
            >
              <span>GPT</span>
              <p>تمرکز روی تخفیف و فوریت خرید</p>
            </motion.div>
            <motion.div
              className="feat-story-compare-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <span>Claude</span>
              <p>روایت اعتماد و مزیت محصول قبل از پیشنهاد</p>
            </motion.div>
          </div>
        )}
        {visual === "result" && (
          <motion.div
            className="feat-story-state feat-story-state--result"
            initial={{ scale: 0.94 }}
            animate={{
              scale: 1,
              boxShadow: [
                "0 0 0 0 rgba(99, 91, 255, 0.3)",
                "0 0 32px 8px rgba(99, 91, 255, 0.15)",
                "0 0 0 0 rgba(99, 91, 255, 0.3)",
              ],
            }}
            transition={{
              scale: { duration: 0.4 },
              boxShadow: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <label>خروجی بهتر</label>
            <p>
              کمپین «مزیت + اعتماد + دعوت محدود» — متن آماده برای اینستاگرام و دایرکت
              فروش.
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function ScrollStorySection() {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const sentinels = root.querySelectorAll<HTMLElement>("[data-story-step]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-story-step"));
            if (!Number.isNaN(idx)) setActive(idx);
          }
        });
      },
      { root: null, threshold: 0.55, rootMargin: "-20% 0px -35% 0px" }
    );

    sentinels.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="feat-story" id="how-it-works">
      <div className="feat-container">
        <motion.div
          className="feat-section-head feat-section-head--light"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <span className="feat-eyebrow">چطور کار می‌کند</span>
          <h2>از سؤال تا خروجی بهتر — در یک جریان</h2>
          <p>اسکرول کن و ببین چطور چند AI با هم به نتیجه بهتر می‌رسند.</p>
        </motion.div>
      </div>

      <div className="feat-story-scroll" ref={containerRef}>
        <div className="feat-story-sticky">
          <div className="feat-story-layout">
            <ol className="feat-story-steps">
              {STEPS.map((step, i) => (
                <motion.li
                  key={step.title}
                  className={`feat-story-step${active === i ? " active" : ""}${active > i ? " done" : ""}`}
                  animate={{
                    opacity: active === i ? 1 : active > i ? 0.75 : 0.4,
                    x: active === i ? 0 : 4,
                    scale: active === i ? 1 : 0.98,
                  }}
                  transition={{ duration: 0.35, ease: easePremium }}
                  layout
                >
                  <motion.span
                    className="feat-story-step-num"
                    animate={{
                      background: active === i ? "var(--ar-accent)" : "rgba(255,255,255,0.08)",
                      color: active === i ? "#fff" : "inherit",
                    }}
                  >
                    {i + 1}
                  </motion.span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ol>

            <div className="feat-story-visual">
              <div className="feat-story-panel">
                <div className="feat-story-panel-chrome">
                  <span />
                  <span />
                  <span />
                  <em>آرایه AI</em>
                </div>
                <StoryVisual visual={STEPS[active]?.visual ?? "question"} />
              </div>
            </div>
          </div>
        </div>

        {STEPS.map((_, i) => (
          <div key={i} className="feat-story-sentinel" data-story-step={i} aria-hidden="true" />
        ))}
      </div>
    </section>
  );
}
