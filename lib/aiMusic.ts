/** تولید موزیک — Suno API (اختیاری با SUNO_API_KEY) */

export type MusicGenResult = {
  audioBuffer: ArrayBuffer;
  mime: string;
  costUsd: number;
};

export async function generateMusic(prompt: string): Promise<MusicGenResult> {
  const apiKey = process.env.SUNO_API_KEY?.trim();
  const base = (process.env.SUNO_API_BASE || "https://api.sunoapi.org").replace(/\/$/, "");

  if (!apiKey) {
    throw new Error("music_unavailable");
  }

  const createRes = await fetch(`${base}/api/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      make_instrumental: false,
      wait_audio: true,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`suno_create ${createRes.status}: ${err}`);
  }

  const createData = (await createRes.json()) as {
    data?: Array<{ audio_url?: string; id?: string }>;
  };

  const audioUrl = createData.data?.[0]?.audio_url;
  if (!audioUrl) {
    throw new Error("suno_no_audio");
  }

  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) {
    throw new Error(`suno_fetch ${audioRes.status}`);
  }

  const audioBuffer = await audioRes.arrayBuffer();
  const mime = audioRes.headers.get("content-type")?.split(";")[0] || "audio/mpeg";

  return { audioBuffer, mime, costUsd: 0.05 };
}
