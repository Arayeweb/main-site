// =========================================================
// System prompt حالت compare — هر دو مدل همان prompt پایه را می‌گیرند
// تا مقایسه منصفانه باشد.
// =========================================================

import { DIRECT_SYSTEM_PROMPT, WEB_SEARCH_SUFFIX } from "./direct";

export function compareSystemPrompt(opts?: { webSearch?: boolean }): string {
  return opts?.webSearch
    ? `${DIRECT_SYSTEM_PROMPT}\n\n${WEB_SEARCH_SUFFIX}`
    : DIRECT_SYSTEM_PROMPT;
}
