"use client";

import { motion } from "framer-motion";
import { fadeUp } from "../motion";

const BADGES = [
  "فارسی‌پسند",
  "بدون VPN",
  "پرداخت تومانی",
  "چند مدل AI",
  "مناسب کار واقعی",
];

export default function ProofStrip() {
  return (
    <section className="feat-proof" aria-label="مزایا">
      <motion.div
        className="feat-proof-track"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {[...BADGES, ...BADGES].map((label, i) => (
          <span key={`${label}-${i}`} className="feat-proof-item">
            <span className="feat-proof-dot" aria-hidden="true" />
            {label}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
