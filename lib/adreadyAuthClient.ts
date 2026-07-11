import { ADREADY_AUTH_ERRORS } from "@/lib/adreadyAuth";

export type AdReadyAuthUser = {
  id: string;
  phoneMasked?: string;
};

export type AdReadyAuthCheckResult = {
  authed: boolean;
  user?: AdReadyAuthUser;
};

export type AdReadyAuthActionResult =
  | { ok: true; user: AdReadyAuthUser }
  | { ok: false; error: string; message: string };

type AdReadyAuthApiResponse = {
  ok?: boolean;
  authed?: boolean;
  user?: AdReadyAuthUser;
  error?: string;
};

function authErrorMessage(code: string | undefined): string {
  if (!code) return ADREADY_AUTH_ERRORS.default;
  return ADREADY_AUTH_ERRORS[code] ?? ADREADY_AUTH_ERRORS.default;
}

async function parseAuthResponse(res: Response): Promise<AdReadyAuthApiResponse | null> {
  return (await res.json().catch(() => null)) as AdReadyAuthApiResponse | null;
}

export async function checkAdReadyAuth(): Promise<AdReadyAuthCheckResult> {
  const res = await fetch("/api/adready/auth", {
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await parseAuthResponse(res);
  if (!data?.ok || !data.authed || !data.user) {
    return { authed: false };
  }
  return { authed: true, user: data.user };
}

export async function loginAdReadyUser(input: {
  phone: string;
  password: string;
}): Promise<AdReadyAuthActionResult> {
  const res = await fetch("/api/adready/auth", {
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

export async function registerAdReadyUser(input: {
  phone: string;
  password: string;
  utm?: {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
  };
}): Promise<AdReadyAuthActionResult> {
  const res = await fetch("/api/adready/auth", {
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
  return { ok: true, user: data.user };
}
