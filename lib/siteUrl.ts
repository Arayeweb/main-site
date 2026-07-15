/**
 * Central site origin for SEO, sitemap, canonical, Schema, and Open Graph.
 *
 * CRITICAL: Do NOT derive this from NEXT_PUBLIC_SITE_URL in production.
 * A masked/corrupt env value (e.g. https://••••••••••••••••••••••) becomes
 * punycode xn--nvgaaaaaaaaaaaaaaaaaaaaa and poisons every absolute URL.
 */
export const SITE_URL = "https://araaye.com" as const;

/** Alias — same fixed marketing origin. */
export const PRODUCTION_SITE_URL = SITE_URL;

/** Strip trailing slash and www — matches next.config.js canonical host. */
export function canonicalOrigin(url: string): string {
  let normalized = url
    .trim()
    .replace(/\/$/, "")
    .replace(/^(https?:\/\/)www\./i, "$1");

  if (normalized && !/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  return normalized;
}

/**
 * Origins that must never appear in SEO or production absolute URLs.
 * Catches: bullet-masked secrets (•), punycode, www, legacy domain, Vercel, localhost.
 */
export function isUnsafePublicOrigin(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;

  // Masked env paste / any non-ASCII → IDN/punycode hostnames
  if (/[^\u0000-\u007F]/.test(trimmed)) return true;
  if (/[•●◦‣⁃∙·]/.test(trimmed)) return true;

  const lower = trimmed.toLowerCase();
  if (lower.includes("xn--")) return true;
  if (/\/\/www\./i.test(lower) || lower.startsWith("www.")) return true;
  if (lower.includes("arayeweb.com")) return true;
  if (lower.includes("vercel.app")) return true;
  if (lower.includes("localhost") || lower.includes("127.0.0.1")) return true;

  try {
    const parsed = new URL(canonicalOrigin(trimmed));
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return true;
    if (!/^[a-z0-9.-]+$/i.test(parsed.hostname)) return true;
    if (parsed.hostname.includes("xn--")) return true;
  } catch {
    return true;
  }

  return false;
}

function isProductionRuntime(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview")
  );
}

/**
 * Runtime origin for payments/webhooks/internal links.
 * Production always returns SITE_URL so a corrupt NEXT_PUBLIC_SITE_URL cannot leak.
 * Non-production may use a safe localhost / preview override.
 */
export function resolvePublicOrigin(): string {
  if (isProductionRuntime()) return SITE_URL;

  const fromPublic = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromPublic) {
    // Dev may use localhost — allow only that class of override outside production.
    const lower = fromPublic.toLowerCase();
    const isLocal =
      lower.includes("localhost") ||
      lower.includes("127.0.0.1") ||
      lower.startsWith("http://192.168.");
    if (isLocal) return canonicalOrigin(fromPublic);
    if (!isUnsafePublicOrigin(fromPublic)) {
      const origin = canonicalOrigin(fromPublic);
      if (origin === SITE_URL) return origin;
    }
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel && !vercel.includes("xn--") && !/[^\u0000-\u007F]/.test(vercel)) {
    return `https://${vercel.replace(/^https?:\/\//i, "").replace(/\/$/, "")}`;
  }

  return SITE_URL;
}

/** Normalize a path: leading slash, no trailing slash (except root). */
export function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  const trimmed = withLeading.replace(/\/+$/, "");
  return trimmed || "/";
}

/** Absolute URL for a site path (no trailing slash on non-root paths). Always SITE_URL. */
export function absoluteUrl(path: string = "/"): string {
  const normalized = normalizePath(path);
  return normalized === "/" ? SITE_URL : `${SITE_URL}${normalized}`;
}

/** Canonical URL for a page — same as absoluteUrl (site uses no trailing slashes). */
export function canonicalUrl(path: string = "/"): string {
  return absoluteUrl(path);
}
