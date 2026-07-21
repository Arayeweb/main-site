// =========================================================
// رجیستری مدل‌های هوش مصنوعی — Araaye Arena
// direct: ۵ شخصیت فارسی (هوش مصنوعی دقیق…)
// compare/battle: ~۱۰ مدل با نام موتور واقعی provider — battle ناشناس تا رأی
// image: SKU جدا
// =========================================================

export type BrandKey =
  | "openai"
  | "gemini"
  | "grok"
  | "llama"
  | "deepseek"
  | "mistral"
  | "claude"
  | "bytedance"
  | "kwaivgi"
  | "google"
  | "qwen";

export type ModelTier = "economy" | "mid" | "premium";
export type ModelKind = "direct" | "compare" | "image" | "video" | "audio" | "transcribe" | "music";

export interface ModelCapabilities {
  vision?: boolean;
  imageGen?: boolean;
  videoGen?: boolean;
  audioGen?: boolean;
  transcribe?: boolean;
  musicGen?: boolean;
}

export interface AIModelInfo {
  id: string;
  routeId: string;
  /** نام در picker مقایسه / افشای battle */
  name: string;
  /** فقط direct — «هوش مصنوعی دقیق» */
  personaName?: string;
  poweredBy: string;
  brand: BrandKey;
  color: string;
  tier: ModelTier;
  estCostPer1kTokens: number;
  blurb: string;
  capabilities?: ModelCapabilities;
  kind: ModelKind;
  imageCreditCost?: number;
  /** chat = /chat/completions؛ images = /images (GPT Image 2) */
  imageApi?: "chat" | "images";
  videoCreditCost?: number;
  videoDurations?: number[];
  audioCreditCost?: number;
  transcribeCreditPerMinute?: number;
  musicCreditCost?: number;
}

export const POWERED_BY_TAGLINE =
  "Powered by GPT-5.6, Claude Sonnet 5, Gemini, Grok, DeepSeek, Qwen";

export const IMAGE_POWERED_BY_TAGLINE =
  "Powered by Gemini 3.1 Image, GPT Image 2";

export const VIDEO_POWERED_BY_TAGLINE =
  "Powered by Seedance, Kling, Sora, Veo";

export const AUDIO_POWERED_BY_TAGLINE =
  "Powered by GPT Audio, GPT-4o Transcribe";

export const MUSIC_POWERED_BY_TAGLINE = "Powered by Google Lyria 3";

/** گفتگوی مستقیم — فقط ۵ شخصیت */
export const DIRECT_MODELS: AIModelInfo[] = [
  {
    id: "precise",
    routeId: "openai/gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    personaName: "هوش مصنوعی دقیق",
    poweredBy: "GPT-5.4 Mini",
    brand: "openai",
    color: "#10A37F",
    tier: "premium",
    estCostPer1kTokens: 0.01,
    blurb: "پاسخ دقیق و ساختارمند",
    capabilities: { vision: true },
    kind: "direct",
  },
  {
    id: "critic",
    routeId: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    personaName: "هوش مصنوعی منتقد",
    poweredBy: "Claude Haiku 4.5",
    brand: "claude",
    color: "#D97757",
    tier: "premium",
    estCostPer1kTokens: 0.012,
    blurb: "نقد منطقی و استدلال عمیق",
    kind: "direct",
  },
  {
    id: "creative",
    routeId: "google/gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    personaName: "هوش مصنوعی خلاق",
    poweredBy: "Gemini 3.5 Flash Lite",
    brand: "gemini",
    color: "#4285F4",
    tier: "mid",
    estCostPer1kTokens: 0.01,
    blurb: "ایده و متن خلاقانه",
    capabilities: { vision: true },
    kind: "direct",
  },
  {
    id: "fast",
    routeId: "openai/gpt-4o-mini",
    name: "GPT-4o mini",
    personaName: "هوش مصنوعی سریع",
    poweredBy: "GPT-4o mini",
    brand: "openai",
    color: "#10A37F",
    tier: "mid",
    estCostPer1kTokens: 0.0006,
    blurb: "پاسخ فوری و روان",
    capabilities: { vision: true },
    kind: "direct",
  },
  {
    id: "economy",
    routeId: "deepseek/deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    personaName: "حالت بهینه",
    poweredBy: "DeepSeek V4 Flash",
    brand: "deepseek",
    color: "#4D6BFE",
    tier: "economy",
    estCostPer1kTokens: 0.001,
    blurb: "شروع کم‌هزینه",
    kind: "direct",
  },
];

/** مسیرهای داخلی انتخاب خودکار / عمیق — در picker شخصیت‌ها نشان داده نمی‌شوند */
export const AUTO_ROUTE_MODELS: AIModelInfo[] = [
  {
    id: "smart",
    routeId: "deepseek/deepseek-v4-pro",
    name: "DeepSeek V4",
    poweredBy: "DeepSeek V4",
    brand: "deepseek",
    color: "#4D6BFE",
    tier: "economy",
    estCostPer1kTokens: 0.003,
    blurb: "انتخاب هوشمند پیش‌فرض",
    kind: "direct",
  },
  {
    id: "deep",
    routeId: "openai/gpt-5.4",
    name: "GPT-5.4",
    poweredBy: "GPT-5.4",
    brand: "openai",
    color: "#10A37F",
    tier: "premium",
    estCostPer1kTokens: 0.02,
    blurb: "استدلال عمیق‌تر",
    capabilities: { vision: true },
    kind: "direct",
  },
];

/** مقایسه دو مدل + pool نبرد — نام موتور، بدون شخصیت */
export const COMPARE_MODELS: AIModelInfo[] = [
  // ⭐ پرچمدار
  {
    id: "cmp-gpt-55",
    routeId: "openai/gpt-5.6-sol",
    name: "GPT-5.6",
    poweredBy: "OpenAI",
    brand: "openai",
    color: "#10A37F",
    tier: "premium",
    estCostPer1kTokens: 0.02,
    blurb: "پرچمدار OpenAI برای استدلال و کدنویسی",
    capabilities: { vision: true },
    kind: "compare",
  },
  {
    id: "cmp-claude-opus",
    routeId: "anthropic/claude-sonnet-5",
    name: "Claude Sonnet 5",
    poweredBy: "Anthropic",
    brand: "claude",
    color: "#D97757",
    tier: "premium",
    estCostPer1kTokens: 0.015,
    blurb: "استدلال عمیق و کدنویسی دقیق",
    kind: "compare",
  },
  {
    id: "cmp-gemini-pro",
    routeId: "google/gemini-2.5-pro",
    name: "Gemini Pro",
    poweredBy: "Google",
    brand: "gemini",
    color: "#4285F4",
    tier: "premium",
    estCostPer1kTokens: 0.012,
    blurb: "آخرین نسخه پایدار Gemini Pro",
    capabilities: { vision: true },
    kind: "compare",
  },
  // ⚖️ متوسط
  {
    id: "cmp-gemini-flash",
    routeId: "google/gemini-3.5-flash",
    name: "Gemini Flash",
    poweredBy: "Google",
    brand: "gemini",
    color: "#4285F4",
    tier: "mid",
    estCostPer1kTokens: 0.004,
    blurb: "سریع و چندرسانه‌ای",
    capabilities: { vision: true },
    kind: "compare",
  },
  {
    id: "cmp-deepseek-v4",
    routeId: "deepseek/deepseek-v4-pro",
    name: "DeepSeek V4",
    poweredBy: "DeepSeek",
    brand: "deepseek",
    color: "#4D6BFE",
    tier: "mid",
    estCostPer1kTokens: 0.003,
    blurb: "قوی در استدلال و کدنویسی",
    kind: "compare",
  },
  {
    id: "cmp-grok-4",
    routeId: "x-ai/grok-4.5",
    name: "Grok 4.5",
    poweredBy: "xAI",
    brand: "grok",
    color: "#1A1A1A",
    tier: "mid",
    estCostPer1kTokens: 0.006,
    blurb: "سریع، به‌روز و قوی در مهندسی",
    kind: "compare",
  },
  // 💰 اقتصادی
  {
    id: "cmp-gpt-4o-mini",
    routeId: "openai/gpt-5.6-luna",
    name: "GPT-5.6 Mini / Luna",
    poweredBy: "OpenAI",
    brand: "openai",
    color: "#10A37F",
    tier: "economy",
    estCostPer1kTokens: 0.001,
    blurb: "نسخه سبک GPT-5.6 برای کار روزمره",
    capabilities: { vision: true },
    kind: "compare",
  },
  {
    id: "cmp-qwen-37",
    routeId: "qwen/qwen3.7-max",
    name: "Qwen 3.7",
    poweredBy: "Alibaba",
    brand: "qwen",
    color: "#6A5ACD",
    tier: "economy",
    estCostPer1kTokens: 0.0012,
    blurb: "اقتصادی و مناسب متن و کد",
    kind: "compare",
  },
  {
    id: "cmp-deepseek-lite",
    routeId: "deepseek/deepseek-v4-flash",
    name: "DeepSeek Lite",
    poweredBy: "DeepSeek",
    brand: "deepseek",
    color: "#4D6BFE",
    tier: "economy",
    estCostPer1kTokens: 0.0005,
    blurb: "سبک‌ترین DeepSeek برای شروع",
    kind: "compare",
  },
];

export const IMAGE_MODELS: AIModelInfo[] = [
  {
    id: "image-lite",
    routeId: "google/gemini-3.1-flash-lite-image",
    name: "Gemini 3.1 Flash Lite Image",
    poweredBy: "Gemini 3.1 Flash Lite",
    brand: "gemini",
    color: "#4285F4",
    tier: "economy",
    estCostPer1kTokens: 0.001,
    blurb: "سریع و کم‌هزینه برای ایده‌های اولیه",
    capabilities: { imageGen: true },
    kind: "image",
    imageCreditCost: 10,
    imageApi: "images",
  },
  {
    id: "image-nano",
    routeId: "google/gemini-3.1-flash-image",
    name: "Gemini 3.1 Flash Image",
    poweredBy: "Gemini 3.1 Flash Image",
    brand: "gemini",
    color: "#4285F4",
    tier: "mid",
    estCostPer1kTokens: 0.002,
    blurb: "سبک‌های هنری و ایده‌پردازی بصری",
    capabilities: { imageGen: true },
    kind: "image",
    imageCreditCost: 22,
    imageApi: "images",
  },
  {
    id: "image-gpt",
    routeId: "openai/gpt-image-2",
    name: "GPT Image 2",
    poweredBy: "GPT Image 2",
    brand: "openai",
    color: "#10A37F",
    tier: "premium",
    estCostPer1kTokens: 0.004,
    blurb: "جزئیات بالا و متن روی تصویر",
    capabilities: { imageGen: true },
    kind: "image",
    imageCreditCost: 40,
    imageApi: "images",
  },
];

/** ترتیب fallback وقتی ساخت تصویر با مدل انتخاب‌شده ناموفق باشد */
export const IMAGE_MODEL_FALLBACK_CHAIN: string[] = ["image-lite", "image-nano", "image-gpt"];

export function imageModelFallbackChain(primary: string): string[] {
  const idx = IMAGE_MODEL_FALLBACK_CHAIN.indexOf(primary);
  if (idx === -1) return [primary];
  return IMAGE_MODEL_FALLBACK_CHAIN.slice(idx);
}

/** ترتیب fallback وقتی ساخت ویدیو با مدل انتخاب‌شده ناموفق باشد */
export const VIDEO_MODEL_FALLBACK_CHAIN: string[] = [
  "video-seedance",
  "video-kling",
  "video-sora",
  "video-veo",
];

export function videoModelFallbackChain(primary: string): string[] {
  const idx = VIDEO_MODEL_FALLBACK_CHAIN.indexOf(primary);
  if (idx === -1) return [primary];
  return VIDEO_MODEL_FALLBACK_CHAIN.slice(idx);
}

export const VIDEO_MODELS: AIModelInfo[] = [
  {
    id: "video-seedance",
    routeId: "bytedance/seedance-1-5-pro",
    name: "ویدیو سبک",
    poweredBy: "Seedance 1.5 Pro",
    brand: "bytedance",
    color: "#00C2FF",
    tier: "economy",
    estCostPer1kTokens: 0.023,
    blurb: "ویدیو و صوت همزمان — اقتصادی",
    capabilities: { videoGen: true },
    kind: "video",
    videoDurations: [4, 5, 8, 10, 12],
    videoCreditCost: 60,
  },
  {
    id: "video-kling",
    routeId: "kwaivgi/kling-v3.0-pro",
    name: "ویدیو سینمایی",
    poweredBy: "Kling v3.0 Pro",
    brand: "kwaivgi",
    color: "#FF6B35",
    tier: "mid",
    estCostPer1kTokens: 0.112,
    blurb: "کیفیت بالا با کنترل فریم",
    capabilities: { videoGen: true },
    kind: "video",
    videoDurations: [3, 5, 8, 10, 15],
    videoCreditCost: 150,
  },
  {
    id: "video-sora",
    routeId: "openai/sora-2-pro",
    name: "ویدیو Sora",
    poweredBy: "Sora 2 Pro",
    brand: "openai",
    color: "#10A37F",
    tier: "premium",
    estCostPer1kTokens: 0.3,
    blurb: "ویدیوی حرفه‌ای با فیزیک دقیق",
    capabilities: { videoGen: true },
    kind: "video",
    videoDurations: [4, 5, 8],
    videoCreditCost: 375,
  },
  {
    id: "video-veo",
    routeId: "google/veo-3.1",
    name: "ویدیو Veo",
    poweredBy: "Veo 3.1",
    brand: "google",
    color: "#4285F4",
    tier: "premium",
    estCostPer1kTokens: 0.4,
    blurb: "حداکثر کیفیت بصری ۱۰۸۰p",
    capabilities: { videoGen: true },
    kind: "video",
    videoDurations: [4, 6, 8],
    videoCreditCost: 400,
  },
];

export const AUDIO_MODELS: AIModelInfo[] = [
  {
    id: "audio-mini",
    routeId: "openai/gpt-audio-mini",
    name: "صدا سبک",
    poweredBy: "GPT Audio Mini",
    brand: "openai",
    color: "#10A37F",
    tier: "economy",
    estCostPer1kTokens: 0.0024,
    blurb: "تبدیل متن به گفتار — کم‌هزینه",
    capabilities: { audioGen: true },
    kind: "audio",
    audioCreditCost: 2,
  },
  {
    id: "audio-pro",
    routeId: "openai/gpt-audio",
    name: "صدا حرفه‌ای",
    poweredBy: "GPT Audio",
    brand: "openai",
    color: "#10A37F",
    tier: "premium",
    estCostPer1kTokens: 0.01,
    blurb: "صدای طبیعی و یکدست",
    capabilities: { audioGen: true },
    kind: "audio",
    audioCreditCost: 5,
  },
];

export const MUSIC_MODELS: AIModelInfo[] = [
  {
    id: "music-lyria",
    routeId: "google/lyria-3-pro-preview",
    name: "Lyria 3 Pro",
    poweredBy: "Google Lyria 3",
    brand: "google",
    color: "#4285F4",
    tier: "premium",
    estCostPer1kTokens: 0,
    blurb: "ساخت آهنگ کامل با وکال و تنظیم از توضیح فارسی",
    capabilities: { musicGen: true },
    kind: "music",
    musicCreditCost: 40,
  },
];

export const TRANSCRIBE_MODELS: AIModelInfo[] = [
  {
    id: "transcribe-4o",
    routeId: "openai/gpt-4o-transcribe",
    name: "رونویسی ۴o",
    poweredBy: "GPT-4o Transcribe",
    brand: "openai",
    color: "#10A37F",
    tier: "mid",
    estCostPer1kTokens: 0.006,
    blurb: "رونویسی دقیق گفتار به متن",
    capabilities: { transcribe: true },
    kind: "transcribe",
    transcribeCreditPerMinute: 2,
  },
];

/** @deprecated — pool مقایسه/نبرد */
export const MODELS: AIModelInfo[] = COMPARE_MODELS;

const ALL_MODELS: AIModelInfo[] = [
  ...DIRECT_MODELS,
  ...AUTO_ROUTE_MODELS,
  ...COMPARE_MODELS,
  ...IMAGE_MODELS,
  ...VIDEO_MODELS,
  ...AUDIO_MODELS,
  ...MUSIC_MODELS,
  ...TRANSCRIBE_MODELS,
];

const LEGACY_ROUTE_ALIASES: Record<string, string> = {
  "openai/gpt-4o-mini": "cmp-gpt-4o-mini",
  "openai/gpt-5.6-luna": "cmp-gpt-4o-mini",
  "openai/gpt-5.6-sol": "cmp-gpt-55",
  "openai/gpt-4o": "cmp-gpt-55",
  "openai/gpt-5.4-mini": "precise",
  "openai/gpt-5.4": "deep",
  "google/gemini-2.5-flash-lite": "cmp-gemini-flash",
  "google/gemini-3.5-flash": "cmp-gemini-flash",
  "google/gemini-3.5-flash-lite": "creative",
  "meta-llama/llama-3.3-70b-instruct": "cmp-deepseek-lite",
  "meta-llama/llama-4-maverick": "cmp-deepseek-lite",
  "openai/gpt-4.1-mini": "cmp-grok-4",
  "deepseek/deepseek-chat-v3.1": "cmp-deepseek-v4",
  "deepseek/deepseek-v4-pro": "smart",
  "deepseek/deepseek-v4-flash": "economy",
  "mistralai/mistral-medium-3": "cmp-qwen-37",
  "anthropic/claude-haiku-4.5": "critic",
  "x-ai/grok-4.3": "cmp-grok-4",
  "x-ai/grok-4.5": "cmp-grok-4",
  "google/gemini-2.5-pro": "cmp-gemini-pro",
  "google/gemini-pro-latest": "cmp-gemini-pro",
  "anthropic/claude-sonnet-4": "cmp-claude-opus",
  "anthropic/claude-sonnet-5": "cmp-claude-opus",
  "qwen/qwen3.7-max": "cmp-qwen-37",
  "cmp-llama-70b": "cmp-deepseek-lite",
  "cmp-mistral-medium": "cmp-qwen-37",
  "cmp-claude-haiku": "cmp-gpt-4o-mini",
  "google/gemini-2.5-flash-image-preview": "image-nano",
  "google/gemini-2.5-flash-image": "image-nano",
  "google/gemini-3.1-flash-image": "image-nano",
  "google/gemini-3.1-flash-lite-image": "image-lite",
  "black-forest-labs/flux-1.1-pro": "image-gpt",
  "black-forest-labs/flux.2-pro": "image-gpt",
  "openai/gpt-image-2": "image-gpt",
  "image-gemini": "image-nano",
  "music-suno": "music-lyria",
  "suno/v1": "music-lyria",
  precise: "precise",
  critic: "critic",
  creative: "creative",
  fast: "fast",
  economy: "economy",
  smart: "smart",
  deep: "deep",
};

const MODEL_MAP: Record<string, AIModelInfo> = {};
for (const m of ALL_MODELS) {
  MODEL_MAP[m.id] = m;
  MODEL_MAP[m.routeId] = m;
}
for (const [legacyRoute, id] of Object.entries(LEGACY_ROUTE_ALIASES)) {
  const target = MODEL_MAP[id];
  if (target) MODEL_MAP[legacyRoute] = target;
}

export function getModel(id: string): AIModelInfo | undefined {
  if (!id) return undefined;
  return MODEL_MAP[id] ?? MODEL_MAP[LEGACY_ROUTE_ALIASES[id]];
}

export function modelRouteId(id: string): string {
  return getModel(id)?.routeId ?? id;
}

/** نام موتور — مقایسه، battle بعد از رأی، لیدربورد */
export function modelName(id: string): string {
  return getModel(id)?.name ?? id;
}

/** شخصیت فارسی — فقط UI گفتگوی مستقیم */
export function modelPersonaName(id: string): string {
  const m = getModel(id);
  if (!m) return id;
  return m.personaName ?? m.name;
}

export function modelPoweredBy(id: string): string {
  return getModel(id)?.poweredBy ?? "";
}

export function directModels(): AIModelInfo[] {
  return DIRECT_MODELS;
}

/** @deprecated */
export function chatModels(): AIModelInfo[] {
  return DIRECT_MODELS;
}

/** Pool مجاز برای حالت همفکری (Council) — زیرمجموعهٔ compare */
export const COUNCIL_MODEL_IDS = [
  "cmp-deepseek-v4",
  "cmp-grok-4",
  "cmp-gemini-flash",
  "cmp-gpt-55",
] as const;

const COUNCIL_MODEL_ID_SET = new Set<string>(COUNCIL_MODEL_IDS);

export function councilModels(): AIModelInfo[] {
  return COMPARE_MODELS.filter((m) => COUNCIL_MODEL_ID_SET.has(m.id));
}

export function compareModels(): AIModelInfo[] {
  return COMPARE_MODELS;
}

export function compareModelsByTier(...tiers: ModelTier[]): AIModelInfo[] {
  return COMPARE_MODELS.filter((m) => tiers.includes(m.tier));
}

export function modelsByTier(...tiers: ModelTier[]): AIModelInfo[] {
  return compareModelsByTier(...tiers);
}

export function modelsWithVision(): AIModelInfo[] {
  return DIRECT_MODELS.filter((m) => m.capabilities?.vision);
}

export function imageModels(): AIModelInfo[] {
  return IMAGE_MODELS;
}

export function modelsWithImageGen(): AIModelInfo[] {
  return IMAGE_MODELS;
}

export function hasVision(id: string): boolean {
  return !!getModel(id)?.capabilities?.vision;
}

export function hasImageGen(id: string): boolean {
  return !!getModel(id)?.capabilities?.imageGen;
}

export function videoModels(): AIModelInfo[] {
  return VIDEO_MODELS;
}

export function audioModels(): AIModelInfo[] {
  return AUDIO_MODELS;
}

export function transcribeModels(): AIModelInfo[] {
  return TRANSCRIBE_MODELS;
}

export function hasVideoGen(id: string): boolean {
  return !!getModel(id)?.capabilities?.videoGen;
}

export function hasAudioGen(id: string): boolean {
  return !!getModel(id)?.capabilities?.audioGen;
}

export function hasTranscribe(id: string): boolean {
  return !!getModel(id)?.capabilities?.transcribe;
}

export function musicModels(): AIModelInfo[] {
  return MUSIC_MODELS;
}

export function hasMusicGen(id: string): boolean {
  return !!getModel(id)?.capabilities?.musicGen;
}
