"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { easePremium, scaleIn, staggerFast } from "../motion";

const QUESTION = "برای تبلیغ محصولم چه متنی بنویسم؟";

const ANSWERS = [
  { model: "GPT", text: "تخفیف ۳۰٪ فقط تا آخر هفته — همین حالا سفارش بده." },
  { model: "Claude", text: "این محصول مشکل روزمره‌ات را حل می‌کند — قبل از تخفیف، ارزشش را ببین." },
  { model: "Gemini", text: "یک جمله کوتاه + یک مزیت کلیدی + دعوت به اقدام واضح." },
];

const RESULT =
  "ترکیب وضوح GPT با اعتماد Claude — متن تبلیغی کوتاه، قابل اعتماد و مناسب اینستاگرام.";

type Phase = 0 | 1 | 2 | 3;

export default function AnimatedHeroMockup() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduced ? 3 : 0);
  const [typed, setTyped] = useState(reduced ? QUESTION : "");

  useEffect(() => {
    if (reduced) return;
    const phaseTimer = window.setInterval(() => {
      setPhase((p) => ((p + 1) % 4) as Phase);
    }, 3200);
    return () => window.clearInterval(phaseTimer);
  }, [reduced]);

  useEffect(() => {
    if (reduced || phase !== 0) {
      if (phase > 0) setTyped(QUESTION);
      return;
    }
    setTyped("");
    let i = 0;
    const typeTimer = window.setInterval(() => {
      i += 1;
      setTyped(QUESTION.slice(0, i));
      if (i >= QUESTION.length) window.clearInterval(typeTimer);
    }, 45);
    return () => window.clearInterval(typeTimer);
  }, [phase, reduced]);

  return (
    <motion.div
      className="feat-mockup"
      initial={{ rotateX: 8, rotateY: -6 }}
      animate={{ rotateX: 0, rotateY: 0 }}
      transition={{ duration: 1, ease: easePremium }}
      style={{ perspective: 1200, transformStyle: "preserve-3d" }}
    >
      <div className="feat-mockup-glass">
        <div className="feat-mockup-chrome">
          <span className="feat-mockup-dot" />
          <span className="feat-mockup-dot" />
          <span className="feat-mockup-dot" />
          <span className="feat-mockup-title">آرایه AI</span>
          <span className="feat-mockup-mode">مقایسه</span>
        </div>

        <div className="feat-mockup-body">
          <div className="feat-mockup-question">
            <span className="feat-mockup-label">سؤال شما</span>
            <p>
              {typed}
              {phase === 0 && !reduced && (
                <motion.span
                  className="feat-mockup-cursor"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </p>
          </div>

          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                key="models"
                className="feat-mockup-models"
                variants={staggerFast}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              >
                {["GPT", "Claude", "Gemini"].map((m) => (
                  <motion.span key={m} className="feat-mockup-pill" variants={scaleIn}>
                    {m}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                key="answers"
                className="feat-mockup-answers"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -8 }}
                variants={staggerFast}
              >
                {ANSWERS.map((a) => (
                  <motion.div key={a.model} className="feat-mockup-answer" variants={scaleIn}>
                    <span className="feat-mockup-pill feat-mockup-pill--sm">{a.model}</span>
                    <p>{a.text}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                key="result"
                className="feat-mockup-result"
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  boxShadow: [
                    "0 0 0 0 rgba(99, 91, 255, 0.35)",
                    "0 0 28px 6px rgba(99, 91, 255, 0.2)",
                    "0 0 0 0 rgba(99, 91, 255, 0.35)",
                  ],
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  opacity: { duration: 0.5, ease: easePremium },
                  scale: { duration: 0.5, ease: easePremium },
                  y: { duration: 0.5, ease: easePremium },
                  boxShadow: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <span className="feat-mockup-label feat-mockup-label--accent">خروجی بهتر</span>
                <p>{RESULT}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
