"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "../motion";

export default function FinalCTA() {
  return (
    <motion.section
      className="feat-final"
      aria-labelledby="feat-final-title"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={fadeUp}
    >
      <motion.div
        className="feat-final-glow"
        aria-hidden="true"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="feat-final-inner"
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(99, 91, 255, 0)",
            "0 0 48px 12px rgba(99, 91, 255, 0.12)",
            "0 0 0 0 rgba(99, 91, 255, 0)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <h2 id="feat-final-title">از امروز AI را جدی‌تر استفاده کن.</h2>
        <p>
          به‌جای جابه‌جا شدن بین ابزارهای مختلف، از یک پنل ساده برای پرسیدن، مقایسه
          کردن و خروجی گرفتن استفاده کن.
        </p>
        <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
          <Link href="/ai" className="ar-btn ar-btn-primary feat-btn-lg feat-final-btn">
            شروع استفاده از Araaye AI
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
