"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconSend, IconCopy, IconMusic, UserAvatar } from "./icons";
import StudioHeader from "./StudioHeader";
import { getModel, musicModels } from "@/lib/aiModels";
import { musicGenCost } from "@/lib/aiCredits";
import { replaceThreadUrl } from "@/lib/aiThreadUrl";

export type MusicTurn = {
  id: string;
  prompt: string;
  response: string;
  audioUrl?: string;
  streaming?: boolean;
  modelId?: string;
};

type GalleryItem = {
  id: string;
  threadId: string;
  prompt: string;
  url: string;
  createdAt: string;
};

const DEFAULT_MUSIC_MODEL = musicModels()[0]?.id || "music-suno";

export default function MusicStudioView({
  threadId: initialThreadId = null,
  initialTurns = [],
  bootstrapPrompt = null,
  onCreditsChange,
  plan = "free",
}: {
  threadId?: string | null;
  initialTurns?: MusicTurn[];
  bootstrapPrompt?: string | null;
  onCreditsChange?: (n: number) => void;
  plan?: string;
}) {
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [turns, setTurns] = useState<MusicTurn[]>(initialTurns);
  const [studioTab, setStudioTab] = useState<"generate" | "gallery">("generate");
  const [input, setInput] = useState("");
  const [musicModel] = useState(DEFAULT_MUSIC_MODEL);
  const [instrumental, setInstrumental] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<
    "" | "credits_out" | "ai_error" | "server_error" | "unauthorized" | "music_unavailable"
  >("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const bootRef = useRef(false);

  const modelInfo = getModel(musicModel);
  const perCost = modelInfo ? musicGenCost(modelInfo) : 8;

  const loadGallery = useCallback(() => {
    setGalleryLoading(true);
    fetch("/api/ai/gallery?tier=music_gen", { credentials: "same-origin" })
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

  async function generateMusicTrack(q: string, activeThreadId: string | null) {
    if (busy) return;
    setBusy(true);
    setErr("");
    setStudioTab("generate");

    const tmpId = `tmp-mus-${Date.now()}`;
    setTurns((t) => [
      ...t,
      { id: tmpId, prompt: q, response: "", streaming: true, modelId: musicModel },
    ]);

    try {
      const res = await fetch("/api/ai/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: q,
          threadId: activeThreadId,
          model: musicModel,
          instrumental,
        }),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        setErr("unauthorized");
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setBusy(false);
        return;
      }
      if (res.status === 402) {
        setErr("credits_out");
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setBusy(false);
        return;
      }
      if (res.status === 503 || data?.error === "music_unavailable") {
        setErr("music_unavailable");
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setBusy(false);
        return;
      }
      if (!res.ok || !data?.ok) {
        setErr("ai_error");
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setBusy(false);
        return;
      }

      const resolvedThread = data.threadId as string;
      if (!activeThreadId) {
        setThreadId(resolvedThread);
        replaceThreadUrl(`/ai/music/${resolvedThread}`);
      }

      if (typeof data.creditsRemaining === "number") onCreditsChange?.(data.creditsRemaining);

      setTurns((t) =>
        t.map((x) =>
          x.id === tmpId
            ? {
                ...x,
                id: data.id as string,
                response: "قطعه موزیک آماده است.",
                audioUrl: data.audioUrl as string,
                streaming: false,
              }
            : x
        )
      );
    } catch {
      setErr("server_error");
      setTurns((t) => t.filter((x) => x.id !== tmpId));
    }
    setBusy(false);
  }

  useEffect(() => {
    if (bootRef.current || !bootstrapPrompt?.trim()) return;
    bootRef.current = true;
    generateMusicTrack(bootstrapPrompt.trim(), threadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapPrompt]);

  function handleSubmit() {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    generateMusicTrack(q, threadId);
  }

  async function copyText(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="ar-chat-wrap ar-image-studio ar-music-studio ar-generator-studio">
      <StudioHeader icon={IconMusic} title="استودیو موزیک" badge="Suno · AI" />

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
              <p>هنوز موزیکی نساختی — برگرد به تب تولید.</p>
            </div>
          )}
          <div className="ar-media-gallery-grid ar-audio-gallery-grid">
            {gallery.map((g) => (
              <Link key={g.id} href={`/ai/music/${g.threadId}`} className="ar-gallery-item ar-gallery-item--audio">
                <span className="ar-gallery-audio-icon" aria-hidden>
                  <IconMusic size={24} />
                </span>
                <span className="ar-gallery-caption">{g.prompt.slice(0, 60)}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="ar-chat-scroll ar-studio-scroll">
            {turns.length === 0 && (
              <div className="ar-generator-empty">
                <p>سبک و حس موزیک را توضیح بده — مثلاً «پاپ شاد فارسی با سنتور».</p>
              </div>
            )}
            {turns.map((t) => (
              <div key={t.id} className="ar-turn">
                <div className="ar-msg-user-row">
                  <UserAvatar initial="ش" size={34} />
                  <div className="ar-msg-user-bubble">{t.prompt}</div>
                </div>
                <div className="ar-msg-ai-block">
                  {t.streaming ? (
                    <div className="ar-img-skeleton">
                      <span>در حال ساخت موزیک…</span>
                    </div>
                  ) : (
                    <>
                      {t.audioUrl && (
                        <audio controls src={t.audioUrl} className="ar-audio-player" preload="metadata" />
                      )}
                      <p className="ar-msg-ai-text">{t.response}</p>
                      {t.audioUrl && (
                        <div className="ar-msg-actions">
                          <a href={t.audioUrl} download className="ar-msg-action-btn">
                            دانلود
                          </a>
                          <button
                            type="button"
                            className={`ar-msg-action-btn${copiedId === t.id ? " active" : ""}`}
                            onClick={() => copyText(t.id, t.audioUrl!)}
                          >
                            <IconCopy size={15} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="ar-studio-composer">
            <label className="ar-music-instrumental">
              <input
                type="checkbox"
                checked={instrumental}
                onChange={(e) => setInstrumental(e.target.checked)}
              />
              فقط موسیقی (بدون آواز)
            </label>
            {err === "credits_out" && (
              <div className="ar-composer-err">
                کردیت کافی نیست — <Link href="/ai/pricing">خرید</Link>
              </div>
            )}
            {err === "music_unavailable" && (
              <div className="ar-composer-err">سرویس موزیک به‌زودی فعال می‌شود.</div>
            )}
            {err === "unauthorized" && (
              <div className="ar-composer-err">
                <Link href="/ai?login=1">ورود</Link> برای ساخت موزیک
              </div>
            )}
            <div className="ar-composer ar-composer--dock">
              <div className="ar-composer-box">
                <textarea
                  ref={taRef}
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="سبک، احساس و سازها را توضیح بده…"
                  maxLength={2000}
                />
                <div className="ar-composer-foot">
                  <span className="ar-studio-cost-hint">{perCost.toLocaleString("fa-IR")} کردیت</span>
                  <div className="ar-composer-actions">
                    <button
                      type="button"
                      className="ar-send-btn ar-send-btn--dock"
                      disabled={!input.trim() || busy}
                      onClick={handleSubmit}
                      aria-label="ساخت موزیک"
                    >
                      <IconSend size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}