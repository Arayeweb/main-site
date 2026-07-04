/* =========================================================
   Araaye Arena — icon system
   Refined line SVGs. No emojis anywhere.
   ========================================================= */

import { getModel, type BrandKey } from "@/lib/aiModels";

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
});

/* ---------- UI chrome ---------- */
export function IconSend({ size = 20, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export function IconStop({ size = 16, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCheck({ size = 16, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M4 12.5l5 5 11-11" />
    </svg>
  );
}

export function IconX({ size = 16, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconArrowLeft({ size = 18, className, strokeWidth = 1.75 }: IconProps) {
  // points left (forward direction in RTL)
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function IconPlus({ size = 16, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconMenu({ size = 20, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClock({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconShield({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconSettings({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function IconPhone({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M5 4h4l1.5 4.5L8 10a12 12 0 006 6l1.5-2.5L20 15v4a1.5 1.5 0 01-1.6 1.5C10.6 20 4 13.4 3.5 5.6A1.5 1.5 0 015 4z" />
    </svg>
  );
}

export function IconSpark({ size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 3c.4 3.6 1.4 4.6 5 5-3.6.4-4.6 1.4-5 5-.4-3.6-1.4-4.6-5-5 3.6-.4 4.6-1.4 5-5z" />
      <path d="M18.5 14c.2 1.6.6 2 2 2.2-1.4.2-1.8.6-2 2.2-.2-1.6-.6-2-2-2.2 1.4-.2 1.8-.6 2-2.2z" />
    </svg>
  );
}

export function IconSwords({ size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M3 3l7 7M5 3H3v2M14 14l4 4M18 18l2 2M16 20l4-4" />
      <path d="M21 3l-7 7M19 3h2v2M10 14l-4 4M6 18l-2 2M8 20l-4-4" />
    </svg>
  );
}

export function IconDiamond({ size = 14, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M6 3h12l3 5-9 13L3 8z" />
      <path d="M3 8h18M9 3l-1.5 5L12 21l4.5-13L15 3" />
    </svg>
  );
}

export function IconLock({ size = 14, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  );
}

export function IconLogout({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
      <path d="M10 12h10M17 9l3 3-3 3" />
    </svg>
  );
}

export function IconColumns({ size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="3" y="4" width="8" height="16" rx="2" />
      <rect x="13" y="4" width="8" height="16" rx="2" />
    </svg>
  );
}

export function IconChat({ size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M21 12a8 8 0 0 1-8 8c-1.4 0-2.8-.3-4-1l-5 1 1.3-4.3A8 8 0 1 1 21 12z" />
    </svg>
  );
}

/** Chat bubble with plus — «گفتگوی جدید» */
export function IconNewChat({ size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M21 12a8 8 0 0 1-8 8c-1.4 0-2.8-.3-4-1l-5 1 1.3-4.3A8 8 0 1 1 21 12z" />
      <path d="M12 8.5v7M8.5 12h7" strokeWidth={strokeWidth + 0.35} />
    </svg>
  );
}

/* ---------- message actions ---------- */
export function IconCopy({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

export function IconShare({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.5 10.8l7-3.6M8.5 13.2l7 3.6" />
    </svg>
  );
}

export function IconRefresh({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M4 12a8 8 0 0 1 13.5-5.7L20 8" />
      <path d="M20 8v-4M20 8h-4" />
      <path d="M20 12a8 8 0 0 1-13.5 5.7L4 16" />
      <path d="M4 16v4M4 16h4" />
    </svg>
  );
}

export function IconThumbUp({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h2" />
      <path d="M7 11l2.5-6.5a1.5 1.5 0 0 1 2.8.5V9h5.5a1.5 1.5 0 0 1 1.5 1.7l-1.2 7A1.5 1.5 0 0 1 16.6 19H7" />
    </svg>
  );
}

export function IconThumbDown({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M17 13v-8a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" />
      <path d="M17 13l-2.5 6.5a1.5 1.5 0 0 1-2.8-.5V15H6.2a1.5 1.5 0 0 1-1.5-1.7l1.2-7A1.5 1.5 0 0 1 7.4 5H17" />
    </svg>
  );
}

export function IconDots({ size = 16, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="5" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function UserAvatar({
  initial = "ش",
  size = 32,
  className = "",
}: {
  initial?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`ar-user-avatar ${className}`.trim()}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden
    >
      {initial.slice(0, 1)}
    </span>
  );
}

/* ---------- suggestion card marks ---------- */
export function IconLayout({ size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M9 9v11" />
    </svg>
  );
}

export function IconChart({ size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M4 19V5M20 19H4M8 15l3.5-3.5L14 14l4-4.5" />
    </svg>
  );
}

export function IconBulb({ size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.4 1.1 2.2h5c0-.8.5-1.7 1.1-2.2A6 6 0 0 0 12 3z" />
    </svg>
  );
}

export function IconPen({ size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z" />
      <path d="M14 6l4 4" />
    </svg>
  );
}

export function IconGlobe({ size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14.5 0 17-2.5-2.5-2.5-14.5 0-17z" />
    </svg>
  );
}

export function IconCode({ size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M8 6l-6 6 6 6M16 6l6 6-6 6" />
    </svg>
  );
}

export function IconPaperclip({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M8.5 14.5l5-5a3 3 0 00-4.24-4.24l-5.5 5.5a4.5 4.5 0 006.36 6.36l5.5-5.5" />
    </svg>
  );
}

export function IconTrophy({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M6 4h12v3a4 4 0 01-4 4h-4a4 4 0 01-4-4V4zM9 18h6M12 14v4" />
      <path d="M6 4H4a2 2 0 002 2M18 4h2a2 2 0 01-2 2" />
    </svg>
  );
}

export function IconImage({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M4 16l4.5-4.5 3 3L16 10l4 4" />
    </svg>
  );
}

export function IconVideo({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <polygon points="10,9 10,15 16,12" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMic({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="9" y="4" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0012 0M12 17v3" />
    </svg>
  );
}

export function IconMusic({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M9 18V5l10-2v13" />
      <circle cx="7" cy="18" r="2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="16" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconEye({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function IconDownload({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 4v10M8 10l4 4 4-4" />
      <path d="M5 18h14" />
    </svg>
  );
}

export function IconGift({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M12 10V20M4 10h16M8.5 10C7 10 6 9 6 7.5S7 5 8.5 5 11 6.5 11 8M15.5 10c1.5 0 2.5-1 2.5-2.5S17 5 15.5 5 13 6.5 13 8" />
    </svg>
  );
}

/* ---------- AI model brand marks (clean, distinct, monochrome) ---------- */
function BrandOpenAI({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.5}>
      <path d="M12 3l7.5 4.5v9L12 21l-7.5-4.5v-9L12 3z" />
      <path d="M12 8.2l3.9 2.3v2.9L12 15.8l-3.9-2.4v-2.9L12 8.2z" />
    </svg>
  );
}
function BrandGemini({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c.5 5 4.5 9 10 10-5.5 1-9.5 5-10 10-.5-5-4.5-9-10-10 5.5-1 9.5-5 10-10z" />
    </svg>
  );
}
function BrandGrok({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.6}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M7 17L17 7" />
    </svg>
  );
}
function BrandLlama({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.6}>
      <circle cx="8" cy="12" r="4.4" />
      <circle cx="16" cy="12" r="4.4" />
    </svg>
  );
}
function BrandDeepSeek({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.6}>
      <path d="M19 6c-3.5 1-5 3-5 6 0 2.5 2 4.5 4.5 4.5C12 22 5 18.5 5 12.5 5 7.5 9 4 14 4" />
    </svg>
  );
}
function BrandMistral({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.7}>
      <path d="M5 8h14M5 12h14M5 16h14" />
    </svg>
  );
}
function BrandClaude({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.7}>
      <path d="M12 4v16M5 7l14 10M19 7L5 17" />
    </svg>
  );
}
function BrandByteDance({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.6}>
      <path d="M8 6v12M16 6v12M8 12h8" />
    </svg>
  );
}
function BrandKwaivgi({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.6}>
      <polygon points="8,6 18,12 8,18" fill="currentColor" stroke="none" />
    </svg>
  );
}
function BrandGoogle({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.6}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

const BRAND_GLYPH: Record<BrandKey, (p: IconProps) => JSX.Element> = {
  openai: BrandOpenAI,
  gemini: BrandGemini,
  grok: BrandGrok,
  llama: BrandLlama,
  deepseek: BrandDeepSeek,
  mistral: BrandMistral,
  claude: BrandClaude,
  bytedance: BrandByteDance,
  kwaivgi: BrandKwaivgi,
  google: BrandGoogle,
};

export function BrandGlyph({ brand, size = 20 }: { brand: BrandKey; size?: number }) {
  const G = BRAND_GLYPH[brand] ?? BrandOpenAI;
  return <G size={size} />;
}

/* Circular avatar for an AI model (brand mark in a tinted ring) */
export function ModelAvatar({
  modelId,
  size = 38,
  className = "",
}: {
  modelId: string;
  size?: number;
  className?: string;
}) {
  const m = getModel(modelId);
  const color = m?.color ?? "#9CA3AF";
  const brand: BrandKey = m?.brand ?? "openai";
  return (
    <span
      className={`ar-model-avatar ${className}`.trim()}
      style={{ width: size, height: size, color }}
    >
      <BrandGlyph brand={brand} size={size * 0.52} />
    </span>
  );
}
