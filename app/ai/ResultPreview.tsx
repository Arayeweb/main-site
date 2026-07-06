"use client";

import { IconLayout } from "./icons";

/**
 * Calm pre-send empty state for the result area. Shown only before the user
 * has sent a message — no skeletons, no fake cards. Real generation states
 * are rendered by DirectChatView / CompareSessionView once a session starts.
 */
export default function ResultPreview() {
  return (
    <div className="ar-result-empty" role="status">
      <span className="ar-result-empty-icon" aria-hidden>
        <IconLayout size={14} />
      </span>
      <p className="ar-result-empty-text">
        بعد از ارسال، پاسخ مدل‌ها اینجا همزمان نمایش داده می‌شود.
      </p>
    </div>
  );
}
