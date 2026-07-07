import type { Transition, Variants } from "framer-motion";

export const easePremium = [0.22, 1, 0.36, 1] as const;

export const springSoft = { type: "spring", stiffness: 120, damping: 22 } as const;

export const tweenFast: Transition = { duration: 0.45, ease: easePremium };

export const tweenMed: Transition = { duration: 0.65, ease: easePremium };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: tweenMed,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: tweenFast },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...springSoft, opacity: { duration: 0.35 } },
  },
};

export const slideInRtl: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: tweenFast },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const heroFloat = {
  y: [0, -12, 0],
  transition: { duration: 7, repeat: Infinity, ease: "easeInOut" },
};

export const pulseGlow = {
  boxShadow: [
    "0 0 0 0 rgba(99, 91, 255, 0.35)",
    "0 0 28px 6px rgba(99, 91, 255, 0.18)",
    "0 0 0 0 rgba(99, 91, 255, 0.35)",
  ],
  transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
};
