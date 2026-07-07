"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { easePremium, fadeUp, scaleIn, staggerFast } from "../motion";

const MODES = [
  {
    id: "fast",
    label: "سریع",
    desc: "یک مدل، پاسخ فوری — برای کارهای روزمره.",
    preview: "fast" as const,
  },
  {
    id: "compare",
    label: "مقایسه",
    desc: "چند جواب کنار هم — برای انتخاب بهتر.",
    preview: "compare" as const,
    featured: true,
  },
  {
    id: "council",
    label: "همفکری",
    desc: "نقد و جمع‌بندی — برای تصمیم‌های مهم‌تر.",
    preview: "council" as const,
  },
];

function ModePreview({ preview }: { preview: (typeof MODES)[number]["preview"] }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={preview}
        className="feat-mode-preview-ui"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: easePremium }}
      >
        {preview === "fast" && (
          <>
            <div className="feat-mp-q">خلاصه این مقاله را بنویس</div>
            <motion.div
              className="feat-mp-a feat-mp-a--single"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className="feat-mp-model">GPT</span>
              <p>خلاصه سه‌بخشی: مقدمه، نکات کلیدی، جمع‌بندی.</p>
            </motion.div>
          </>
        )}
        {preview === "compare" && (
          <>
            <div className="feat-mp-q">کپشن اینستاگرام برای محصول جدید</div>
            <motion.div className="feat-mp-cols" variants={staggerFast} initial="hidden" animate="visible">
              <motion.div className="feat-mp-a" variants={scaleIn}>
                <span className="feat-mp-model">GPT</span>
                <p>کوتاه و مستقیم با CTA خرید</p>
              </motion.div>
              <motion.div className="feat-mp-a" variants={scaleIn}>
                <span className="feat-mp-model">Claude</span>
                <p>داستانی با تاکید بر مزیت</p>
              </motion.div>
            </motion.div>
          </>
        )}
        {preview === "council" && (
          <>
            <div className="feat-mp-q">استراتژی قیمت‌گذاری محصول</div>
            <motion.div className="feat-mp-council" variants={staggerFast} initial="hidden" animate="visible">
              <motion.div className="feat-mp-critique" variants={scaleIn}>
                <span>GPT</span>
                <p>تمرکز روی رقابت قیمتی</p>
              </motion.div>
              <motion.div className="feat-mp-critique" variants={scaleIn}>
                <span>Claude</span>
                <p>ارزش در برابر قیمت</p>
              </motion.div>
              <motion.div className="feat-mp-synth" variants={scaleIn}>
                <span>جمع‌بندی</span>
                <p>ترکیب قیمت رقابتی + پیام ارزش</p>
              </motion.div>
            </motion.div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function ModePreviewCards() {
  const [active, setActive] = useState("compare");
  const current = MODES.find((m) => m.id === active) ?? MODES[1];

  return (
    <section className="feat-section feat-section--modes" id="modes">
      <div className="feat-container">
        <motion.div
          className="feat-section-head"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span className="feat-eyebrow">سه حالت</span>
          <h2>برای هر کار، یک حالت مناسب</h2>
          <p>سریع، مقایسه یا همفکری — بدون پیچیدگی اضافی.</p>
        </motion.div>

        <div className="feat-modes-layout">
          <div className="feat-modes-tabs" role="tablist" aria-label="حالت‌های گفتگو">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={active === m.id}
                className={`feat-mode-tab${active === m.id ? " active" : ""}`}
                onClick={() => setActive(m.id)}
              >
                {active === m.id && (
                  <motion.span
                    layoutId="feat-mode-pill"
                    className="feat-mode-tab-bg"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="feat-mode-tab-label">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="feat-mode-preview-wrap">
            <article className="feat-mode-preview">
              <ModePreview preview={current.preview} />
            </article>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className="feat-mode-copy"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <h3>{current.label}</h3>
                <p>{current.desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
