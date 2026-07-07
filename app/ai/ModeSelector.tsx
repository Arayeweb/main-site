"use client";

import { IconChat, IconColumns, IconSpark, IconLock } from "./icons";

export type WorkspaceMode = "direct" | "side_by_side" | "battle";

const MODE_ITEMS: {
  id: WorkspaceMode;
  label: string;
  compactLabel: string;
  desc: string;
  mobileCaption: string;
  Icon: typeof IconChat;
}[] = [
  {
    id: "direct",
    label: "سریع",
    compactLabel: "سریع",
    desc: "یک مدل، پاسخ فوری",
    mobileCaption: "مناسب پاسخ‌های روزمره",
    Icon: IconChat,
  },
  {
    id: "side_by_side",
    label: "مقایسه",
    compactLabel: "مقایسه",
    desc: "چند مدل، پاسخ کنار هم",
    mobileCaption: "پاسخ چند مدل کنار هم",
    Icon: IconColumns,
  },
  {
    id: "battle",
    label: "همفکری AIها",
    compactLabel: "همفکری",
    desc: "چند AI، نقد و جمع‌بندی بهتر",
    mobileCaption: "چند AI بررسی و جمع‌بندی می‌کنند",
    Icon: IconSpark,
  },
];

/**
 * Compact, equal-width segmented control for the three workspace modes.
 * Purely presentational + selection; the actual request/response flow is
 * unchanged (direct -> DirectChatView, side_by_side/battle -> CompareSessionView).
 * A single shared caption below the row shows the active mode's description,
 * keeping all three segments the same compact size instead of stacking a
 * description inside every item.
 */
export default function ModeSelector({
  value,
  onChange,
  isLocked,
  compact,
  variant = "segmented",
}: {
  value: WorkspaceMode;
  onChange: (mode: WorkspaceMode) => void;
  /** returns true if this mode requires a plan upgrade for the current user */
  isLocked: (mode: WorkspaceMode) => boolean;
  /** use shorter labels for narrow (mobile) layouts */
  compact?: boolean;
  /** segmented = desktop bar; pills = compact mobile chips */
  variant?: "segmented" | "pills";
}) {
  const active = MODE_ITEMS.find((m) => m.id === value) ?? MODE_ITEMS[0];
  const caption = variant === "pills" ? active.mobileCaption : active.desc;
  const usePills = variant === "pills";

  return (
    <div className={`ar-mode-selector${usePills ? " ar-mode-selector--pills" : ""}`}>
      <div
        className={usePills ? "ar-mode-pills" : "ar-mode-segmented"}
        role="tablist"
        aria-label="انتخاب حالت گفتگو"
      >
        {MODE_ITEMS.map((m) => {
          const isActive = value === m.id;
          const locked = isLocked(m.id);
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={
                usePills
                  ? `ar-mode-pill${isActive ? " active" : ""}${locked ? " locked" : ""}`
                  : `ar-mode-seg${isActive ? " active" : ""}`
              }
              onClick={() => onChange(m.id)}
            >
              {!usePills && <m.Icon size={14} />}
              <span className={usePills ? "ar-mode-pill-label" : "ar-mode-seg-label"}>
                {compact || usePills ? m.compactLabel : m.label}
              </span>
              {locked && (
                <span className={usePills ? "ar-mode-pill-lock" : "ar-mode-seg-pro"} aria-hidden>
                  <IconLock size={usePills ? 9 : 8} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="ar-mode-caption">{caption}</p>
    </div>
  );
}
