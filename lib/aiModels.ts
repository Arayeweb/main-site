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
  | "google";

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
  "Powered by GPT-4o, Claude Sonnet, Gemini, Grok, DeepSeek";

export const IMAGE_POWERED_BY_TAGLINE =
  "Powered by Gemini 3.1 Image, GPT Image 2";

export const VIDEO_POWERED_BY_TAGLINE =
  "Powered by Seedance, Kling, Sora, Veo";

export const AUDIO_POWERED_BY_TAGLINE =
  "Powered by GPT Audio, GPT-4o Transcribe";

export const MUSIC_POWERED_BY_TAGLINE = "Powered by Suno";

/** گفتگوی مستقیم — فقط ۵ شخصیت */
export const DIRECT_MODELS: AIModelInfo[] = [
  {
    id: "precise",
    routeId: "openai/gpt-4o",
    name: "GPT-4o",
    personaName: "هوش مصنوعی دقیق",
    poweredBy: "GPT-4o",
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
    routeId: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    personaName: "هوش مصنوعی منتقد",
    poweredBy: "Claude Sonnet 4",
    brand: "claude",
    color: "#D97757",
    tier: "premium",
    estCostPer1kTokens: 0.012,
    blurb: "نقد منطقی و استدلال عمیق",
    kind: "direct",
  },
  {
    id: "creative",
    routeId: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    personaName: "هوش مصنوعی خلاق",
    poweredBy: "Gemini 2.5 Pro",
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
    routeId: "deepseek/deepseek-chat-v3.1",
    name: "DeepSeek Chat V3.1",
    personaName: "حالت بهینه",
    poweredBy: "DeepSeek Chat V3.1",
    brand: "deepseek",
    color: "#4D6BFE",
    tier: "economy",
    estCostPer1kTokens: 0.001,
    blurb: "شروع کم‌هزینه",
    kind: "direct",
  },
];

/** مقایسه دو مدل + pool نبرد — نام موتور، بدون شخصیت */
export const COMPARE_MODELS: AIModelInfo[] = [
  {
    id: "cmp-gpt-55",
    routeId: "openai/gpt-4o",
    name: "GPT-4o",
    poweredBy: "OpenAI",
    brand: "openai",
    color: "#10A37F",
    tier: "premium",
    estCostPer1kTokens: 0.01,
    blurb: "قدرتمند و چندمنظوره",
    capabilities: { vision: true },
    kind: "compare",
  },
  {
    id: "cmp-claude-opus",
    routeId: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    poweredBy: "Anthropic",
    brand: "claude",
    color: "#D97757",
    tier: "premium",
    estCostPer1kTokens: 0.012,
    blurb: "استدلال عمیق",
    kind: "compare",
  },
  {
    id: "cmp-gemini-pro",
    routeId: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    poweredBy: "Google",
    brand: "gemini",
    color: "#4285F4",
    tier: "premium",
    estCostPer1kTokens: 0.01,
    blurb: "استدلال قوی",
    capabilities: { vision: true },
    kind: "compare",
  },
  {
    id: "cmp-grok-4",
    routeId: "x-ai/grok-4.3",
    name: "Grok 4",
    poweredBy: "xAI",
    brand: "grok",
    color: "#1A1A1A",
    tier: "mid",
    estCostPer1kTokens: 0.008,
    blurb: "سریع و به‌روز",
    kind: "compare",
  },
  {
    id: "cmp-deepseek-v4",
    routeId: "deepseek/deepseek-chat-v3.1",
    name: "DeepSeek Chat V3.1",
    poweredBy: "DeepSeek",
    brand: "deepseek",
    color: "#4D6BFE",
    tier: "economy",
    estCostPer1kTokens: 0.001,
    blurb: "اقتصادی و دقیق",
    kind: "compare",
  },
  {
    id: "cmp-gpt-4o-mini",
    routeId: "openai/gpt-4o-mini",
    name: "GPT-4o mini",
    poweredBy: "OpenAI",
    brand: "openai",
    color: "#10A37F",
    tier: "economy",
    estCostPer1kTokens: 0.0006,
    blurb: "سریع و همه‌کاره",
    capabilities: { vision: true },
    kind: "compare",
  },
  {
    id: "cmp-gemini-flash",
    routeId: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash",
    poweredBy: "Google",
    brand: "gemini",
    color: "#4285F4",
    tier: "economy",
    estCostPer1kTokens: 0.0004,
    blurb: "سبک و روان",
    capabilities: { vision: true },
    kind: "compare",
  },
  {
    id: "cmp-llama-70b",
    routeId: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    poweredBy: "Meta",
    brand: "llama",
    color: "#0668E1",
    tier: "economy",
    estCostPer1kTokens: 0.0004,
    blurb: "متن‌باز و قوی",
    kind: "compare",
  },
  {
    id: "cmp-mistral-medium",
    routeId: "mistralai/mistral-medium-3",
    name: "Mistral Medium 3",
    poweredBy: "Mistral",
    brand: "mistral",
    color: "#FA5111",
    tier: "mid",
    estCostPer1kTokens: 0.002,
    blurb: "متعادل",
    kind: "compare",
  },
  {
    id: "cmp-claude-haiku",
    routeId: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    poweredBy: "Anthropic",
    brand: "claude",
    color: "#D97757",
    tier: "mid",
    estCostPer1kTokens: 0.005,
    blurb: "دقیق و منظم",
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
    id: "music-suno",
    routeId: "suno/v1",
    name: "موزیک Suno",
    poweredBy: "Suno",
    brand: "openai",
    color: "#6366f1",
    tier: "mid",
    estCostPer1kTokens: 0,
    blurb: "ساخت موزیک از توضیح فارسی — شبیه Hoosha",
    capabilities: { musicGen: true },
    kind: "music",
    musicCreditCost: 8,
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
  ...COMPARE_MODELS,
  ...IMAGE_MODELS,
  ...VIDEO_MODELS,
  ...AUDIO_MODELS,
  ...MUSIC_MODELS,
  ...TRANSCRIBE_MODELS,
];

const LEGACY_ROUTE_ALIASES: Record<string, string> = {
  "openai/gpt-4o-mini": "cmp-gpt-4o-mini",
  "google/gemini-2.5-flash-lite": "cmp-gemini-flash",
  "meta-llama/llama-3.3-70b-instruct": "cmp-llama-70b",
  "openai/gpt-4.1-mini": "cmp-grok-4",
  "deepseek/deepseek-chat-v3.1": "cmp-deepseek-v4",
  "mistralai/mistral-medium-3": "cmp-mistral-medium",
  "anthropic/claude-haiku-4.5": "cmp-claude-haiku",
  "openai/gpt-4o": "cmp-gpt-55",
  "x-ai/grok-4.3": "cmp-grok-4",
  "google/gemini-2.5-pro": "cmp-gemini-pro",
  "anthropic/claude-sonnet-4": "cmp-claude-opus",
  "google/gemini-2.5-flash-image-preview": "image-nano",
  "google/gemini-2.5-flash-image": "image-nano",
  "google/gemini-3.1-flash-image": "image-nano",
  "google/gemini-3.1-flash-lite-image": "image-lite",
  "black-forest-labs/flux-1.1-pro": "image-gpt",
  "black-forest-labs/flux.2-pro": "image-gpt",
  "openai/gpt-image-2": "image-gpt",
  "image-gemini": "image-nano",
  precise: "precise",
  critic: "critic",
  creative: "creative",
  fast: "fast",
  economy: "economy",
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
  "cmp-claude-haiku",
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
