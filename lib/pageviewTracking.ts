import { getUtmParams } from "@/lib/utm";

const VISITOR_ID_KEY = "__ary_visitor_id";

/** UUID v4 ساده بدون dependency */
function genUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** visitor_id ثابت در localStorage — یک‌بار ساخته می‌شود و باقی می‌ماند */
export function getVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = genUuid();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/** ثبت بازدید — الگوی main.js با گارد ضد ثبت تکراری */
export function recordPageview(page: string) {
  if (typeof window === "undefined") return;

  const dedupKey = `__pv_seen_${page}`;
  try {
    const last = Number(sessionStorage.getItem(dedupKey) || 0);
    if (Date.now() - last < 1500) return;
    sessionStorage.setItem(dedupKey, String(Date.now()));
  } catch {
    /* ignore */
  }

  const utm = getUtmParams();
  const visitorId = getVisitorId();
  fetch("/api/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page,
      referrer: document.referrer || "",
      visitor_id: visitorId,
      ...utm,
    }),
    keepalive: true,
  }).catch(() => {});
}
