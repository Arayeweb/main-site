/** Strip trailing slash and www — matches next.config.js canonical host (araaye.com). */
export function canonicalOrigin(url: string): string {
  return url.replace(/\/$/, "").replace(/^(https?:\/\/)www\./i, "$1");
}

/** Canonical site origin — no trailing slash, no www subdomain. */
export const SITE_URL = canonicalOrigin(
  process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com"
);

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
