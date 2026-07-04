"use client";

export type MediaStage = "submit" | "queue" | "processing" | "ready";

const STAGES: { id: MediaStage; label: string }[] = [
  { id: "queue", label: "در صف" },
  { id: "processing", label: "پردازش" },
  { id: "ready", label: "آماده" },
];

function stageFromStatus(statusText?: string, streaming?: boolean): MediaStage {
  if (!streaming) return "ready";
  const t = (statusText || "").toLowerCase();
  if (t.includes("آماده") || t.includes("دانلود")) return "ready";
  if (t.includes("ارسال")) return "submit";
  if (t.includes("صف")) return "queue";
  return "processing";
}

export default function MediaProgressStages({
  statusText,
  streaming = false,
}: {
  statusText?: string;
  streaming?: boolean;
}) {
  const active = stageFromStatus(statusText, streaming);
  const activeIdx = STAGES.findIndex((s) => s.id === active);

  return (
    <div className="ar-media-stages" role="status" aria-live="polite">
      {STAGES.map((s, i) => {
        const done = i < activeIdx || active === "ready";
        const current = s.id === active && active !== "ready";
        return (
          <div
            key={s.id}
            className={`ar-media-stage${done ? " done" : ""}${current ? " active" : ""}`}
          >
            <span className="ar-media-stage-dot" aria-hidden />
            <span className="ar-media-stage-label">{s.label}</span>
          </div>
        );
      })}
      {statusText && <p className="ar-media-stage-detail">{statusText}</p>}
    </div>
  );
}
