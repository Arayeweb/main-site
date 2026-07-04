import type { SpecialtyKey } from "@/lib/demoData";

// Static, fully-literal Tailwind class names per specialty accent color so the
// JIT compiler can find and generate them (dynamic `bg-${x}-600` strings would
// be purged). Keep every accent in sync when adding a new specialty.
export interface AccentClasses {
  bg: string;
  hoverBg: string;
  ring: string;
  text: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  softBg: string;
  gradientFrom: string;
  gradientVia: string;
  chatHeader: string;
  chatBorder: string;
  chatBotBubble: string;
  chatInputBg: string;
  chatDot: string;
}

export const accentConfig: Record<SpecialtyKey, AccentClasses> = {
  dentist: {
    bg: "bg-cyan-600",
    hoverBg: "hover:bg-cyan-700",
    ring: "focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100",
    text: "text-cyan-600",
    border: "border-cyan-500",
    badgeBg: "bg-cyan-50",
    badgeText: "text-cyan-700",
    softBg: "bg-cyan-50",
    gradientFrom: "from-cyan-50/70",
    gradientVia: "via-white",
    chatHeader: "bg-cyan-700",
    chatBorder: "border-cyan-100",
    chatBotBubble: "bg-cyan-50/80",
    chatInputBg: "bg-cyan-50/60 focus:ring-cyan-200",
    chatDot: "bg-cyan-500",
  },
  clinic: {
    bg: "bg-brand-600",
    hoverBg: "hover:bg-brand-700",
    ring: "focus:border-brand-400 focus:ring-2 focus:ring-brand-100",
    text: "text-brand-600",
    border: "border-brand-500",
    badgeBg: "bg-brand-50",
    badgeText: "text-brand-700",
    softBg: "bg-brand-50",
    gradientFrom: "from-brand-50/70",
    gradientVia: "via-white",
    chatHeader: "bg-brand-700",
    chatBorder: "border-brand-100",
    chatBotBubble: "bg-brand-50/80",
    chatInputBg: "bg-brand-50/60 focus:ring-brand-200",
    chatDot: "bg-brand-500",
  },
  psychologist: {
    bg: "bg-violet-600",
    hoverBg: "hover:bg-violet-700",
    ring: "focus:border-violet-400 focus:ring-2 focus:ring-violet-100",
    text: "text-violet-600",
    border: "border-violet-500",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
    softBg: "bg-violet-50",
    gradientFrom: "from-violet-50/70",
    gradientVia: "via-white",
    chatHeader: "bg-violet-700",
    chatBorder: "border-violet-100",
    chatBotBubble: "bg-violet-50/80",
    chatInputBg: "bg-violet-50/60 focus:ring-violet-200",
    chatDot: "bg-violet-500",
  },
};
