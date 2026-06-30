/* =========================================================
   Araaye AI — icon system
   Refined line SVGs. No emojis anywhere.
   ========================================================= */

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
export function IconArrowRight({ size = 20, className, strokeWidth = 1.75 }: IconProps) {
  // points right (used as "back" in RTL)
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconSend({ size = 20, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export function IconCopy({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
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

export function IconPlus({ size = 18, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 5v14M5 12h14" />
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

export function IconLock({ size = 14, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
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

export function IconLogout({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
      <path d="M10 12h10M17 9l3 3-3 3" />
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

/* ---------- Mode / agent marks (geometric, distinctive) ---------- */
export function IconBolt({ size = 22, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" />
    </svg>
  );
}

export function IconAnalyst({ size = 22, className, strokeWidth = 1.6 }: IconProps) {
  // analytic nodes / signal
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M4 19V5M20 19H4M8 15l3.5-3.5L14 14l4-4.5" />
      <circle cx="8" cy="15" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="9.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconExec({ size = 22, className, strokeWidth = 1.6 }: IconProps) {
  // briefcase / executive
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 12.5h18" />
    </svg>
  );
}

export function IconRisk({ size = 22, className, strokeWidth = 1.6 }: IconProps) {
  // shield
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M12 9v4M12 16h.01" />
    </svg>
  );
}

export function IconCreative({ size = 22, className, strokeWidth = 1.6 }: IconProps) {
  // bulb / spark
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.4 1.1 2.2h5c0-.8.5-1.7 1.1-2.2A6 6 0 0 0 12 3z" />
    </svg>
  );
}

export function IconDoc({ size = 22, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M6 3h8l4 4v14a0 0 0 0 1 0 0H6a0 0 0 0 1 0 0V3z" />
      <path d="M14 3v4h4M9 13h6M9 17h4" />
    </svg>
  );
}

export function IconTarget({ size = 22, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconLogic({ size = 22, className, strokeWidth = 1.6 }: IconProps) {
  // branching nodes
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="12" r="2.2" />
      <path d="M8 7l8 4M8 17l8-4" />
    </svg>
  );
}

export function IconGear({ size = 22, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </svg>
  );
}

export function IconSeal({ size = 22, className, strokeWidth = 1.6 }: IconProps) {
  // verified / improved
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 2.5l2.4 1.7 2.9-.2 1 2.7 2.3 1.8-1 2.7 1 2.7-2.3 1.8-1 2.7-2.9-.2L12 21.5l-2.4-1.7-2.9.2-1-2.7L3.4 15.5l1-2.7-1-2.7 2.3-1.8 1-2.7 2.9.2L12 2.5z" />
      <path d="M8.5 12l2.5 2.5L15.5 10" />
    </svg>
  );
}

/* ---------- AI model brand marks (clean, distinct, monochrome) ---------- */
import { getModel, type BrandKey } from "@/lib/aiModels";

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

const BRAND_GLYPH: Record<BrandKey, (p: IconProps) => JSX.Element> = {
  openai: BrandOpenAI,
  gemini: BrandGemini,
  grok: BrandGrok,
  llama: BrandLlama,
  deepseek: BrandDeepSeek,
  mistral: BrandMistral,
  claude: BrandClaude,
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
      className={`ai-model-avatar ${className}`.trim()}
      style={{ width: size, height: size, color }}
    >
      <BrandGlyph brand={brand} size={size * 0.52} />
    </span>
  );
}

/* ---------- Agent registry ---------- */
export type AgentKey =
  | "quick"
  | "logical_analyst"
  | "exec_advisor"
  | "risk_critic"
  | "creative"
  | "synthesizer"
  | "initial"
  | "accuracy_critic"
  | "logic_critic"
  | "practical_critic"
  | "final_improved";

type AgentMeta = {
  label: string;
  color: string;
  Icon: (p: IconProps) => JSX.Element;
};

export const AGENTS: Record<AgentKey, AgentMeta> = {
  quick:            { label: "پاسخ مستقیم",        color: "var(--clr-quick)",     Icon: IconBolt },
  logical_analyst:  { label: "تحلیل‌گر منطقی",     color: "var(--clr-logical)",   Icon: IconAnalyst },
  exec_advisor:     { label: "مشاور اجرایی",        color: "var(--clr-exec)",      Icon: IconExec },
  risk_critic:      { label: "منتقد ریسک",          color: "var(--clr-risk)",      Icon: IconRisk },
  creative:         { label: "متفکر خلاق",          color: "var(--clr-creative)",  Icon: IconCreative },
  synthesizer:      { label: "هماهنگ‌کننده شورا",   color: "var(--clr-synth)",     Icon: IconSpark },
  initial:          { label: "پاسخ اولیه",          color: "var(--clr-initial)",   Icon: IconDoc },
  accuracy_critic:  { label: "نقد دقت",             color: "var(--clr-acc)",       Icon: IconTarget },
  logic_critic:     { label: "نقد منطق",            color: "var(--clr-logic)",     Icon: IconLogic },
  practical_critic: { label: "نقد اجرا",            color: "var(--clr-practical)", Icon: IconGear },
  final_improved:   { label: "نسخه نهایی",          color: "var(--clr-final)",     Icon: IconSeal },
};

/* Circular avatar mark for an agent */
export function AgentAvatar({
  agent,
  size = 38,
  className = "",
}: {
  agent: AgentKey;
  size?: number;
  className?: string;
}) {
  const meta = AGENTS[agent] ?? AGENTS.initial;
  const Icon = meta.Icon;
  return (
    <span
      className={`ai-agent-avatar ${className}`.trim()}
      style={{ width: size, height: size, color: meta.color }}
    >
      <Icon size={size * 0.5} strokeWidth={1.7} />
    </span>
  );
}

/* The signature conic-gradient orb for the moderator/synthesis */
export function ModeratorOrb({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`ai-orb ${className}`.trim()} style={{ width: size, height: size }} />
  );
}
