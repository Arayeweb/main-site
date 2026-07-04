import { getUtmParams } from "@/lib/utm";

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
  fetch("/api/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page,
      referrer: document.referrer || "",
      ...utm,
    }),
    keepalive: true,
  }).catch(() => {});
}
