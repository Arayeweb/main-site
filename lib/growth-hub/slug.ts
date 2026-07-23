// Workspace slug normalization + validation. Slugs are lowercase, hyphen
// separated, [a-z0-9-], 2..63 chars, matching the DB CHECK constraint in
// 20260741_gh_foundation.sql.

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MIN = 2;
export const SLUG_MAX = 63;

/**
 * Normalizes arbitrary input toward a valid slug. Persian/Arabic letters are
 * not transliterated (out of scope) — callers should supply an ASCII slug or a
 * name that contains latin characters. Returns "" when nothing usable remains.
 */
export function normalizeSlug(input: string): string {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\u200c\s_]+/g, "-") // ZWNJ, whitespace, underscore → hyphen
    .replace(/[^a-z0-9-]/g, "") // drop everything else
    .replace(/-+/g, "-") // collapse repeats
    .replace(/^-+|-+$/g, "") // trim hyphens
    .slice(0, SLUG_MAX);
}

export function isValidSlug(slug: string): boolean {
  return (
    typeof slug === "string" &&
    slug.length >= SLUG_MIN &&
    slug.length <= SLUG_MAX &&
    SLUG_PATTERN.test(slug)
  );
}
