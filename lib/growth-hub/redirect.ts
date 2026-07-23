// Safe redirect validation — prevents open redirects. Only same-origin paths
// under the Growth Hub client area are allowed as post-login destinations.

/**
 * Returns a safe internal path or the fallback. Rejects:
 * - absolute URLs (http://, https://, //host)
 * - protocol-relative / backslash tricks
 * - paths outside the /app area
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback = "/app/select-workspace",
): string {
  if (!next || typeof next !== "string") return fallback;

  // Must be a root-relative path.
  if (!next.startsWith("/")) return fallback;
  // Reject protocol-relative ("//evil.com") and backslash variants.
  if (next.startsWith("//") || next.startsWith("/\\") || next.includes("\\")) {
    return fallback;
  }
  // Reject embedded scheme or control chars.
  if (/[\x00-\x1f]/.test(next) || next.includes("://")) return fallback;

  // Constrain to the client portal surface.
  const pathname = next.split("?")[0].split("#")[0];
  if (pathname !== "/app" && !pathname.startsWith("/app/")) return fallback;

  return next;
}
