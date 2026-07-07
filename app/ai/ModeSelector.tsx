"use client";

import { IconChat, IconColumns, IconSpark, IconLock } from "./icons";

export type WorkspaceMode = "direct" | "side_by_side" | "battle";

const MODE_ITEMS: {
  id: WorkspaceMode;
  label: string;
  compactLabel: string;
  desc: string;
  Icon: typeof IconChat;
}[] = [
  { id: "direct", label: "سریع", compactLabel: "سریع", desc: "یک مدل، پاسخ فوری", Icon: IconChat },
  { id: "side_by_side", label: "مقایسه", compactLabel: "مقایسه", desc: "چند مدل، پاسخ کنار هم", Icon: IconColumns },
  { id: "battle", label: "همفکری AIها", compactLabel: "همفکری", desc: "چند AI، نقد و جمع‌بندی بهتر", Icon: IconSpark },
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
}: {
  value: WorkspaceMode;
  onChange: (mode: WorkspaceMode) => void;
  /** returns true if this mode requires a plan upgrade for the current user */
  isLocked: (mode: WorkspaceMode) => boolean;
  /** use shorter labels for narrow (mobile) layouts */
  compact?: boolean;
}) {
  const active = MODE_ITEMS.find((m) => m.id === value) ?? MODE_ITEMS[0];

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
              className={`ar-mode-seg${isActive ? " active" : ""}`}
              onClick={() => onChange(m.id)}
            >
              <m.Icon size={14} />
              <span className="ar-mode-seg-label">{compact ? m.compactLabel : m.label}</span>
              {locked && (
                <span className="ar-mode-seg-pro" aria-hidden>
                  <IconLock size={8} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="ar-mode-caption">{active.desc}</p>
    </div>
  );
}
