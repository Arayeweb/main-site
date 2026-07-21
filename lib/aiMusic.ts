/** تولید موزیک — Google Lyria 3 Pro via OpenRouter */

import { modelRouteId } from "@/lib/aiModels";

export type MusicGenResult = {
  audioBuffer: ArrayBuffer;
  mime: string;
  costUsd: number;
  tokensUsed: number;
};

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";
/** OpenRouter list price for Lyria 3 Pro full song */
const LYRIA_FALLBACK_COST_USD = 0.08;

type ContentPart = {
  type: string;
  text?: string;
  input_audio?: { data?: string; format?: string };
  audio_url?: { url?: string };
};

function openRouterHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com",
    "X-Title": "Araaye Arena",
  };
}

function decodeDataUrl(u: string): { mime: string; base64: string } | null {
  const m = u.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], base64: m[2] };
}

export async function generateMusic(
  prompt: string,
  modelId = "music-lyria"
): Promise<MusicGenResult> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("music_unavailable");
  }

  const route = modelRouteId(modelId);
  const res = await fetch(OPENROUTER_API, {
    method: "POST",
    headers: openRouterHeaders(apiKey),
    body: JSON.stringify({
      model: route,
      messages: [{ role: "user", content: prompt }],
      modalities: ["text", "audio"],
      usage: { include: true },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`openrouter_music ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{
      message?: {
        content?: string | ContentPart[];
        audio?: { data?: string; format?: string; url?: string };
      };
    }>;
    usage?: { total_tokens?: number; cost?: number };
  };

  const msg = data.choices?.[0]?.message;
  let audioBase64: string | undefined;
  let audioUrl: string | undefined;
  let mime = "audio/mpeg";

  if (msg?.audio?.data) {
    audioBase64 = msg.audio.data;
    if (msg.audio.format === "wav" || msg.audio.format === "audio/wav") {
      mime = "audio/wav";
    } else if (msg.audio.format === "mp3" || msg.audio.format === "audio/mpeg") {
      mime = "audio/mpeg";
    } else if (msg.audio.format?.startsWith("audio/")) {
      mime = msg.audio.format;
    }
  }
  if (msg?.audio?.url) {
    audioUrl = msg.audio.url;
  }

  if (!audioBase64 && Array.isArray(msg?.content)) {
    for (const part of msg.content) {
      if (part.type === "input_audio" || part.type === "audio") {
        if (part.input_audio?.data) {
          audioBase64 = part.input_audio.data;
          const fmt = part.input_audio.format;
          if (fmt === "wav" || fmt === "audio/wav") mime = "audio/wav";
          else if (fmt?.startsWith("audio/")) mime = fmt;
        }
      }
      if (part.type === "audio_url" && part.audio_url?.url) {
        const decoded = decodeDataUrl(part.audio_url.url);
        if (decoded) {
          mime = decoded.mime;
          audioBase64 = decoded.base64;
        } else {
          audioUrl = part.audio_url.url;
        }
      }
    }
  }

  if (!audioBase64 && typeof msg?.content === "string") {
    const decoded = decodeDataUrl(msg.content.trim());
    if (decoded) {
      mime = decoded.mime;
      audioBase64 = decoded.base64;
    }
  }

  let audioBuffer: ArrayBuffer;
  if (audioBase64) {
    const buffer = Buffer.from(audioBase64, "base64");
    audioBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
  } else if (audioUrl) {
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
      throw new Error(`lyria_fetch ${audioRes.status}`);
    }
    audioBuffer = await audioRes.arrayBuffer();
    const ct = audioRes.headers.get("content-type")?.split(";")[0];
    if (ct) mime = ct;
  } else {
    throw new Error("no_audio_output");
  }

  return {
    audioBuffer,
    mime,
    tokensUsed: data.usage?.total_tokens ?? 0,
    costUsd: data.usage?.cost ?? LYRIA_FALLBACK_COST_USD,
  };
}
