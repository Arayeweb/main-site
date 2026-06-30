// =========================================================
// رجیستری مدل‌های هوش مصنوعی + پریست‌های عمومی
// قابل import در سرور (موتور) و کلاینت (UI) — فقط داده، بدون وابستگی سرور.
// =========================================================

export type BrandKey =
  | "openai"
  | "gemini"
  | "grok"
  | "llama"
  | "deepseek"
  | "mistral"
  | "claude";

export interface AIModelInfo {
  id: string;        // اسلاگ OpenRouter
  name: string;      // نام نمایشی
  brand: BrandKey;   // برای آیکون و رنگ
  color: string;     // رنگ برند
  free: boolean;     // در پلن رایگان قابل استفاده
  blurb: string;     // توضیح کوتاه برای کاربر عمومی
}

export const MODELS: AIModelInfo[] = [
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o mini",
    brand: "openai",
    color: "#E6E6E8",
    free: true,
    blurb: "سریع و همه‌کاره",
  },
  {
    id: "google/gemini-flash-1.5",
    name: "Gemini Flash",
    brand: "gemini",
    color: "#5B9BFF",
    free: true,
    blurb: "خلاق و روان",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3",
    brand: "llama",
    color: "#7AA2FF",
    free: true,
    blurb: "متن‌باز و قوی",
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek",
    brand: "deepseek",
    color: "#6E8BFF",
    free: false,
    blurb: "تحلیلی و دقیق",
  },
  {
    id: "x-ai/grok-2-1212",
    name: "Grok 2",
    brand: "grok",
    color: "#D8DADF",
    free: false,
    blurb: "بی‌پرده و به‌روز",
  },
  {
    id: "mistralai/mistral-large",
    name: "Mistral",
    brand: "mistral",
    color: "#F0A33C",
    free: false,
    blurb: "کارآمد و چابک",
  },
  {
    id: "anthropic/claude-3.5-haiku",
    name: "Claude Haiku",
    brand: "claude",
    color: "#E0A37A",
    free: false,
    blurb: "دقیق و منظم",
  },
];

const MODEL_MAP: Record<string, AIModelInfo> = Object.fromEntries(
  MODELS.map((m) => [m.id, m])
);

export function getModel(id: string): AIModelInfo | undefined {
  return MODEL_MAP[id];
}

/** نام نمایشی یک مدل (یا خود id اگر ناشناخته بود) */
export function modelName(id: string): string {
  return MODEL_MAP[id]?.name ?? id;
}

// ---------- پریست‌ها (عمومی، نه تخصصی) ----------

export interface ModelPreset {
  id: string;
  name: string;
  blurb: string;
  models: string[];
  pro: boolean;
}

export const PRESETS: ModelPreset[] = [
  {
    id: "everyday",
    name: "نظرِ چند هوش",
    blurb: "چند هوش مصنوعیِ سریع همزمان جواب می‌دهند و یک جمع‌بندی می‌گیری.",
    models: [
      "openai/gpt-4o-mini",
      "google/gemini-flash-1.5",
      "meta-llama/llama-3.3-70b-instruct",
    ],
    pro: false,
  },
  {
    id: "stronger",
    name: "هوش‌های قوی‌تر",
    blurb: "مدل‌های قدرتمندتر برای تصمیم‌ها و سؤال‌های مهم‌تر.",
    models: [
      "openai/gpt-4o-mini",
      "anthropic/claude-3.5-haiku",
      "deepseek/deepseek-chat",
      "x-ai/grok-2-1212",
    ],
    pro: true,
  },
];

/** شورای پیش‌فرض (همان پریست everyday) */
export const DEFAULT_COUNCIL = PRESETS[0].models;

/** فقط مدل‌های مجاز در پلن، با سقف ۴ تا */
export function sanitizeCouncil(ids: string[] | undefined, plan: string): string[] {
  const allowAll = plan === "pro" || plan === "business";
  const valid = (ids ?? []).filter((id) => {
    const m = MODEL_MAP[id];
    return m && (allowAll || m.free);
  });
  const list = valid.length >= 2 ? valid : DEFAULT_COUNCIL;
  return list.slice(0, 4);
}
