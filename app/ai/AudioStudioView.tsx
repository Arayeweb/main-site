"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconSend, IconCopy, IconMic, UserAvatar } from "./icons";
import ModelSelect from "./ModelSelect";
import StudioHeader from "./StudioHeader";
import {
  getModel,
  audioModels,
  transcribeModels,
} from "@/lib/aiModels";
import { audioSpeechCost, transcribeCost } from "@/lib/aiCredits";
import { replaceThreadUrl } from "@/lib/aiThreadUrl";

export type AudioTurn = {
  id: string;
  prompt: string;
  response: string;
  audioUrl?: string;
  streaming?: boolean;
  modelId?: string;
  kind?: "tts" | "transcribe";
};

type GalleryItem = {
  id: string;
  threadId: string;
  prompt: string;
  url: string;
  createdAt: string;
};

const DEFAULT_AUDIO_MODEL = audioModels()[0]?.id || "audio-mini";
const DEFAULT_TRANSCRIBE_MODEL = transcribeModels()[0]?.id || "transcribe-4o";

export default function AudioStudioView({
  threadId: initialThreadId = null,
  initialTurns = [],
  onCreditsChange,
  plan = "free",
}: {
  threadId?: string | null;
  initialTurns?: AudioTurn[];
  onCreditsChange?: (n: number) => void;
  plan?: string;
}) {
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [turns, setTurns] = useState<AudioTurn[]>(initialTurns);
  const [studioTab, setStudioTab] = useState<"generate" | "gallery">("generate");
  const [modeTab, setModeTab] = useState<"tts" | "transcribe">("tts");
  const [input, setInput] = useState("");
  const [audioModel, setAudioModel] = useState(DEFAULT_AUDIO_MODEL);
  const [transcribeModel, setTranscribeModel] = useState(DEFAULT_TRANSCRIBE_MODEL);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<
    "" | "credits_out" | "ai_error" | "server_error" | "unauthorized" | "plan_locked" | "file_required"
  >("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ttsModelInfo = getModel(audioModel);
  const sttModelInfo = getModel(transcribeModel);
  const perTtsCost = ttsModelInfo ? audioSpeechCost(ttsModelInfo, input.length || 100) : 2;

  const loadGallery = useCallback(() => {
    setGalleryLoading(true);
    fetch("/api/ai/gallery?tier=audio_gen", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) setGallery(d.items || []);
      })
      .catch(() => {})
      .finally(() => setGalleryLoading(false));
  }, []);

  useEffect(() => {
    if (studioTab === "gallery") loadGallery();
  }, [studioTab, loadGallery]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns]);

  async function generateSpeech(q: string, activeThreadId: string | null) {
    if (busy) return;
    setBusy(true);
    setErr("");
    setStudioTab("generate");

    const tmpId = `tmp-aud-${Date.now()}`;
    setTurns((t) => [
      ...t,
      { id: tmpId, prompt: q, response: "", streaming: true, modelId: audioModel, kind: "tts" },
    ]);

    try {
      const res = await fetch("/api/ai/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ text: q, model: audioModel, threadId: activeThreadId }),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setErr("unauthorized");
        setBusy(false);
        return;
      }
      if (res.status === 402) {
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setErr("credits_out");
        setBusy(false);
        return;
      }
      if (res.status === 403 && data?.error === "plan_upgrade_required") {
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setErr("plan_locked");
        setBusy(false);
        return;
      }
      if (!res.ok || !data?.ok) {
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setErr("ai_error");
        setBusy(false);
        return;
      }

      setTurns((t) =>
        t.map((x) =>
          x.id === tmpId
            ? {
                id: String(data.id),
                prompt: q,
                response: "فایل صوتی ساخته شد.",
                audioUrl: data.audioUrl,
                streaming: false,
                modelId: audioModel,
                kind: "tts",
              }
            : x
        )
      );

      const tid = String(data.threadId);
      if (data.isNewThread) {
        setThreadId(tid);
        window.dispatchEvent(
          new CustomEvent("ai:thread-created", {
            detail: {
              id: tid,
              title: q.slice(0, 80),
              tier: "audio_gen",
              createdAt: new Date().toISOString(),
            },
          })
        );
        replaceThreadUrl(`/ai/audio/${tid}`);
      }

      if (typeof data.creditsRemaining === "number") onCreditsChange?.(data.creditsRemaining);
      window.dispatchEvent(new Event("ai:refresh"));
      if (data.audioUrl) {
        setGallery((g) => [
          {
            id: String(data.id || tmpId),
            threadId: tid,
            prompt: q,
            url: data.audioUrl,
            createdAt: new Date().toISOString(),
          },
          ...g,
        ]);
      }
    } catch {
      setTurns((t) => t.filter((x) => x.id !== tmpId));
      setErr("server_error");
    }
    setBusy(false);
  }

  async function runTranscribe(activeThreadId: string | null) {
    if (busy || !audioFile) {
      setErr("file_required");
      return;
    }
    setBusy(true);
    setErr("");
    setStudioTab("generate");

    const tmpId = `tmp-stt-${Date.now()}`;
    const label = `رونویسی: ${audioFile.name}`;
    setTurns((t) => [
      ...t,
      {
        id: tmpId,
        prompt: label,
        response: "",
        streaming: true,
        modelId: transcribeModel,
        kind: "transcribe",
      },
    ]);

    try {
      const form = new FormData();
      form.append("file", audioFile);
      form.append("model", transcribeModel);
      if (activeThreadId) form.append("threadId", activeThreadId);

      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setErr("unauthorized");
        setBusy(false);
        return;
      }
      if (res.status === 402) {
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setErr("credits_out");
        setBusy(false);
        return;
      }
      if (!res.ok || !data?.ok) {
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setErr("ai_error");
        setBusy(false);
        return;
      }

      setTurns((t) =>
        t.map((x) =>
          x.id === tmpId
            ? {
                id: String(data.id),
                prompt: label,
                response: data.text || "",
                streaming: false,
                modelId: transcribeModel,
                kind: "transcribe",
              }
            : x
        )
      );

      const tid = String(data.threadId);
      if (data.isNewThread) {
        setThreadId(tid);
        window.dispatchEvent(
          new CustomEvent("ai:thread-created", {
            detail: {
              id: tid,
              title: label.slice(0, 80),
              tier: "transcribe",
              createdAt: new Date().toISOString(),
            },
          })
        );
        replaceThreadUrl(`/ai/audio/${tid}`);
      }

      setAudioFile(null);
      if (fileRef.current) fileRef.current.value = "";
      if (typeof data.creditsRemaining === "number") onCreditsChange?.(data.creditsRemaining);
      window.dispatchEvent(new Event("ai:refresh"));
    } catch {
      setTurns((t) => t.filter((x) => x.id !== tmpId));
      setErr("server_error");
    }
    setBusy(false);
  }

  function send() {
    if (modeTab === "transcribe") {
      runTranscribe(threadId);
      return;
    }
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    generateSpeech(q, threadId);
  }

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1500);
    });
  }

  const sttEstimate = sttModelInfo ? transcribeCost(sttModelInfo, 60) : 2;
  const ttsOutputs = turns.filter((t) => t.audioUrl && !t.streaming);

  return (
    <div className="ar-chat-wrap ar-image-studio ar-audio-studio ar-generator-studio">
      <StudioHeader icon={IconMic} title="استودیو صوت" badge="TTS · رونویسی" />

      <div className="ar-studio-tabs">
        <div className="ar-studio-tabs-track">
          <button
            type="button"
            className={`ar-studio-tab${studioTab === "generate" ? " active" : ""}`}
            onClick={() => setStudioTab("generate")}
          >
            تولید
          </button>
          <button
            type="button"
            className={`ar-studio-tab${studioTab === "gallery" ? " active" : ""}`}
            onClick={() => setStudioTab("gallery")}
          >
            گالری من
          </button>
        </div>
      </div>

      {studioTab === "gallery" ? (
        <div className="ar-chat-scroll ar-gallery-scroll">
          {galleryLoading && <div className="ar-img-skeleton">در حال بارگذاری گالری…</div>}
          {!galleryLoading && gallery.length === 0 && (
            <div className="ar-image-studio-empty">
              <p>هنوز فایل صوتی نساختی — برگرد به تب تولید.</p>
            </div>
          )}
          <div className="ar-media-gallery-grid ar-audio-gallery-grid">
            {gallery.map((item) => (
              <div key={item.id} className="ar-gallery-item ar-gallery-item--audio">
                <audio src={item.url} controls className="ar-audio-player" preload="none" />
                <span className="ar-gallery-caption">{item.prompt.slice(0, 60)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="ar-audio-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={modeTab === "tts"}
              className={modeTab === "tts" ? "active" : ""}
              onClick={() => setModeTab("tts")}
            >
              ساخت صدا
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modeTab === "transcribe"}
              className={modeTab === "transcribe" ? "active" : ""}
              onClick={() => setModeTab("transcribe")}
            >
              رونویسی
            </button>
          </div>

          <div className="ar-chat-scroll">
            {turns.length === 0 && (
              <div className="ar-image-studio-empty ar-generator-empty">
                <p>
                  {modeTab === "tts"
                    ? "متنی که می‌خوای با صدای هوش مصنوعی خوانده شود را بنویس."
                    : "فایل صوتی را آپلود کن تا به متن تبدیل شود."}
                </p>
              </div>
            )}
            {ttsOutputs.length > 0 && (
              <div className="ar-media-gallery-grid ar-media-gallery-grid--session ar-audio-gallery-grid">
                {ttsOutputs.map((t) => (
                  <div key={t.id} className="ar-gallery-item ar-gallery-item--audio">
                    <audio src={t.audioUrl} controls className="ar-audio-player" preload="none" />
                    <span className="ar-gallery-caption">{t.prompt.slice(0, 60)}</span>
                  </div>
                ))}
              </div>
            )}
            {turns.map((t) => {
              const turnModel = t.modelId ? getModel(t.modelId) : null;
              if (t.audioUrl && !t.streaming && t.kind === "tts") return null;
              return (
                <div key={t.id} className="ar-turn">
                  <div className="ar-msg-user-row">
                    <UserAvatar initial="ش" size={34} />
                    <div className="ar-msg-user-bubble">{t.prompt}</div>
                  </div>
                  <div className="ar-msg-ai-block">
                    {t.streaming && (
                      <div className="ar-img-skeleton">
                        {t.kind === "transcribe" ? "در حال رونویسی…" : "در حال ساخت صدا…"}
                      </div>
                    )}
                    {t.audioUrl && t.kind !== "tts" && (
                      <div className="ar-msg-gen-audio">
                        <audio src={t.audioUrl} controls className="ar-audio-player" />
                        <a href={t.audioUrl} download target="_blank" rel="noopener noreferrer">
                          دانلود
                        </a>
                      </div>
                    )}
                    {t.kind === "transcribe" && t.response && !t.streaming && (
                      <div className="ar-transcript-text">{t.response}</div>
                    )}
                    {turnModel && !t.streaming && (
                      <div className="ar-image-turn-meta">
                        {turnModel.name}
                        <span className="powered-by"> · {turnModel.poweredBy}</span>
                      </div>
                    )}
                    {!t.streaming && (t.response || t.audioUrl) && (
                      <div className="ar-msg-actions">
                        <button
                          type="button"
                          className={`ar-msg-action-btn${copiedId === t.id ? " active" : ""}`}
                          aria-label="کپی"
                          onClick={() => copyText(t.id, t.kind === "transcribe" ? t.response : t.prompt)}
                        >
                          <IconCopy size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <div className="ar-chat-composer ar-image-composer ar-generator-composer">
            <div className="ar-composer ar-composer--dock">
              <div className="ar-composer-box">
                {modeTab === "tts" ? (
                  <textarea
                    ref={taRef}
                    rows={2}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="متن برای تبدیل به گفتار…"
                    maxLength={4000}
                    disabled={busy}
                  />
                ) : (
                  <div className="ar-transcribe-upload">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                      disabled={busy}
                    />
                    {audioFile && <span className="ar-file-name">{audioFile.name}</span>}
                  </div>
                )}
                <div className="ar-composer-foot">
                  <div className="ar-composer-toolstrip ar-image-toolstrip ar-generator-controls">
                    {modeTab === "tts" ? (
                      <ModelSelect
                        variant="bar"
                        value={audioModel}
                        onChange={setAudioModel}
                        plan={plan}
                        audioGenOnly
                        sheetOnMobile
                        label="موتور صدا"
                      />
                    ) : (
                      <ModelSelect
                        variant="bar"
                        value={transcribeModel}
                        onChange={setTranscribeModel}
                        plan={plan}
                        transcribeOnly
                        sheetOnMobile
                        label="موتور رونویسی"
                      />
                    )}
                    <span className="ar-image-tool-meta">
                      {modeTab === "tts"
                        ? `${perTtsCost.toLocaleString("fa-IR")} کردیت`
                        : `~${sttEstimate.toLocaleString("fa-IR")} کردیت/دقیقه`}
                    </span>
                  </div>
                  <div className="ar-composer-actions">
                    <button
                      type="button"
                      className="ar-send-btn ar-send-btn--dock ar-generate-btn"
                      onClick={send}
                      disabled={busy || (modeTab === "tts" ? !input.trim() : !audioFile)}
                      aria-label={modeTab === "tts" ? "ساخت صدا" : "رونویسی"}
                    >
                      {busy ? (
                        <span className="ar-spinner" style={{ borderTopColor: "#FCFBF7" }} />
                      ) : (
                        <IconSend size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {err === "file_required" && (
              <div className="ar-composer-err ar-image-composer-err">یک فایل صوتی انتخاب کن.</div>
            )}
            {err === "unauthorized" && (
              <div className="ar-composer-err ar-image-composer-err">
                برای استفاده{" "}
                <button type="button" className="ar-link-btn" onClick={() => window.dispatchEvent(new Event("ai:open-login"))}>
                  وارد شو
                </button>
                .
              </div>
            )}
            {err === "plan_locked" && (
              <div className="ar-composer-err ar-image-composer-err">
                این موتور در پلن فعلی نیست — <Link href="/ai/pricing">ارتقاء پلن</Link>
              </div>
            )}
            {err === "credits_out" && (
              <div className="ar-composer-err ar-image-composer-err">
                کردیت کافی نیست — <Link href="/ai/pricing">خرید کردیت</Link>
              </div>
            )}
            {err === "ai_error" && (
              <div className="ar-composer-err ar-image-composer-err">عملیات ناموفق بود. دوباره تلاش کن.</div>
            )}
            {err === "server_error" && (
              <div className="ar-composer-err ar-image-composer-err">خطای اتصال. دوباره تلاش کن.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
