import { randomBytes, createHash, timingSafeEqual } from "crypto";

// Invitation tokens: a high-entropy secret is generated once and shown only in
// the invite URL. Only its SHA-256 hash is persisted (gh_workspace_invites.token_hash).
// The raw token is never stored or logged (EVENT-CATALOG forbids it).

const TOKEN_BYTES = 32; // 256 bits of entropy

function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Generates a URL-safe raw invite token. */
export function generateInviteToken(): string {
  return base64url(randomBytes(TOKEN_BYTES));
}

/** SHA-256 hash (hex) of a raw token — the only value persisted. */
export function hashInviteToken(rawToken: string): string {
  return createHash("sha256").update(String(rawToken)).digest("hex");
}

/** Timing-safe comparison of a raw token against a stored hash. */
export function verifyInviteToken(rawToken: string, storedHash: string): boolean {
  if (!rawToken || !storedHash) return false;
  const computed = Buffer.from(hashInviteToken(rawToken), "hex");
  let expected: Buffer;
  try {
    expected = Buffer.from(storedHash, "hex");
  } catch {
    return false;
  }
  return (
    computed.length === expected.length && timingSafeEqual(computed, expected)
  );
}
