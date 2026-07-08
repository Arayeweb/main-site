/**
 * نرمال‌سازی فیلد page برای attribution لید.
 * مسیرهای Programmatic SEO/Website را به شکل service/industry نگه می‌دارد
 * و لیبل‌های قدیمی لندینگ‌ها (seo, doctors, ...) را حفظ می‌کند.
 */
export function pageFromPath(p: unknown): string | null {
  const raw = String(p ?? "").trim();
  if (!raw || raw === "/") return "index";

  // query / hash را حذف می‌کنیم؛ اسلش انتهایی را نرم می‌کنیم
  const withoutExtras = raw.split("?")[0].split("#")[0].replace(/\/+$/, "");
  const path = withoutExtras.startsWith("/") ? withoutExtras : `/${withoutExtras}`;

  // اولویت ۱: صفحات programmatic — /seo/doctor → seo/doctor ، /website/clinic → website/clinic
  const industry = path.match(/^\/(seo|website)\/([a-z0-9-]+)$/i);
  if (industry) {
    return `${industry[1].toLowerCase()}/${industry[2].toLowerCase()}`;
  }

  // اولویت ۲: لندینگ‌های شناخته‌شده (رفتار قبلی؛ بدون شکستن منبع‌های موجود)
  // مثال: /seo → seo ، /doctors → doctors ، /clinic → clinic
  const legacyExact = path.match(/^\/(clinic|doctors|restaurant|googlesabt|seo|bizcard)(?:\/.*)?$/i);
  if (legacyExact) {
    return legacyExact[1].toLowerCase();
  }

  // اولویت ۳: match شل مثل قبل — وقتی page به صورت لیبل خام می‌آید (مثلاً "seo" یا "doctors")
  const loose = raw.match(/\b(index|clinic|doctors|restaurant|googlesabt|seo|bizcard)\b/i);
  if (loose) {
    return loose[1].toLowerCase();
  }

  // fallback امن: path خام (بدون / اول) تا attribution از بین نرود
  const fallback = path.replace(/^\//, "").slice(0, 200).trim();
  return fallback || "index";
}
