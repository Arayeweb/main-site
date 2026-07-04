"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconSend, IconCopy, IconRefresh, IconVideo, IconStop, IconPaperclip, IconSpark, IconX, UserAvatar } from "./icons";
import ModelSelect from "./ModelSelect";
import StudioHeader from "./StudioHeader";
import AuthVideoPlayer from "./AuthVideoPlayer";
import {
  getModel,
  videoModels,
} from "@/lib/aiModels";
import { videoGenCost, DEFAULT_VIDEO_DURATION_SEC } from "@/lib/aiCredits";
import { replaceThreadUrl } from "@/lib/aiThreadUrl";
import MediaProgressStages from "./MediaProgressStages";

export type VideoTurn = {
  id: string;
  prompt: string;
  response: string;
  videoUrl?: string;
  streaming?: boolean;
  modelId?: string;
  statusText?: string;
  jobId?: string;
};

type GalleryItem = {
  id: string;
  threadId: string;
  prompt: string;
  url: string;
  createdAt: string;
};

type PendingAttachment = { url: string; mime: string; preview: string };

const DEFAULT_VIDEO_MODEL = videoModels()[0]?.id || "video-seedance";
const VIDEO_DISMISS_LS = "arena:video-dismissed-jobs";

function readDismissedVideoJobs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VIDEO_DISMISS_LS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function persistDismissedVideoJob(jobId: string) {
  const ids = new Set(readDismissedVideoJobs());
  ids.add(jobId);
  localStorage.setItem(VIDEO_DISMISS_LS, JSON.stringify([...ids]));
}

export default function VideoStudioView({
  threadId: initialThreadId = null,
  initialTurns = [],
  bootstrapPrompt = null,
  onCreditsChange,
  plan = "free",
}: {
  threadId?: string | null;
  initialTurns?: VideoTurn[];
  bootstrapPrompt?: string | null;
  onCreditsChange?: (n: number) => void;
  plan?: string;
}) {
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [turns, setTurns] = useState<VideoTurn[]>(initialTurns);
  const [input, setInput] = useState("");
  const [videoModel, setVideoModel] = useState(DEFAULT_VIDEO_MODEL);
  const [duration, setDuration] = useState(DEFAULT_VIDEO_DURATION_SEC);
  const [tab, setTab] = useState<"generate" | "gallery">("generate");
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [err, setErr] = useState<
    "" | "credits_out" | "ai_error" | "server_error" | "unauthorized" | "plan_locked"
  >("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bootRef = useRef(false);
  const pollTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pollAttemptsRef = useRef<Map<string, number>>(new Map());
  const dismissedJobsRef = useRef<Set<string>>(new Set());
  const dismissedTmpRef = useRef<Set<string>>(new Set());
  const resumedJobsRef = useRef<Set<string>>(new Set());

  const streamingCount = turns.filter((t) => t.streaming).length;

  const modelInfo = getModel(videoModel);
  const durationOptions = modelInfo?.videoDurations ?? [4, 5, 8];
  const perVideoCost = modelInfo ? videoGenCost(modelInfo, duration) : 10;

  const loadGallery = useCallback(() => {
    setGalleryLoading(true);
    fetch("/api/ai/gallery?tier=video_gen", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) setGallery(d.items || []);
      })
      .catch(() => {})
      .finally(() => setGalleryLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "gallery") loadGallery();
  }, [tab, loadGallery]);

  useEffect(() => {
    if (!durationOptions.includes(duration)) {
      setDuration(durationOptions[0] ?? DEFAULT_VIDEO_DURATION_SEC);
    }
  }, [videoModel, durationOptions, duration]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns]);

  useEffect(() => {
    return () => {
      for (const timer of pollTimersRef.current.values()) clearTimeout(timer);
      pollTimersRef.current.clear();
    };
  }, []);

  function clearJobPoll(jobId: string) {
    const timer = pollTimersRef.current.get(jobId);
    if (timer) clearTimeout(timer);
    pollTimersRef.current.delete(jobId);
    pollAttemptsRef.current.delete(jobId);
  }

  function dismissJob(jobId: string, tmpId: string) {
    dismissedJobsRef.current.add(jobId);
    persistDismissedVideoJob(jobId);
    clearJobPoll(jobId);
    resumedJobsRef.current.delete(jobId);
    setTurns((t) => t.filter((x) => x.id !== tmpId && x.jobId !== jobId));

    void fetch(`/api/ai/video/${jobId}/dismiss`, {
      method: "POST",
      credentials: "same-origin",
    })
      .then((r) => r.json())
      .then((d) => {
        // #region agent log
        fetch("http://127.0.0.1:7595/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d89e34" },
          body: JSON.stringify({
            sessionId: "d89e34",
            runId: "post-fix",
            hypothesisId: "H12",
            location: "VideoStudioView.tsx:dismissJob:api",
            message: "dismiss API response",
            data: { jobId, ok: d?.ok, error: d?.error },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      })
      .catch(() => {});

    // #region agent log
    fetch("http://127.0.0.1:7595/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d89e34" },
      body: JSON.stringify({
        sessionId: "d89e34",
        runId: "post-fix",
        hypothesisId: "H9-H10",
        location: "VideoStudioView.tsx:dismissJob",
        message: "user dismissed video job polling",
        data: { jobId, tmpId, streamingCountBefore: streamingCount },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }

  function scheduleJobPoll(jobId: string, fn: () => void) {
    if (dismissedJobsRef.current.has(jobId)) return;
    clearJobPoll(jobId);
    const attempt = pollAttemptsRef.current.get(jobId) ?? 0;
    const delay = Math.min(1000 * 2 ** attempt, 8000);
    pollAttemptsRef.current.set(jobId, attempt + 1);
    pollTimersRef.current.set(
      jobId,
      setTimeout(fn, attempt <= 0 ? 250 : delay)
    );
  }

  useEffect(() => {
    for (const id of readDismissedVideoJobs()) {
      dismissedJobsRef.current.add(id);
    }
    if (dismissedJobsRef.current.size > 0) {
      setTurns((t) =>
        t.filter((x) => !x.jobId || !dismissedJobsRef.current.has(x.jobId))
      );
    }

    for (const t of initialTurns) {
      if (!t.jobId || !t.streaming) continue;
      if (dismissedJobsRef.current.has(t.jobId)) continue;
      if (resumedJobsRef.current.has(t.jobId)) continue;
      resumedJobsRef.current.add(t.jobId);
      void pollJob(t.jobId, t.id, t.prompt, threadId ?? initialThreadId ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const qs = threadId ? `?threadId=${encodeURIComponent(threadId)}` : "";
    fetch(`/api/ai/video/jobs${qs}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.ok || !Array.isArray(d.jobs) || d.jobs.length === 0) return;
        for (const job of d.jobs as Array<{
          id: string;
          prompt?: string;
          modelId?: string;
          status?: string;
          threadId?: string | null;
        }>) {
          if (dismissedJobsRef.current.has(job.id)) continue;
          if (resumedJobsRef.current.has(job.id)) continue;
          resumedJobsRef.current.add(job.id);

          const tmpId = `job-${job.id}`;
          setTurns((t) => {
            if (t.some((x) => x.id === tmpId || x.id === job.id)) return t;
            return [
              ...t,
              {
                id: tmpId,
                prompt: job.prompt || "",
                response: "",
                streaming: true,
                statusText:
                  job.status === "processing"
                    ? "در حال ساخت ویدیو…"
                    : "در صف — به‌زودی شروع می‌شود",
                modelId: job.modelId,
                jobId: job.id,
              },
            ];
          });
          void pollJob(job.id, tmpId, job.prompt || "", job.threadId ?? threadId);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  async function pollJob(
    jobId: string,
    tmpId: string,
    q: string,
    activeThreadId: string | null
  ) {
    if (dismissedJobsRef.current.has(jobId)) return;
    pollAttemptsRef.current.set(jobId, 0);

    const poll = async () => {
      if (dismissedJobsRef.current.has(jobId)) {
        clearJobPoll(jobId);
        return;
      }
      try {
        const res = await fetch(`/api/ai/video/${jobId}`, { credentials: "same-origin" });
        const data = await res.json().catch(() => null);

        // #region agent log
        fetch("http://127.0.0.1:7595/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d89e34" },
          body: JSON.stringify({
            sessionId: "d89e34",
            runId: "post-fix",
            hypothesisId: "H16",
            location: "VideoStudioView.tsx:pollJob:response",
            message: "client poll response",
            data: {
              jobId,
              tmpId,
              httpOk: res.ok,
              status: data?.status,
              hasVideoUrl: Boolean(data?.videoUrl),
              error: data?.error,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

        if (dismissedJobsRef.current.has(jobId)) {
          clearJobPoll(jobId);
          return;
        }

        if (data?.status === "dismissed") {
          clearJobPoll(jobId);
          setTurns((t) => t.filter((x) => x.id !== tmpId && x.jobId !== jobId));
          return;
        }

        if (data?.status === "processing" || data?.status === "pending") {
          setTurns((t) =>
            t.map((x) =>
              x.id === tmpId || x.jobId === jobId
                ? {
                    ...x,
                    jobId,
                    statusText:
                      data.status === "processing"
                        ? "در حال ساخت ویدیو…"
                        : "در صف — به‌زودی شروع می‌شود",
                  }
                : x
            )
          );
          scheduleJobPoll(jobId, poll);
          return;
        }

        clearJobPoll(jobId);

        if (!res.ok || data?.status === "failed") {
          setTurns((t) => t.filter((x) => x.id !== tmpId && x.jobId !== jobId));
          setErr("ai_error");
          return;
        }

        if (data?.status === "completed" && data.videoUrl) {
          setTurns((t) =>
            t.map((x) =>
              x.id === tmpId || x.jobId === jobId
                ? {
                    id: String(data.battleId || tmpId),
                    prompt: q,
                    response: "ویدیو ساخته شد.",
                    videoUrl: data.videoUrl,
                    streaming: false,
                    modelId: videoModel,
                    statusText: "آماده دانلود",
                    jobId,
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
                  tier: "video_gen",
                  createdAt: new Date().toISOString(),
                },
              })
            );
            replaceThreadUrl(`/ai/video/${tid}`);
          }

          if (typeof data.creditsRemaining === "number") onCreditsChange?.(data.creditsRemaining);
          setGallery((g) => [
            {
              id: String(data.battleId || tmpId),
              threadId: tid,
              prompt: q,
              url: data.videoUrl,
              createdAt: new Date().toISOString(),
            },
            ...g,
          ]);
          window.dispatchEvent(new Event("ai:refresh"));
        }
      } catch {
        clearJobPoll(jobId);
        if (!dismissedJobsRef.current.has(jobId)) {
          setTurns((t) => t.filter((x) => x.id !== tmpId && x.jobId !== jobId));
          setErr("server_error");
        }
      }
    };

    await poll();
  }

  async function uploadReference(file: File) {
    if (uploading || attachment) return;
    setUploading(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ai/upload", { method: "POST", body: fd, credentials: "same-origin" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data.url) {
        setErr("server_error");
        return;
      }
      setAttachment({
        url: String(data.url),
        mime: String(data.mime || file.type),
        preview: URL.createObjectURL(file),
      });
    } catch {
      setErr("server_error");
    } finally {
      setUploading(false);
    }
  }

  async function improvePrompt() {
    const q = input.trim();
    if (!q || enhancing || submitting) return;
    setEnhancing(true);
    setErr("");
    try {
      const res = await fetch("/api/ai/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ prompt: q, mode: "video" }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401) {
        setErr("unauthorized");
        return;
      }
      if (!res.ok || !data?.ok || !data.prompt) {
        setErr("ai_error");
        return;
      }
      setInput(String(data.prompt));
      if (taRef.current) {
        taRef.current.style.height = "auto";
        taRef.current.style.height = Math.min(taRef.current.scrollHeight, 140) + "px";
      }
    } catch {
      setErr("server_error");
    } finally {
      setEnhancing(false);
    }
  }

  function clearAttachment() {
    if (attachment?.preview.startsWith("blob:")) {
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachment(null);
  }

  async function generateVideo(
    q: string,
    activeThreadId: string | null,
    referenceImageUrl?: string | null
  ) {
    setErr("");
    setTab("generate");

    const tmpId = `tmp-vid-${Date.now()}`;
    setTurns((t) => [
      ...t,
      {
        id: tmpId,
        prompt: q,
        response: "",
        streaming: true,
        statusText: "ارسال درخواست…",
        modelId: videoModel,
      },
    ]);

    setSubmitting(true);
    try {
      const res = await fetch("/api/ai/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          prompt: q,
          model: videoModel,
          duration,
          threadId: activeThreadId,
          referenceImageUrl: referenceImageUrl || undefined,
        }),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setErr("unauthorized");
        return;
      }
      if (res.status === 402) {
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setErr("credits_out");
        return;
      }
      if (res.status === 403 && data?.error === "plan_upgrade_required") {
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setErr("plan_locked");
        return;
      }
      if (!res.ok || !data?.ok || !data.jobId) {
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setErr("ai_error");
        return;
      }

      if (dismissedTmpRef.current.has(tmpId)) {
        dismissedJobsRef.current.add(String(data.jobId));
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        return;
      }

      if (dismissedJobsRef.current.has(String(data.jobId))) {
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        return;
      }

      resumedJobsRef.current.add(data.jobId as string);
      setTurns((t) =>
        t.map((x) =>
          x.id === tmpId
            ? { ...x, jobId: String(data.jobId), statusText: "در صف — به‌زودی شروع می‌شود" }
            : x
        )
      );
      if (typeof data.creditsRemaining === "number") onCreditsChange?.(data.creditsRemaining);
      void pollJob(String(data.jobId), tmpId, q, activeThreadId);
    } catch {
      setTurns((t) => t.filter((x) => x.id !== tmpId));
      setErr("server_error");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!bootstrapPrompt || bootRef.current) return;
    bootRef.current = true;
    generateVideo(bootstrapPrompt, initialThreadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapPrompt]);

  function send() {
    const q = input.trim();
    if (!q || submitting) return;
    const refUrl = attachment?.url ?? null;
    setInput("");
    clearAttachment();
    if (taRef.current) taRef.current.style.height = "auto";
    generateVideo(q, threadId, refUrl);
  }

  function copyPrompt(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1500);
    });
  }

  function regenerate(turn: VideoTurn, isLast: boolean) {
    if (!isLast || submitting || turn.streaming) return;
    generateVideo(turn.prompt, threadId);
  }

  const lastTurnId = turns[turns.length - 1]?.id;

  return (
    <div className="ar-chat-wrap ar-image-studio ar-video-studio ar-generator-studio">
      <StudioHeader
        icon={IconVideo}
        title="استودیو ویدیو"
        badge={`${perVideoCost.toLocaleString("fa-IR")} کردیت · ${duration}ث`}
        backHref={threadId ? "/ai/video" : "/ai"}
        backLabel={threadId ? "ویدیوی جدید" : "بازگشت"}
      />

      {streamingCount > 0 && (
        <p className="ar-video-queue-hint" role="status">
          {streamingCount.toLocaleString("fa-IR")} ویدیو در حال ساخت — می‌توانی ویدیوی جدید هم بسازی
        </p>
      )}

      <div className="ar-studio-tabs">
        <div className="ar-studio-tabs-track">
          <button
            type="button"
            className={`ar-studio-tab${tab === "generate" ? " active" : ""}`}
            onClick={() => setTab("generate")}
          >
            تولید
          </button>
          <button
            type="button"
            className={`ar-studio-tab${tab === "gallery" ? " active" : ""}`}
            onClick={() => setTab("gallery")}
          >
            گالری من
          </button>
        </div>
      </div>

      {tab === "gallery" ? (
        <div className="ar-chat-scroll ar-gallery-scroll">
          {galleryLoading && <div className="ar-img-skeleton">در حال بارگذاری گالری…</div>}
          {!galleryLoading && gallery.length === 0 && (
            <div className="ar-image-studio-empty">
              <p>هنوز ویدیویی نساختی — برگرد به تب تولید.</p>
            </div>
          )}
          <div className="ar-media-gallery-grid">
            {gallery.map((item) => (
              <div key={item.id} className="ar-gallery-item ar-gallery-item--video">
                <AuthVideoPlayer src={item.url} />
                <span className="ar-gallery-caption">{item.prompt.slice(0, 60)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
      <div className="ar-chat-scroll">
        {turns.length === 0 && (
          <div className="ar-image-studio-empty">
            <p>صحنه ویدیویی که می‌خوای را توصیف کن — مثلاً «غروب در کویر با شترهای در حال حرکت».</p>
          </div>
        )}
        {turns.map((t) => {
          const isLast = t.id === lastTurnId;
          const turnModel = t.modelId ? getModel(t.modelId) : modelInfo;
          return (
            <div key={t.id} className="ar-turn">
              <div className="ar-msg-user-row">
                <UserAvatar initial="ش" size={34} />
                <div className="ar-msg-user-bubble">{t.prompt}</div>
              </div>
              <div className="ar-msg-ai-block">
                {t.streaming && (
                  <div className="ar-img-skeleton ar-video-pending">
                    <MediaProgressStages statusText={t.statusText} streaming={t.streaming} />
                    {t.jobId ? (
                      <button
                        type="button"
                        className="ar-video-stop-btn"
                        aria-label="توقف نمایش"
                        onClick={() => dismissJob(t.jobId!, t.id)}
                      >
                        <IconStop size={14} />
                        توقف
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="ar-video-stop-btn"
                        aria-label="لغو"
                        onClick={() => {
                          dismissedTmpRef.current.add(t.id);
                          setTurns((prev) => prev.filter((x) => x.id !== t.id));
                        }}
                      >
                        <IconStop size={14} />
                        لغو
                      </button>
                    )}
                  </div>
                )}
                {t.videoUrl && (
                  <div className="ar-msg-gen-image ar-msg-gen-video">
                    <AuthVideoPlayer src={t.videoUrl} />
                    <a href={t.videoUrl} download target="_blank" rel="noopener noreferrer">
                      دانلود
                    </a>
                  </div>
                )}
                {turnModel && !t.streaming && (
                  <div className="ar-image-turn-meta">
                    {turnModel.name}
                    <span className="powered-by"> · {turnModel.poweredBy}</span>
                  </div>
                )}
                {!t.streaming && (t.response || t.videoUrl) && (
                  <div className="ar-msg-actions">
                    <button
                      type="button"
                      className={`ar-msg-action-btn${copiedId === t.id ? " active" : ""}`}
                      aria-label="کپی پرامپت"
                      onClick={() => copyPrompt(t.id, t.prompt)}
                    >
                      <IconCopy size={15} />
                    </button>
                    {isLast && (
                      <button
                        type="button"
                        className="ar-msg-action-btn"
                        aria-label="ساخت دوباره"
                        disabled={submitting}
                        onClick={() => regenerate(t, isLast)}
                      >
                        <IconRefresh size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="ar-chat-composer ar-image-composer">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void uploadReference(f);
          }}
        />
        <div className="ar-composer ar-composer--dock">
          <div className="ar-composer-box">
            {attachment && (
              <div className="ar-attach-preview-row">
                <div className="ar-attach-preview">
                  <img src={attachment.preview} alt="" />
                  <button type="button" aria-label="حذف تصویر" onClick={clearAttachment}>
                    <IconX size={12} />
                  </button>
                </div>
              </div>
            )}
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
              placeholder="صحنه ویدیویی که می‌خوای…"
              maxLength={4000}
              disabled={submitting || enhancing}
            />
            <div className="ar-composer-foot">
              <div className="ar-composer-toolstrip ar-image-toolstrip">
                <button
                  type="button"
                  className={`ar-composer-tool-btn ar-composer-tool-primary${attachment ? " active" : ""}`}
                  disabled={uploading || submitting || Boolean(attachment)}
                  title="تصویر مرجع (فریم اول)"
                  aria-label="افزودن فایل"
                  onClick={() => fileRef.current?.click()}
                >
                  <IconPaperclip size={16} />
                </button>
                <button
                  type="button"
                  className={`ar-composer-tool-btn${enhancing ? " active" : ""}`}
                  disabled={!input.trim() || enhancing || submitting}
                  title="بهبود پرامپت — موضوع دقیق حفظ می‌شود"
                  aria-label="بهبود پرامپت"
                  onClick={() => void improvePrompt()}
                >
                  {enhancing ? (
                    <span className="ar-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  ) : (
                    <IconSpark size={16} />
                  )}
                </button>
                <ModelSelect
                  variant="bar"
                  value={videoModel}
                  onChange={setVideoModel}
                  plan={plan}
                  videoGenOnly
                  sheetOnMobile
                  label="موتور ویدیو"
                />
                <select
                  className="ar-video-duration-select"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  disabled={submitting || enhancing}
                  aria-label="مدت ویدیو"
                >
                  {durationOptions.map((d) => (
                    <option key={d} value={d}>
                      {d} ثانیه
                    </option>
                  ))}
                </select>
                {modelInfo && (
                  <span className="ar-image-tool-meta">
                    {perVideoCost.toLocaleString("fa-IR")} کردیت
                  </span>
                )}
              </div>
              <div className="ar-composer-actions">
                <button
                  type="button"
                  className="ar-send-btn ar-send-btn--dock"
                  onClick={send}
                  disabled={!input.trim() || submitting || enhancing || uploading}
                  aria-label="ساخت ویدیو"
                >
                  {submitting ? (
                    <span className="ar-spinner" style={{ borderTopColor: "#FCFBF7" }} />
                  ) : (
                    <IconSend size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {err === "unauthorized" && (
          <div className="ar-composer-err ar-image-composer-err">
            برای ساخت ویدیو{" "}
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
          <div className="ar-composer-err ar-image-composer-err">
            ساخت ویدیو ناموفق بود. مدت یا موتور دیگر را امتحان کن.
          </div>
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
