import { ADREADY_AUTH_ERRORS } from "@/lib/adreadyAuth";

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
  | { ok: true; user: AiAuthUser; referralCode?: string }
  | { ok: false; error: string; message: string };

type AiAuthApiResponse = {
  ok?: boolean;
  authed?: boolean;
  user?: AiAuthUser;
  referralCode?: string;
  error?: string;
};

function authErrorMessage(code: string | undefined): string {
  if (!code) return ADREADY_AUTH_ERRORS.default;
  return ADREADY_AUTH_ERRORS[code] ?? ADREADY_AUTH_ERRORS.default;
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
