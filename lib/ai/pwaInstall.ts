import { captureAiEvent } from "@/lib/posthog/client";
import { getClientDeviceType } from "@/lib/aiTracking";

export type PwaInstallMilestone =
  | "first_answer"
  | "second_prompt"
  | "result_copied"
  | "compare_completed";

export type PwaInstallEntry = "sidebar" | "sheet" | "ios_guide";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" | string }>;
};

const KEYS = {
  firstAnswer: "ar-pwa-first-answer",
  engagement: "ar-pwa-engagement",
  sheetAutoShownSession: "ar-pwa-sheet-auto-session",
  dismiss: "ar-pwa-dismiss-v2",
  legacyDismiss: "ar-pwa-dismiss",
} as const;

const MILESTONE_EVENT = "ar:pwa-milestone";
const OPEN_SHEET_EVENT = "ar:pwa-open-sheet";

type DismissState = {
  count: number;
  until: number | null;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function flag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function setFlag(key: string) {
  try {
    localStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  const mq =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches;
  const ios =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

export function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isWebkit = /WebKit/i.test(ua);
  const isChromeOrFx = /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  return isIOS && isWebkit && !isChromeOrFx;
}

export function getDismissState(): DismissState {
  const parsed = readJson<DismissState>(KEYS.dismiss);
  if (parsed && typeof parsed.count === "number") {
    return {
      count: parsed.count,
      until: typeof parsed.until === "number" ? parsed.until : null,
    };
  }
  // migrate legacy permanent dismiss → treat as 1st dismiss still cooling for 7d from now? keep as count 1 until+7d
  try {
    if (localStorage.getItem(KEYS.legacyDismiss) === "1") {
      const migrated: DismissState = {
        count: 1,
        until: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
      writeJson(KEYS.dismiss, migrated);
      localStorage.removeItem(KEYS.legacyDismiss);
      return migrated;
    }
  } catch {
    /* ignore */
  }
  return { count: 0, until: null };
}

export function isAutoSheetSuppressed(): boolean {
  const { count, until } = getDismissState();
  if (count >= 3) return true;
  if (until && Date.now() < until) return true;
  return false;
}

/** Sidebar stays available even after 3 dismisses (until installed). */
export function canShowSidebarInstall(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandalonePwa()) return false;
  return Boolean(deferredPrompt) || isIosSafari();
}

export function canAutoShowInstallSheet(): boolean {
  if (!canShowSidebarInstall()) return false;
  if (isAutoSheetSuppressed()) return false;
  try {
    if (sessionStorage.getItem(KEYS.sheetAutoShownSession) === "1") return false;
  } catch {
    /* ignore */
  }
  return hasFirstAnswer() && hasEngagement();
}

export function hasFirstAnswer(): boolean {
  return flag(KEYS.firstAnswer);
}

export function hasEngagement(): boolean {
  return flag(KEYS.engagement);
}

export function recordDismiss(): DismissState {
  const prev = getDismissState();
  const nextCount = prev.count + 1;
  let until: number | null = null;
  if (nextCount === 1) until = Date.now() + 7 * 24 * 60 * 60 * 1000;
  else if (nextCount === 2) until = Date.now() + 30 * 24 * 60 * 60 * 1000;
  else until = null; // 3+: no auto sheet forever; sidebar only
  const next: DismissState = { count: nextCount, until };
  writeJson(KEYS.dismiss, next);
  return next;
}

export function markSheetAutoShown() {
  try {
    sessionStorage.setItem(KEYS.sheetAutoShownSession, "1");
  } catch {
    /* ignore */
  }
}

export function setDeferredInstallPrompt(e: BeforeInstallPromptEvent | null) {
  deferredPrompt = e;
}

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export function trackPwaEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  captureAiEvent(event, {
    device_type: getClientDeviceType(),
    platform: isIosSafari() ? "ios_safari" : "other",
    standalone: isStandalonePwa(),
    ...properties,
  });
}

export function notifyPwaMilestone(type: PwaInstallMilestone) {
  if (typeof window === "undefined") return;

  if (type === "first_answer") {
    if (!hasFirstAnswer()) setFlag(KEYS.firstAnswer);
  } else if (type === "compare_completed") {
    // Completing a compare is first value if none yet; otherwise engagement.
    if (!hasFirstAnswer()) setFlag(KEYS.firstAnswer);
    else setFlag(KEYS.engagement);
  } else {
    // second_prompt | result_copied — only count after first answer
    if (!hasFirstAnswer()) return;
    setFlag(KEYS.engagement);
  }

  window.dispatchEvent(new CustomEvent(MILESTONE_EVENT, { detail: { type } }));
}

export function openPwaInstallSheet(entry: PwaInstallEntry = "sheet") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(OPEN_SHEET_EVENT, { detail: { entry } })
  );
}

export function onPwaMilestone(handler: (type: PwaInstallMilestone) => void): () => void {
  const fn = (e: Event) => {
    const type = (e as CustomEvent<{ type: PwaInstallMilestone }>).detail?.type;
    if (type) handler(type);
  };
  window.addEventListener(MILESTONE_EVENT, fn);
  return () => window.removeEventListener(MILESTONE_EVENT, fn);
}

export function onPwaOpenSheet(
  handler: (entry: PwaInstallEntry) => void
): () => void {
  const fn = (e: Event) => {
    const entry =
      (e as CustomEvent<{ entry: PwaInstallEntry }>).detail?.entry || "sheet";
    handler(entry);
  };
  window.addEventListener(OPEN_SHEET_EVENT, fn);
  return () => window.removeEventListener(OPEN_SHEET_EVENT, fn);
}

export async function promptNativeInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const deferred = deferredPrompt;
  if (!deferred) return "unavailable";
  trackPwaEvent("pwa_native_prompt_shown");
  try {
    await deferred.prompt();
    const choice = await deferred.userChoice;
    deferredPrompt = null;
    if (choice.outcome === "accepted") {
      trackPwaEvent("pwa_install_accepted");
      return "accepted";
    }
    trackPwaEvent("pwa_install_dismissed", { source: "native_prompt" });
    return "dismissed";
  } catch {
    deferredPrompt = null;
    return "unavailable";
  }
}
