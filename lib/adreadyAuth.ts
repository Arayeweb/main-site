export type AdReadyAuthMode = "register" | "login";

export const ADREADY_AUTH_DEFAULT_DESTINATIONS: Record<AdReadyAuthMode, string> = {
  register: "/dashboard/adready/new",
  login: "/dashboard/adready/pages",
};

const ADREADY_NEXT_PREFIXES = ["/dashboard/adready/", "/campaign/"] as const;

export const ADREADY_AUTH_ERRORS: Record<string, string> = {
  phone_taken: "این شماره قبلاً ثبت‌نام کرده — وارد شو.",
  invalid_credentials: "شماره یا رمز اشتباه است.",
  invalid_phone: "شماره موبایل معتبر نیست.",
  password_too_short: "رمز باید حداقل ۶ کاراکتر باشد.",
  rate_limited: "تلاش زیاد؛ یک دقیقه بعد دوباره امتحان کن.",
  missing_fields: "شماره و رمز را وارد کن.",
  default: "خطایی پیش آمد. دوباره تلاش کن.",
};

export function sanitizeNextParam(next: string | null | undefined): string | null {
  if (!next) return null;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (trimmed.includes("\\") || trimmed.includes("\0")) return null;
  return trimmed;
}

export function isAllowedAdReadyNext(next: string): boolean {
  return ADREADY_NEXT_PREFIXES.some((prefix) => next.startsWith(prefix));
}

export function resolveAdReadyAuthRedirect(
  mode: AdReadyAuthMode,
  next?: string | null,
): string {
  const safeNext = sanitizeNextParam(next);
  if (safeNext && isAllowedAdReadyNext(safeNext)) {
    return safeNext;
  }
  return ADREADY_AUTH_DEFAULT_DESTINATIONS[mode];
}

export function buildAdReadyLoginUrl(options?: {
  mode?: AdReadyAuthMode;
  next?: string | null;
}): string {
  const params = new URLSearchParams();
  const mode = options?.mode ?? "register";
  params.set("mode", mode);

  const safeNext = sanitizeNextParam(options?.next);
  if (safeNext && isAllowedAdReadyNext(safeNext)) {
    params.set("next", safeNext);
  }

  return `/adready/login?${params.toString()}`;
}

export function parseAdReadyAuthMode(value: string | null | undefined): AdReadyAuthMode {
  return value === "login" ? "login" : "register";
}
