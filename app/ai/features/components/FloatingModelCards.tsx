"use client";

import { motion } from "framer-motion";

const MODELS = [
  { id: "gpt", label: "GPT", style: { top: "8%", right: "-4%" }, dur: 6.2, y: 10, x: 5 },
  { id: "claude", label: "Claude", style: { top: "22%", left: "-6%" }, dur: 7.1, y: 8, x: -6 },
  { id: "gemini", label: "Gemini", style: { bottom: "28%", right: "-8%" }, dur: 5.8, y: 12, x: 4 },
  { id: "deepseek", label: "DeepSeek", style: { bottom: "12%", left: "-4%" }, dur: 6.6, y: 9, x: -5 },
  { id: "llama", label: "Llama", style: { top: "48%", right: "-10%" }, dur: 7.4, y: 11, x: 6 },
] as const;

export default function FloatingModelCards() {
  return (
    <div className="feat-float-cards" aria-hidden="true">
      {MODELS.map((m, i) => (
        <motion.div
          key={m.id}
          className="feat-float-card"
          style={m.style}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -m.y, 0],
            x: [0, m.x, 0],
          }}
          transition={{
            opacity: { duration: 0.5, delay: 0.4 + i * 0.1 },
            scale: { duration: 0.5, delay: 0.4 + i * 0.1 },
            y: { duration: m.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
            x: { duration: m.dur + 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
          }}
        >
          <span className="feat-float-card-dot" />
          {m.label}
        </motion.div>
      ))}
    </div>
  );
}
