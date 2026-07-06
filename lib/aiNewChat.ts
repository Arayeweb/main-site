export const AI_NEW_CHAT_EVENT = "ai:new-chat";
export const AI_ANALYZE_TEXT_EVENT = "ai:analyze-text";
const FOCUS_COMPOSER_KEY = "ai:focus-composer";
const ANALYZE_TEXT_KEY = "ai:analyze-text";

export const ANALYZE_TEXT_PROMPT =
  "این متن را تحلیل کن و نکات مهم، لحن و پیشنهاد بهبود را بگو:\n\n";

function isAiHome(path: string) {
  return path === "/ai" || path === "/ai/";
}

/** Start a fresh conversation — navigates to /ai from other routes or resets inline session on home. */
export function requestNewChat(options?: {
  pathname?: string;
  navigate?: (path: string) => void;
}) {
  if (typeof window === "undefined") return;

  const path = options?.pathname ?? window.location.pathname;

  if (!isAiHome(path)) {
    try {
      sessionStorage.setItem(FOCUS_COMPOSER_KEY, "1");
    } catch {
      /* ignore */
    }
    if (options?.navigate) options.navigate("/ai");
    else window.location.assign("/ai");
    return;
  }

  window.dispatchEvent(new CustomEvent(AI_NEW_CHAT_EVENT));
}

export function consumeComposerFocusFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (!sessionStorage.getItem(FOCUS_COMPOSER_KEY)) return false;
    sessionStorage.removeItem(FOCUS_COMPOSER_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Sidebar / deep-link: open /ai with the text-analysis starter prompt. */
export function requestAnalyzeText(options?: {
  pathname?: string;
  navigate?: (path: string) => void;
}) {
  if (typeof window === "undefined") return;

  const path = options?.pathname ?? window.location.pathname;

  try {
    sessionStorage.setItem(ANALYZE_TEXT_KEY, "1");
    sessionStorage.setItem(FOCUS_COMPOSER_KEY, "1");
  } catch {
    /* ignore */
  }

  if (!isAiHome(path)) {
    if (options?.navigate) options.navigate("/ai");
    else window.location.assign("/ai");
    return;
  }

  window.dispatchEvent(new CustomEvent(AI_ANALYZE_TEXT_EVENT));
}

export function consumeAnalyzeTextFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (!sessionStorage.getItem(ANALYZE_TEXT_KEY)) return false;
    sessionStorage.removeItem(ANALYZE_TEXT_KEY);
    return true;
  } catch {
    return false;
  }
}
