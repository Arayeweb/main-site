// Pure invite-expiration helpers (unit-testable; mirrors the DB checks in
// gh_accept_invite / gh_peek_invite which use expires_at > now()).

const DAY_MS = 24 * 60 * 60 * 1000;

/** ISO timestamp `days` days from `now`. */
export function computeInviteExpiresAt(days: number, now: number = Date.now()): string {
  return new Date(now + days * DAY_MS).toISOString();
}

/** True when the invite is expired at `now` (inclusive of the exact boundary). */
export function isInviteExpired(
  expiresAt: string,
  now: number = Date.now(),
): boolean {
  const ts = new Date(expiresAt).getTime();
  if (Number.isNaN(ts)) return true; // malformed → treat as expired (fail safe)
  return ts <= now;
}
