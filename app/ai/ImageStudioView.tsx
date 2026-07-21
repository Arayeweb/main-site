"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  IconSend,
  IconCopy,
  IconRefresh,
  IconImage,
  IconPaperclip,
  IconSpark,
  IconX,
  IconStop,
  UserAvatar,
} from "./icons";
import ModelSelect from "./ModelSelect";
import StudioHeader from "./StudioHeader";
import { getModel, imageModels } from "@/lib/aiModels";
import { canUseModel, imageGenCost } from "@/lib/aiCredits";
import { useArenaAuth } from "./ArenaAuthContext";
import { replaceThreadUrl } from "@/lib/aiThreadUrl";
import MediaProgressStages from "./MediaProgressStages";

export type ImageTurn = {
  id: string;
  prompt: string;
  response: string;
  imageUrl?: string;
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

const DEFAULT_IMAGE_MODEL = imageModels()[0]?.id || "image-lite";
const IMAGE_DISMISS_LS = "arena:image-dismissed-jobs";

const SIZE_PRESETS = [
  { id: "auto", label: "خودکار" },
  { id: "square", label: "مربع" },
  { id: "portrait", label: "عمودی" },
] as const;

const QUALITY_PRESETS = [
  { id: "standard", label: "استاندارد" },
  { id: "hd", label: "HD" },
] as const;

function sizeHint(id: string) {
  if (id === "square") return " — مربع ۱:۱";
  if (id === "portrait") return " — عمودی ۹:۱۶";
  return "";
}

function readDismissedImageJobs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(IMAGE_DISMISS_LS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function persistDismissedImageJob(jobId: string) {
  const ids = new Set(readDismissedImageJobs());
  ids.add(jobId);
  localStorage.setItem(IMAGE_DISMISS_LS, JSON.stringify([...ids]));
}

export default function ImageStudioView({
  threadId: initialThreadId = null,
  initialTurns = [],
  bootstrapPrompt = null,
  onCreditsChange,
  plan: planProp = "free",
}: {
  threadId?: string | null;
  initialTurns?: ImageTurn[];
  bootstrapPrompt?: string | null;
  onCreditsChange?: (n: number) => void;
  plan?: string;
}) {
  const { plan: authPlan, setCredits: authSetCredits } = useArenaAuth();
  const plan = authPlan || planProp;
  const applyCredits = onCreditsChange ?? authSetCredits;

  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [turns, setTurns] = useState<ImageTurn[]>(initialTurns);
  const [input, setInput] = useState("");
  const [imageModel, setImageModel] = useState(DEFAULT_IMAGE_MODEL);
  const [sizePreset, setSizePreset] = useState<(typeof SIZE_PRESETS)[number]["id"]>("auto");
  const [qualityPreset, setQualityPreset] = useState<(typeof QUALITY_PRESETS)[number]["id"]>("standard");
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
  const modelInfo = getModel(imageModel);
  const perImageCost = modelInfo ? imageGenCost(modelInfo) : 4;

  const loadGallery = useCallback(() => {
    setGalleryLoading(true);
    fetch("/api/ai/gallery?tier=image_gen", { credentials: "same-origin" })
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
    const current = getModel(imageModel);
    if (current && canUseModel(plan, current)) return;
    const first = imageModels().find((m) => canUseModel(plan, m));
    if (first) setImageModel(first.id);
  }, [plan, imageModel]);

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
    persistDismissedImageJob(jobId);
    clearJobPoll(jobId);
    resumedJobsRef.current.delete(jobId);
    setTurns((t) => t.filter((x) => x.id !== tmpId && x.jobId !== jobId));

    void fetch(`/api/ai/image/${jobId}/dismiss`, {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => {});
  }

  function scheduleJobPoll(jobId: string, fn: () => void) {
    if (dismissedJobsRef.current.has(jobId)) return;
    const existing = pollTimersRef.current.get(jobId);
    if (existing) clearTimeout(existing);
    const attempt = pollAttemptsRef.current.get(jobId) ?? 0;
    const delay = Math.min(1000 * 2 ** attempt, 8000);
    pollAttemptsRef.current.set(jobId, attempt + 1);
    pollTimersRef.current.set(
      jobId,
      setTimeout(fn, attempt <= 0 ? 400 : delay)
    );
  }

  useEffect(() => {
    for (const id of readDismissedImageJobs()) {
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
    fetch(`/api/ai/image/jobs${qs}`, { credentials: "same-origin" })
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
            if (t.some((x) => x.id === tmpId || x.jobId === job.id)) return t;
            return [
              ...t,
              {
                id: tmpId,
                prompt: job.prompt || "",
                response: "",
                streaming: true,
                statusText:
                  job.status === "processing"
                    ? "در حال ساخت تصویر…"
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

  function buildPrompt(q: string) {
    const hints: string[] = [];
    if (sizePreset === "square") hints.push("فرمت مربع ۱:۱");
    if (sizePreset === "portrait") hints.push("فرمت عمودی ۹:۱۶");
    if (qualityPreset === "hd") hints.push("کیفیت بالا، جزئیات دقیق");
    if (!hints.length) return q;
    return `${q}\n(${hints.join("، ")})`;
  }

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
        const res = await fetch(`/api/ai/image/${jobId}`, { credentials: "same-origin" });
        const data = await res.json().catch(() => null);

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
                        ? "در حال ساخت تصویر…"
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

        if (data?.status === "completed" && data.imageUrl) {
          setTurns((t) =>
            t.map((x) =>
              x.id === tmpId || x.jobId === jobId
                ? {
                    id: String(data.battleId || tmpId),
                    prompt: q,
                    response: data.caption || "",
                    imageUrl: data.imageUrl,
                    streaming: false,
                    modelId: imageModel,
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
                  tier: "image_gen",
                  createdAt: new Date().toISOString(),
                },
              })
            );
            replaceThreadUrl(`/ai/image/${tid}`);
          }

          window.dispatchEvent(new Event("ai:refresh"));
          setGallery((g) => [
            {
              id: String(data.battleId || tmpId),
              threadId: tid,
              prompt: q,
              url: data.imageUrl,
              createdAt: new Date().toISOString(),
            },
            ...g,
          ]);
        }
      } catch {
        clearJobPoll(jobId);
        if (!dismissedJobsRef.current.has(jobId)) {
          scheduleJobPoll(jobId, poll);
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
        body: JSON.stringify({ prompt: q, mode: "image" }),
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

  async function generateImage(
    q: string,
    activeThreadId: string | null,
    referenceImageUrl?: string | null
  ) {
    setErr("");
    setTab("generate");

    const apiPrompt = buildPrompt(q);
    const tmpId = `tmp-img-${Date.now()}`;
    setTurns((t) => [
      ...t,
      { id: tmpId, prompt: q, response: "", streaming: true, statusText: "ارسال درخواست…", modelId: imageModel },
    ]);

    setSubmitting(true);
    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          prompt: apiPrompt,
          model: imageModel,
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
      if (typeof data.creditsRemaining === "number") applyCredits(data.creditsRemaining);
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
    generateImage(bootstrapPrompt, initialThreadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapPrompt]);

  function send() {
    const q = input.trim();
    if (!q || submitting) return;
    const refUrl = attachment?.url ?? null;
    setInput("");
    clearAttachment();
    if (taRef.current) taRef.current.style.height = "auto";
    generateImage(q, threadId, refUrl);
  }

  function copyPrompt(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1500);
    });
  }

  function regenerate(turn: ImageTurn, isLast: boolean) {
    if (!isLast || submitting || turn.streaming) return;
    generateImage(turn.prompt, threadId);
  }

  const lastTurnId = turns[turns.length - 1]?.id;
  const gridItems = turns.filter((t) => t.imageUrl && !t.streaming);

  return (
    <div className="ar-chat-wrap ar-image-studio ar-generator-studio">
      <StudioHeader
        icon={IconImage}
        title="استودیو تصویر"
        badge={`${perImageCost.toLocaleString("fa-IR")} کردیت / تصویر`}
      />

      {streamingCount > 0 && (
        <p className="ar-video-queue-hint" role="status">
          {streamingCount.toLocaleString("fa-IR")} تصویر در حال ساخت — می‌توانی تصویر جدید هم بسازی
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
              <p>هنوز تصویری نساختی — برگرد به تب تولید.</p>
            </div>
          )}
          <div className="ar-media-gallery-grid">
            {gallery.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="ar-gallery-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.prompt} loading="lazy" />
                <span className="ar-gallery-caption">{item.prompt.slice(0, 60)}</span>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="ar-chat-scroll">
            {turns.length === 0 && (
              <div className="ar-image-studio-empty ar-generator-empty">
                <p>توضیح تصویری که می‌خوای را بنویس و «تولید کن» بزن.</p>
              </div>
            )}
            {gridItems.length > 0 && (
              <div className="ar-media-gallery-grid ar-media-gallery-grid--session">
                {gridItems.map((t) => (
                  <div key={t.id} className="ar-gallery-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.imageUrl} alt={t.prompt} />
                    <span className="ar-gallery-caption">{t.prompt.slice(0, 60)}</span>
                  </div>
                ))}
              </div>
            )}
            {turns.map((t) => {
              const isLast = t.id === lastTurnId;
              const turnModel = t.modelId ? getModel(t.modelId) : modelInfo;
              if (t.imageUrl && !t.streaming) return null;
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
                    {turnModel && !t.streaming && (
                      <div className="ar-image-turn-meta">
                        {turnModel.name}
                        <span className="powered-by"> · {turnModel.poweredBy}</span>
                      </div>
                    )}
                    {!t.streaming && t.response && (
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

          <div className="ar-chat-composer ar-image-composer ar-generator-composer">
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  placeholder="توضیح تصویری که می‌خوای…"
                  maxLength={4000}
                  disabled={submitting || enhancing}
                />
                <div className="ar-composer-foot ar-generator-foot">
                  <div className="ar-generator-model-row">
                    <ModelSelect
                      variant="bar"
                      value={imageModel}
                      onChange={setImageModel}
                      plan={plan}
                      imageGenOnly
                      sheetOnMobile
                      label="موتور"
                    />
                    {modelInfo && (
                      <span className="ar-image-tool-meta">
                        {perImageCost.toLocaleString("fa-IR")} کردیت
                      </span>
                    )}
                  </div>
                  <div className="ar-generator-toolbar-row">
                    <div className="ar-composer-toolstrip ar-image-toolstrip ar-generator-controls">
                      <button
                        type="button"
                        className={`ar-composer-tool-btn ar-composer-tool-primary${attachment ? " active" : ""}`}
                        disabled={uploading || submitting || Boolean(attachment)}
                        title="تصویر مرجع"
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
                      <select
                        className="ar-gen-select"
                        value={sizePreset}
                        onChange={(e) =>
                          setSizePreset(e.target.value as (typeof SIZE_PRESETS)[number]["id"])
                        }
                        aria-label="سایز"
                        disabled={submitting || enhancing}
                      >
                        {SIZE_PRESETS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                            {sizeHint(s.id)}
                          </option>
                        ))}
                      </select>
                      <select
                        className="ar-gen-select"
                        value={qualityPreset}
                        onChange={(e) =>
                          setQualityPreset(e.target.value as (typeof QUALITY_PRESETS)[number]["id"])
                        }
                        aria-label="کیفیت"
                        disabled={submitting || enhancing}
                      >
                        {QUALITY_PRESETS.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="ar-composer-actions">
                      <button
                        type="button"
                        className="ar-send-btn ar-send-btn--dock ar-generate-btn"
                        onClick={send}
                        disabled={!input.trim() || submitting || enhancing}
                        aria-label="تولید تصویر"
                      >
                        {submitting ? (
                          <span className="ar-spinner" style={{ borderTopColor: "#FCFBF7" }} />
                        ) : (
                          <>
                            <IconSend size={16} />
                            <span>تولید کن</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {err === "unauthorized" && (
              <div className="ar-composer-err ar-image-composer-err">
                برای ساخت تصویر{" "}
                <button
                  type="button"
                  className="ar-link-btn"
                  onClick={() => window.dispatchEvent(new Event("ai:open-login"))}
                >
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
                کردیت کافی نیست —{" "}
                <Link href="/ai/content-sales">Content & Sales Bundle</Link>
                {" · "}
                <Link href="/ai/pricing">خرید کردیت</Link>
              </div>
            )}
            {err === "ai_error" && (
              <div className="ar-composer-err ar-image-composer-err">
                ساخت تصویر با {modelInfo?.name ?? "این موتور"} ناموفق بود. موتور دیگر را امتحان کن.
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
