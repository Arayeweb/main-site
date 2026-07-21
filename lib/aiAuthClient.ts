import { ADREADY_AUTH_ERRORS } from "@/lib/adreadyAuth";
import { aiAuthErrorMessage } from "@/lib/aiAuthErrors";
import type { AiOtpPurpose } from "@/lib/aiOtp";

export type AiAuthUser = {
  id: string;
  plan: string;
  credits: number;
};

export type AiAuthCheckResult = {
  authed: boolean;
  user?: AiAuthUser;
};

export type AiAuthActionResult =
  | { ok: true; user: AiAuthUser; referralCode?: string; isNewUser?: boolean }
  | { ok: false; error: string; message: string; retryAfterSec?: number };

export type AiOtpSendResult =
  | {
      ok: true;
      expiresAt: string;
      resendAfterSec: number;
      debugCode?: string;
    }
  | { ok: false; error: string; message: string; retryAfterSec?: number };

type AiAuthApiResponse = {
  ok?: boolean;
  authed?: boolean;
  user?: AiAuthUser;
  referralCode?: string;
  isNewUser?: boolean;
  error?: string;
  retryAfterSec?: number;
  expiresAt?: string;
  resendAfterSec?: number;
  debugCode?: string;
};

function authErrorMessage(code: string | undefined): string {
  if (!code) return ADREADY_AUTH_ERRORS.default;
  return aiAuthErrorMessage(code);
}

async function parseAuthResponse(res: Response): Promise<AiAuthApiResponse | null> {
  return (await res.json().catch(() => null)) as AiAuthApiResponse | null;
}

export async function checkAiAuth(): Promise<AiAuthCheckResult> {
  const res = await fetch("/api/ai/auth", {
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await parseAuthResponse(res);
  if (!data?.ok || !data.authed || !data.user) {
    return { authed: false };
  }
  return { authed: true, user: data.user };
}

export async function loginAiUser(input: {
  phone: string;
  password: string;
}): Promise<AiAuthActionResult> {
  const res = await fetch("/api/ai/auth", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      phone: input.phone.trim(),
      password: input.password,
    }),
  });
  const data = await parseAuthResponse(res);
  if (!res.ok || !data?.ok || !data.user) {
    const code = data?.error ?? "default";
    return { ok: false, error: code, message: authErrorMessage(code) };
  }
  return { ok: true, user: data.user };
}

export async function registerAiUser(input: {
  phone: string;
  password: string;
  utm?: {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
  };
}): Promise<AiAuthActionResult> {
  const res = await fetch("/api/ai/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      phone: input.phone.trim(),
      password: input.password,
      ...input.utm,
    }),
  });
  const data = await parseAuthResponse(res);
  if (!res.ok || !data?.ok || !data.user) {
    const code = data?.error ?? "default";
    return { ok: false, error: code, message: authErrorMessage(code) };
  }
  return {
    ok: true,
    user: data.user,
    referralCode: data.referralCode,
  };
}

export async function sendAiOtp(input: {
  phone: string;
  purpose: AiOtpPurpose;
}): Promise<AiOtpSendResult> {
  const res = await fetch("/api/ai/auth/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      phone: input.phone.trim(),
      purpose: input.purpose,
    }),
  });
  const data = await parseAuthResponse(res);
  if (!res.ok || !data?.ok) {
    const code = data?.error ?? "default";
    return {
      ok: false,
      error: code,
      message: authErrorMessage(code),
      retryAfterSec: data?.retryAfterSec,
    };
  }
  return {
    ok: true,
    expiresAt: data.expiresAt ?? new Date(Date.now() + 5 * 60_000).toISOString(),
    resendAfterSec: data.resendAfterSec ?? 120,
    debugCode: data.debugCode,
  };
}

export async function verifyAiOtp(input: {
  phone: string;
  code: string;
  purpose: AiOtpPurpose;
  password?: string;
  utm?: {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
  };
}): Promise<AiAuthActionResult> {
  const res = await fetch("/api/ai/auth/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      phone: input.phone.trim(),
      code: input.code.trim(),
      purpose: input.purpose,
      password: input.password,
      ...input.utm,
    }),
  });
  const data = await parseAuthResponse(res);
  if (!res.ok || !data?.ok || !data.user) {
    const code = data?.error ?? "default";
    return { ok: false, error: code, message: authErrorMessage(code) };
  }
  return {
    ok: true,
    user: data.user,
    referralCode: data.referralCode,
    isNewUser: data.isNewUser,
  };
}
