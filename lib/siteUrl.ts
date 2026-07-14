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

function resolveSiteUrlFromEnv(): string {
  const fromPublic = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromPublic) return fromPublic;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "https://araaye.com";
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
