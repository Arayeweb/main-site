"use client";

import { IconLayout } from "./icons";
import type { WorkspaceMode } from "./ModeSelector";

/**
 * Calm pre-send empty state for the result area. Shown only before the user
 * has sent a message — no skeletons, no fake cards. Real generation states
 * are rendered by DirectChatView / CompareSessionView once a session starts.
 */
export default function ResultPreview({ mode }: { mode: WorkspaceMode }) {
  const text =
    mode === "side_by_side"
      ? "بعد از ارسال، جواب مدل‌ها را کنار هم می‌بینی."
      : mode === "battle"
        ? "چند AI جواب را بررسی می‌کنند و جمع‌بندی نهایی می‌سازند."
        : "مثال: برای پیج اینستاگرامم ۱۰ ایده ریلز بده.";
  return (
    <div className="ar-result-empty" role="status">
      <span className="ar-result-empty-icon" aria-hidden>
        <IconLayout size={14} />
      </span>
      <p className="ar-result-empty-text">{text}</p>
    </div>
  );
}
