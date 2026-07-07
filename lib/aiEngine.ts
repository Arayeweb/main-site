// =========================================================
// موتور AI — پوشش OpenRouter برای Battle Mode + multimodal
// =========================================================

import { Agent } from "undici";
import { getModel, modelRouteId } from "./aiModels";

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
};

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_IMAGES_API = "https://openrouter.ai/api/v1/images";
const OPENROUTER_VIDEOS_API = "https://openrouter.ai/api/v1/videos";
const OPENROUTER_SPEECH_API = "https://openrouter.ai/api/v1/audio/speech";
const OPENROUTER_TRANSCRIBE_API = "https://openrouter.ai/api/v1/audio/transcriptions";

const BATTLE_SYSTEM =
  "تو یک دستیار هوشمند فارسی‌زبان هستی. پاسخ را با مارک‌داون ساختارمند بده: پاراگراف‌های کوتاه، عنوان‌های ## برای بخش‌ها، جدول markdown برای مقایسه‌ها، و لیست bullet برای جمع‌بندی. اگر مطمئن نیستی صادقانه بگو.";

const WEB_SEARCH_SYSTEM =
  "کاربر جستجوی وب را فعال کرده است. برای پاسخ، حتماً از ابزار جستجوی وب استفاده کن تا اطلاعات به‌روز بگیری و منابع را در پاسخ ذکر کن.";

type AICallOpts = {
  model: string;
  max_tokens?: number;
  modalities?: string[];
  webSearch?: boolean;
};

function systemContent(webSearch?: boolean, personaSystem?: string): string {
  const base = personaSystem
    ? `${personaSystem}\n\n${BATTLE_SYSTEM}`
    : BATTLE_SYSTEM;
  return webSearch ? `${base}\n\n${WEB_SEARCH_SYSTEM}` : base;
}

function openRouterExtras(webSearch?: boolean): Record<string, unknown> {
  if (!webSearch) return {};
  // Plugin runs one guaranteed Exa search per request when user enables web mode.
  return {
    plugins: [{ id: "web", engine: "exa", max_results: 5 }],
  };
}

export interface AICallResult {
  content: string;
  tokensUsed: number;
  costUsd: number;
}

export interface ImageGenResult {
  imageUrl?: string;
  imageBase64?: string;
  mime?: string;
  caption?: string;
  tokensUsed: number;
  costUsd: number;
}

function openRouterHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com",
    "X-Title": "Araaye Arena",
  };
}

const TRANSIENT_NETWORK_CODES = new Set([
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_SOCKET",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
]);

function isTransientFetchError(err: unknown): boolean {
  const code = (err as { cause?: { code?: string } })?.cause?.code;
  if (code && TRANSIENT_NETWORK_CODES.has(code)) return true;
  return err instanceof Error && err.message === "fetch failed";
}

/** برای routeها — تفکیک timeout شبکه از خطای مدل */
export function classifyOpenRouterFetchError(err: unknown): "network_error" | "ai_error" {
  return isTransientFetchError(err) ? "network_error" : "ai_error";
}

let openRouterDispatcher: Agent | undefined;

function getOpenRouterDispatcher(): Agent {
  if (!openRouterDispatcher) {
    const connectMs = Number(process.env.OPENROUTER_CONNECT_TIMEOUT_MS || 30_000);
    const headersMs = Number(process.env.OPENROUTER_HEADERS_TIMEOUT_MS || 90_000);
    openRouterDispatcher = new Agent({
      connect: { timeout: connectMs },
      headersTimeout: headersMs,
      bodyTimeout: 0,
    });
  }
  return openRouterDispatcher;
}

async function fetchOpenRouterWithRetry(
  url: string,
  init: RequestInit,
  logContext: string,
  maxAttempts = 3
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        dispatcher: getOpenRouterDispatcher(),
      } as RequestInit & { dispatcher: Agent });
      return res;
    } catch (err) {
      lastErr = err;
      const transient = isTransientFetchError(err);
      console.warn(
        `[openrouter/${logContext}] attempt ${attempt}/${maxAttempts} failed:`,
        err instanceof Error ? err.message : err
      );
      if (!transient || attempt >= maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  throw lastErr;
}

export function buildUserContent(
  text: string,
  imageUrls: string[] = []
): string | ContentPart[] {
  if (imageUrls.length === 0) return text;
  const parts: ContentPart[] = [{ type: "text", text }];
  for (const url of imageUrls) {
    parts.push({ type: "image_url", image_url: { url } });
  }
  return parts;
}

export async function callAI(
  messages: AIMessage[],
  opts: AICallOpts
): Promise<AICallResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY تنظیم نشده.");

  const tools = openRouterExtras(opts.webSearch);
  const body: Record<string, unknown> = {
    model: modelRouteId(opts.model),
    messages,
    max_tokens: opts.max_tokens ?? 1000,
    usage: { include: true },
    ...tools,
  };
  if (opts.modalities?.length) body.modalities = opts.modalities;

  const res = await fetchOpenRouterWithRetry(
    OPENROUTER_API,
    {
      method: "POST",
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify(body),
    },
    "callAI"
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string | ContentPart[] } }>;
    usage?: { total_tokens?: number; cost?: number };
  };

  const raw = data.choices[0]?.message?.content;
  const content =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? raw
            .filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join("")
        : "";

  return {
    content,
    tokensUsed: data.usage?.total_tokens ?? 0,
    costUsd: data.usage?.cost ?? 0,
  };
}

export async function runDirect(
  prompt: string,
  model: string,
  maxTokens: number,
  history: AIMessage[] = [],
  imageUrls: string[] = [],
  webSearch = false
): Promise<AICallResult> {
  return callAI(
    [
      { role: "system", content: systemContent(webSearch) },
      ...history,
      { role: "user", content: buildUserContent(prompt, imageUrls) },
    ],
    { model, max_tokens: maxTokens, webSearch }
  );
}

export async function streamDirect(
  prompt: string,
  model: string,
  maxTokens: number,
  history: AIMessage[],
  onDelta: (text: string) => void,
  imageUrls: string[] = [],
  webSearch = false,
  personaSystem?: string
): Promise<AICallResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY تنظیم نشده.");

  const messages: AIMessage[] = [
    { role: "system", content: systemContent(webSearch, personaSystem) },
    ...history,
    { role: "user", content: buildUserContent(prompt, imageUrls) },
  ];

  const extras = openRouterExtras(webSearch);
  const body: Record<string, unknown> = {
    model: modelRouteId(model),
    messages,
    max_tokens: maxTokens,
    stream: true,
    usage: { include: true },
    ...extras,
  };

  const res = await fetchOpenRouterWithRetry(
    OPENROUTER_API,
    {
      method: "POST",
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify(body),
    },
    "streamDirect"
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("stream_unavailable");

  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let tokensUsed = 0;
  let costUsd = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const json = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
          usage?: { total_tokens?: number; cost?: number };
        };
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          content += delta;
          onDelta(delta);
        }
        if (json.usage?.total_tokens != null) tokensUsed = json.usage.total_tokens;
        if (json.usage?.cost != null) costUsd = json.usage.cost;
      } catch {
        /* chunk ناقص */
      }
    }
  }

  return { content, tokensUsed, costUsd };
}

export interface BattleResult {
  responseA: string;
  responseB: string;
  tokensUsed: number;
  costUsd: number;
}

export async function streamBattle(
  prompt: string,
  models: [string, string],
  maxTokens: number,
  onDelta: (side: "a" | "b", text: string) => void,
  webSearch = false
): Promise<BattleResult> {
  const system = systemContent(webSearch);

  const streamSide = async (side: "a" | "b", model: string) => {
    const messages: AIMessage[] = [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ];
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY تنظیم نشده.");

    const extras = openRouterExtras(webSearch);
    const body: Record<string, unknown> = {
      model: modelRouteId(model),
      messages,
      max_tokens: maxTokens,
      stream: true,
      usage: { include: true },
      ...extras,
    };

    const res = await fetchOpenRouterWithRetry(
      OPENROUTER_API,
      {
        method: "POST",
        headers: openRouterHeaders(apiKey),
        body: JSON.stringify(body),
      },
      "streamBattle"
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${err}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("stream_unavailable");

    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    let tokensUsed = 0;
    let costUsd = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string } }>;
            usage?: { total_tokens?: number; cost?: number };
          };
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            content += delta;
            onDelta(side, delta);
          }
          if (json.usage?.total_tokens != null) tokensUsed = json.usage.total_tokens;
          if (json.usage?.cost != null) costUsd = json.usage.cost;
        } catch {
          /* partial chunk */
        }
      }
    }

    return { content, tokensUsed, costUsd };
  };

  const [a, b] = await Promise.allSettled([
    streamSide("a", models[0]),
    streamSide("b", models[1]),
  ]);

  const pick = (r: PromiseSettledResult<{ content: string; tokensUsed: number; costUsd: number }>) =>
    r.status === "fulfilled"
      ? r.value
      : { content: "خطا در دریافت پاسخ.", tokensUsed: 0, costUsd: 0 };

  const ra = pick(a);
  const rb = pick(b);

  return {
    responseA: ra.content,
    responseB: rb.content,
    tokensUsed: ra.tokensUsed + rb.tokensUsed,
    costUsd: ra.costUsd + rb.costUsd,
  };
}

export async function runBattle(
  prompt: string,
  models: [string, string],
  maxTokens: number,
  webSearch = false
): Promise<BattleResult> {
  const messages: AIMessage[] = [
    { role: "system", content: systemContent(webSearch) },
    { role: "user", content: prompt },
  ];

  const [a, b] = await Promise.allSettled([
    callAI(messages, { model: models[0], max_tokens: maxTokens, webSearch }),
    callAI(messages, { model: models[1], max_tokens: maxTokens, webSearch }),
  ]);

  if (a.status === "rejected" && b.status === "rejected") {
    console.error("[aiEngine] both models failed:", a.reason, b.reason);
    throw new Error("battle_failed");
  }

  const resA = a.status === "fulfilled" ? a.value : null;
  const resB = b.status === "fulfilled" ? b.value : null;

  if (a.status === "rejected") console.error("[aiEngine] model A failed:", a.reason);
  if (b.status === "rejected") console.error("[aiEngine] model B failed:", b.reason);

  const fallback = "این مدل نتوانست پاسخ بدهد.";
  return {
    responseA: resA?.content || fallback,
    responseB: resB?.content || fallback,
    tokensUsed: (resA?.tokensUsed ?? 0) + (resB?.tokensUsed ?? 0),
    costUsd: (resA?.costUsd ?? 0) + (resB?.costUsd ?? 0),
  };
}

/** Gemini Image: text+image؛ GPT Image و Flux: فقط image */
function imageGenModalities(route: string): string[] {
  if (route.startsWith("google/gemini") && route.includes("image")) {
    return ["image", "text"];
  }
  return ["image"];
}

export type ImageGenOpts = {
  referenceImageUrl?: string;
};

/** ساخت تصویر از متن — non-streaming */
export async function runImageGen(
  prompt: string,
  model: string,
  opts: ImageGenOpts = {}
): Promise<ImageGenResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY تنظیم نشده.");

  const info = getModel(model);
  const route = modelRouteId(model);
  // All studio image models use OpenRouter /api/v1/images (Gemini + GPT Image).
  if (info?.kind === "image" || route.startsWith("openai/gpt-image")) {
    return runImageGenDedicated(prompt, route, apiKey, opts);
  }
  return runImageGenChat(prompt, route, apiKey, opts);
}

async function runImageGenDedicated(
  prompt: string,
  route: string,
  apiKey: string,
  opts: ImageGenOpts = {}
): Promise<ImageGenResult> {
  const body: Record<string, unknown> = {
    model: route,
    prompt,
    output_format: "png",
  };
  if (opts.referenceImageUrl) {
    body.input_references = [
      {
        type: "image_url",
        image_url: { url: opts.referenceImageUrl },
      },
    ];
  }

  const res = await fetchOpenRouterWithRetry(
    OPENROUTER_IMAGES_API,
    {
      method: "POST",
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify(body),
    },
    "runImageGenDedicated"
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    data?: Array<{ b64_json?: string; url?: string; media_type?: string }>;
    usage?: { total_tokens?: number; cost?: number };
  };

  const first = data.data?.[0];

  return {
    imageUrl: first?.url,
    imageBase64: first?.b64_json,
    mime: first?.media_type || "image/png",
    caption: "",
    tokensUsed: data.usage?.total_tokens ?? 0,
    costUsd: data.usage?.cost ?? 0,
  };
}

async function runImageGenChat(
  prompt: string,
  route: string,
  apiKey: string,
  opts: ImageGenOpts = {}
): Promise<ImageGenResult> {
  const modalities = imageGenModalities(route);
  const userContent = opts.referenceImageUrl
    ? [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: opts.referenceImageUrl } },
      ]
    : prompt;

  const res = await fetchOpenRouterWithRetry(
    OPENROUTER_API,
    {
      method: "POST",
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify({
        model: route,
        messages: [{ role: "user", content: userContent }],
        modalities,
        usage: { include: true },
      }),
    },
    "runImageGenChat"
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{
      message?: {
        content?: string | ContentPart[] | Array<{ type: string; text?: string; image_url?: { url: string } }>;
        images?: Array<{ type: string; image_url?: { url: string }; url?: string }>;
      };
    }>;
    usage?: { total_tokens?: number; cost?: number };
  };

  let imageUrl: string | undefined;
  let imageBase64: string | undefined;
  let mime = "image/png";
  let caption = "";

  const msg = data.choices?.[0]?.message;
  const content = msg?.content;

  if (Array.isArray(content)) {
    for (const part of content) {
      if (part.type === "text" && "text" in part && part.text) caption += part.text;
      if (part.type === "image_url" && part.image_url?.url) {
        const u = part.image_url.url;
        if (u.startsWith("data:")) {
          const m = u.match(/^data:([^;]+);base64,(.+)$/);
          if (m) {
            mime = m[1];
            imageBase64 = m[2];
          }
        } else {
          imageUrl = u;
        }
      }
    }
  } else if (typeof content === "string") {
    caption = content;
  }

  if (msg?.images?.length) {
    for (const img of msg.images) {
      const u = img.image_url?.url || img.url;
      if (!u) continue;
      if (u.startsWith("data:")) {
        const m = u.match(/^data:([^;]+);base64,(.+)$/);
        if (m) {
          mime = m[1];
          imageBase64 = m[2];
        }
      } else {
        imageUrl = u;
      }
    }
  }

  return {
    imageUrl,
    imageBase64,
    mime,
    caption: caption.trim(),
    tokensUsed: data.usage?.total_tokens ?? 0,
    costUsd: data.usage?.cost ?? 0,
  };
}

// ---------- Video generation (async) ----------

export type VideoJobSubmitResult = {
  jobId: string;
  pollingUrl: string;
};

export type VideoJobPollResult = {
  status: "pending" | "processing" | "completed" | "failed";
  videoUrls?: string[];
  error?: string;
  costUsd?: number;
  progress?: number;
};

type OpenRouterVideoPollPayload = {
  id?: string;
  status?: string;
  generation_id?: string;
  unsigned_urls?: string[];
  urls?: string[];
  error?: string | { message?: string };
  usage?: { cost?: number };
  progress?: number;
};

export function openRouterVideoContentUrl(jobId: string): string {
  return `https://openrouter.ai/api/v1/videos/${jobId}/content?index=0`;
}

export function openRouterVideoJobIdFromUrl(url: string): string | null {
  const m = url.match(/\/videos\/([^/?#]+)/);
  return m?.[1] ?? null;
}

export async function probeOpenRouterVideoReady(
  jobId: string,
  apiKey: string
): Promise<boolean> {
  const url = openRouterVideoContentUrl(jobId);
  try {
    const res = await fetchOpenRouterWithRetry(
      url,
      {
        method: "GET",
        headers: {
          ...openRouterHeaders(apiKey),
          Range: "bytes=0-0",
        },
      },
      "probeVideoContent"
    );
    return res.ok || res.status === 206;
  } catch {
    return false;
  }
}

export function openRouterVideoPollUrl(
  pollingUrl: string | null | undefined,
  openrouterJobId: string | null | undefined
): string | null {
  if (openrouterJobId) {
    return `https://openrouter.ai/api/v1/videos/${openrouterJobId}`;
  }
  return pollingUrl || null;
}

export function parseOpenRouterVideoPoll(
  data: OpenRouterVideoPollPayload,
  pollingUrl: string
): VideoJobPollResult {
  const rawStatus = (data.status || "pending").toLowerCase();
  let status: VideoJobPollResult["status"] = "pending";
  if (
    rawStatus === "completed" ||
    rawStatus === "succeeded" ||
    rawStatus === "complete"
  ) {
    status = "completed";
  } else if (
    rawStatus === "failed" ||
    rawStatus === "error" ||
    rawStatus === "cancelled" ||
    rawStatus === "canceled" ||
    rawStatus === "expired"
  ) {
    status = "failed";
  } else if (rawStatus === "processing" || rawStatus === "in_progress") {
    status = "processing";
  }

  let videoUrls = data.unsigned_urls ?? data.urls;
  const hasUsage = data.usage?.cost != null;
  const hasGenerationId = Boolean(data.generation_id);

  if (status !== "completed" && status !== "failed") {
    if ((videoUrls?.length ?? 0) > 0 || (hasGenerationId && hasUsage)) {
      status = "completed";
    }
  }

  if (status === "completed" && (!videoUrls || videoUrls.length === 0)) {
    const m = pollingUrl.match(/\/videos\/([^/?#]+)/);
    if (m) {
      videoUrls = [`https://openrouter.ai/api/v1/videos/${m[1]}/content?index=0`];
    }
  }

  const errMsg =
    typeof data.error === "string"
      ? data.error
      : data.error?.message;

  return {
    status,
    videoUrls,
    error: errMsg,
    costUsd: data.usage?.cost,
    progress: data.progress,
  };
}

export type VideoGenOpts = {
  duration?: number;
  aspectRatio?: string;
  resolution?: string;
  generateAudio?: boolean;
  referenceImageUrl?: string;
};

const IMAGE_PROMPT_ENHANCE_SYSTEM = `You improve prompts for AI image generation.
The user writes in Persian. Output ONE English prompt only (no quotes, no explanation).
Rules:
- Keep every subject exactly as the user intended (animal, object, person, place, style).
- If the user says horse (اسب), the output MUST feature a horse — never substitute unrelated subject.
- Add visual detail: composition, lighting, color palette, mood, art style, camera angle.
- Maximum 450 characters.`;

export async function enhanceImagePrompt(prompt: string): Promise<string> {
  const result = await callAI(
    [
      { role: "system", content: IMAGE_PROMPT_ENHANCE_SYSTEM },
      { role: "user", content: prompt.trim() },
    ],
    { model: "fast", max_tokens: 320 }
  );
  return result.content.trim().replace(/^["']|["']$/g, "").slice(0, 2000);
}

const VIDEO_PROMPT_ENHANCE_SYSTEM = `You improve prompts for AI video generation.
The user writes in Persian. Output ONE English prompt only (no quotes, no explanation).
Rules:
- Keep every subject exactly as the user intended (animal, object, person, place).
- If the user says horse (اسب), the output MUST feature a horse — never substitute robot, person, or unrelated subject.
- Add cinematic detail: camera motion, lighting, atmosphere, environment, mood.
- Maximum 450 characters.`;

export async function enhanceVideoPrompt(prompt: string): Promise<string> {
  const result = await callAI(
    [
      { role: "system", content: VIDEO_PROMPT_ENHANCE_SYSTEM },
      { role: "user", content: prompt.trim() },
    ],
    { model: "fast", max_tokens: 320 }
  );
  return result.content.trim().replace(/^["']|["']$/g, "").slice(0, 2000);
}

export async function submitVideoJob(
  prompt: string,
  model: string,
  opts: VideoGenOpts = {}
): Promise<VideoJobSubmitResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY تنظیم نشده.");

  const route = modelRouteId(model);
  const body: Record<string, unknown> = {
    model: route,
    prompt,
    resolution: opts.resolution ?? "720p",
    aspect_ratio: opts.aspectRatio ?? "16:9",
  };
  if (opts.duration != null) body.duration = opts.duration;
  if (opts.generateAudio != null) body.generate_audio = opts.generateAudio;

  if (opts.referenceImageUrl) {
    body.frame_images = [
      {
        type: "image_url",
        image_url: { url: opts.referenceImageUrl },
        frame_type: "first_frame",
      },
    ];
  }

  const res = await fetchOpenRouterWithRetry(
    OPENROUTER_VIDEOS_API,
    {
      method: "POST",
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify(body),
    },
    "submitVideoJob"
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter video ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    id?: string;
    polling_url?: string;
  };

  if (!data.id) {
    throw new Error("video_job_invalid_response");
  }

  const pollingUrl =
    data.polling_url ?? `https://openrouter.ai/api/v1/videos/${data.id}`;

  return { jobId: data.id, pollingUrl };
}

export async function submitVideoJobWithFallback(
  prompt: string,
  modelIds: string[],
  opts: VideoGenOpts = {}
): Promise<VideoJobSubmitResult & { modelId: string }> {
  if (modelIds.length === 0) throw new Error("video_submit_failed");

  const primary = modelIds[0];
  let lastError: Error = new Error("video_submit_failed");

  for (const modelId of modelIds) {
    try {
      const result = await submitVideoJob(prompt, modelId, opts);
      if (modelId !== primary) {
        console.warn(`[submitVideoJobWithFallback] ${primary} → ${modelId} succeeded`);
      }
      return { ...result, modelId };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("video_submit_failed");
      console.warn(`[submitVideoJobWithFallback] model ${modelId} failed:`, lastError.message);
    }
  }

  throw lastError;
}

export async function pollVideoJob(pollingUrl: string): Promise<VideoJobPollResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY تنظیم نشده.");

  const res = await fetchOpenRouterWithRetry(
    pollingUrl,
    { headers: openRouterHeaders(apiKey) },
    "pollVideoJob"
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter video poll ${res.status}: ${err}`);
  }

  const data = (await res.json()) as OpenRouterVideoPollPayload;
  let parsed = parseOpenRouterVideoPoll(data, pollingUrl);

  const jobId = data.id || openRouterVideoJobIdFromUrl(pollingUrl);
  let contentProbe = false;
  if (
    jobId &&
    parsed.status !== "completed" &&
    parsed.status !== "failed"
  ) {
    contentProbe = await probeOpenRouterVideoReady(jobId, apiKey);
    if (contentProbe) {
      parsed = {
        ...parsed,
        status: "completed",
        videoUrls: [openRouterVideoContentUrl(jobId)],
      };
    }
  }

  // #region agent log
  fetch("http://127.0.0.1:7595/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d89e34" },
    body: JSON.stringify({
      sessionId: "d89e34",
      runId: "post-fix",
      hypothesisId: "H13-H15",
      location: "aiEngine.ts:pollVideoJob:parsed",
      message: "pollVideoJob parsed OpenRouter response",
      data: {
        rawStatus: data.status,
        parsedStatus: parsed.status,
        urlCount: parsed.videoUrls?.length ?? 0,
        hasUsage: data.usage?.cost != null,
        hasGenerationId: Boolean(data.generation_id),
        contentProbe,
        jobId,
        responseKeys: Object.keys(data),
        pollUrl: pollingUrl.slice(-40),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return parsed;
}

// ---------- Audio speech (TTS) ----------

export type AudioSpeechResult = {
  audioBuffer: ArrayBuffer;
  mime: string;
  tokensUsed: number;
  costUsd: number;
};

export async function runAudioSpeech(
  text: string,
  model: string,
  voice = "alloy"
): Promise<AudioSpeechResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY تنظیم نشده.");

  const route = modelRouteId(model);

  // GPT Audio models use chat completions with audio output
  if (route.startsWith("openai/gpt-audio")) {
    return runAudioSpeechChat(text, route, apiKey);
  }

  const res = await fetchOpenRouterWithRetry(
    OPENROUTER_SPEECH_API,
    {
      method: "POST",
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify({
        model: route,
        input: text,
        voice,
        response_format: "mp3",
      }),
    },
    "runAudioSpeech"
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter speech ${res.status}: ${err}`);
  }

  const contentType = res.headers.get("content-type") || "audio/mpeg";
  const audioBuffer = await res.arrayBuffer();

  return {
    audioBuffer,
    mime: contentType.split(";")[0] || "audio/mpeg",
    tokensUsed: 0,
    costUsd: 0,
  };
}

async function runAudioSpeechChat(
  text: string,
  route: string,
  apiKey: string
): Promise<AudioSpeechResult> {
  const res = await fetchOpenRouterWithRetry(
    OPENROUTER_API,
    {
      method: "POST",
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify({
        model: route,
        messages: [
          {
            role: "user",
            content: `متن زیر را با صدای طبیعی فارسی بخوان:\n\n${text}`,
          },
        ],
        modalities: ["text", "audio"],
        usage: { include: true },
      }),
    },
    "runAudioSpeechChat"
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter audio chat ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{
      message?: {
        content?: string | ContentPart[];
        audio?: { data?: string; format?: string };
      };
    }>;
    usage?: { total_tokens?: number; cost?: number };
  };

  const msg = data.choices?.[0]?.message;
  let audioBase64: string | undefined;
  let mime = "audio/mpeg";

  if (msg?.audio?.data) {
    audioBase64 = msg.audio.data;
    mime = msg.audio.format === "wav" ? "audio/wav" : "audio/mpeg";
  }

  if (!audioBase64 && Array.isArray(msg?.content)) {
    for (const part of msg.content) {
      const p = part as { type: string; input_audio?: { data?: string; format?: string } };
      if (p.type === "input_audio" || p.type === "audio") {
        if (p.input_audio?.data) {
          audioBase64 = p.input_audio.data;
          mime = p.input_audio.format === "wav" ? "audio/wav" : "audio/mpeg";
        }
      }
    }
  }

  if (!audioBase64) {
    throw new Error("no_audio_output");
  }

  const buffer = Buffer.from(audioBase64, "base64");

  return {
    audioBuffer: buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ),
    mime,
    tokensUsed: data.usage?.total_tokens ?? 0,
    costUsd: data.usage?.cost ?? 0,
  };
}

// ---------- Transcription (STT) ----------

export type TranscribeResult = {
  text: string;
  tokensUsed: number;
  costUsd: number;
};

export async function runTranscribe(
  audioBase64: string,
  format: string,
  model: string,
  language?: string
): Promise<TranscribeResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY تنظیم نشده.");

  const route = modelRouteId(model);
  const body: Record<string, unknown> = {
    model: route,
    input_audio: {
      data: audioBase64,
      format,
    },
    usage: { include: true },
  };
  if (language) body.language = language;

  const res = await fetchOpenRouterWithRetry(
    OPENROUTER_TRANSCRIBE_API,
    {
      method: "POST",
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify(body),
    },
    "runTranscribe"
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter transcribe ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    text?: string;
    usage?: { total_tokens?: number; cost?: number };
  };

  return {
    text: (data.text || "").trim(),
    tokensUsed: data.usage?.total_tokens ?? 0,
    costUsd: data.usage?.cost ?? 0,
  };
}
