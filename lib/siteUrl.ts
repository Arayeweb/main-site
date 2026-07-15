/** Strip trailing slash and www — matches next.config.js canonical host (araaye.com). */
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

/** Canonical production origin — never punycode, never www, never localhost. */
export const PRODUCTION_SITE_URL = "https://araaye.com";

function isUnsafeCanonicalOrigin(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("xn--") ||
    lower.includes("localhost") ||
    /\/\/www\./i.test(lower) ||
    lower.includes("arayeweb.com")
  );
}

function resolveSiteUrlFromEnv(): string {
  const fromPublic = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromPublic && !isUnsafeCanonicalOrigin(fromPublic)) {
    return fromPublic;
  }

  // Production builds always canonicalize to araaye.com regardless of preview host.
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return PRODUCTION_SITE_URL;
}

/** Canonical site origin — no trailing slash, no www subdomain. */
export const SITE_URL = canonicalOrigin(resolveSiteUrlFromEnv());

/** Normalize a path: leading slash, no trailing slash (except root). */
export function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  const trimmed = withLeading.replace(/\/+$/, "");
  return trimmed || "/";
}

/** Absolute URL for a site path (no trailing slash on non-root paths). */
export function absoluteUrl(path: string = "/"): string {
  const normalized = normalizePath(path);
  return normalized === "/" ? SITE_URL : `${SITE_URL}${normalized}`;
}

/** Canonical URL for a page — same as absoluteUrl (site uses no trailing slashes). */
export function canonicalUrl(path: string = "/"): string {
  return absoluteUrl(path);
}
