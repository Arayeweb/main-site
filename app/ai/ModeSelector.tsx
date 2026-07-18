"use client";

import { IconBolt, IconColumns, IconSpark, IconLock } from "./icons";

export type WorkspaceMode = "direct" | "side_by_side" | "battle";

const MODE_ITEMS: {
  id: WorkspaceMode;
  label: string;
  compactLabel: string;
  desc: string;
  Icon: typeof IconBolt;
}[] = [
  {
    id: "direct",
    label: "سریع",
    compactLabel: "سریع",
    desc: "یک مدل، پاسخ فوری",
    Icon: IconBolt,
  },
  {
    id: "side_by_side",
    label: "مقایسه",
    compactLabel: "مقایسه",
    desc: "چند مدل، پاسخ کنار هم",
    Icon: IconColumns,
  },
  {
    id: "battle",
    label: "همفکری",
    compactLabel: "همفکری",
    desc: "چند AI، نقد و جمع‌بندی بهتر",
    Icon: IconSpark,
  },
];

/**
 * ChatGPT-style pill toggle for workspace modes (سریع / مقایسه / همفکری).
 * Presentational only — request flow stays in ArenaHomePage.
 */
export default function ModeSelector({
  value,
  onChange,
  isLocked,
  compact,
}: {
  value: WorkspaceMode;
  onChange: (mode: WorkspaceMode) => void;
  isLocked: (mode: WorkspaceMode) => boolean;
  /** shorter labels on narrow layouts */
  compact?: boolean;
}) {
  return (
    <div className="ar-mode-selector">
      <div className="ar-mode-segmented" role="tablist" aria-label="انتخاب حالت گفتگو">
        {MODE_ITEMS.map((m) => {
          const isActive = value === m.id;
          const locked = isLocked(m.id);
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`ar-mode-seg${isActive ? " active" : ""}${locked ? " locked" : ""}`}
              onClick={() => onChange(m.id)}
            >
              <m.Icon size={13} />
              <span className="ar-mode-seg-label">{compact ? m.compactLabel : m.label}</span>
              {locked && (
                <span className="ar-mode-seg-lock" aria-hidden>
                  <IconLock size={9} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
