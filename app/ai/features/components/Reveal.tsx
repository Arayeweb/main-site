"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp } from "../motion";

export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: "-60px" }}
      variants={fadeUp}
      transition={{ delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}
