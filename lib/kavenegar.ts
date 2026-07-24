/**
 * Kavenegar Verify Lookup — https://kavenegar.com/rest.html#sms-Lookup
 * POST/GET https://api.kavenegar.com/v1/{API-KEY}/verify/lookup.json
 */

export type KavenegarLookupResult =
  | { ok: true; messageId?: number; status?: number }
  | { ok: false; error: string; status?: number; message?: string };

type KavenegarLookupResponse = {
  return?: { status?: number; message?: string };
  entries?: Array<{
    messageid?: number;
    status?: number;
    statustext?: string;
  }> | null;
};

export function getKavenegarApiKey(): string | null {
  const key = process.env.KAVENEGAR_API_KEY?.trim();
  return key || null;
}

export function getKavenegarOtpTemplate(): string {
  return process.env.KAVENEGAR_OTP_TEMPLATE?.trim() || "otp1";
}

/** Send OTP via template Lookup. `token` must not contain spaces. */
export async function sendKavenegarLookup(input: {
  receptor: string;
  token: string;
  template?: string;
}): Promise<KavenegarLookupResult> {
  const apiKey = getKavenegarApiKey();
  if (!apiKey) {
    return { ok: false, error: "kavenegar_not_configured" };
  }

  const template = input.template?.trim() || getKavenegarOtpTemplate();
  const url = new URL(
    `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/verify/lookup.json`
  );
  url.searchParams.set("receptor", input.receptor);
  url.searchParams.set("token", input.token);
  url.searchParams.set("template", template);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    console.error("[kavenegar] lookup network error", e);
    return { ok: false, error: "kavenegar_network" };
  }

  let data: KavenegarLookupResponse | null = null;
  try {
    data = (await res.json()) as KavenegarLookupResponse;
  } catch {
    return { ok: false, error: "kavenegar_bad_response", status: res.status };
  }

  const status = data.return?.status;
  if (status !== 200) {
    console.error("[kavenegar] lookup failed", {
      status,
      message: data.return?.message,
      http: res.status,
    });
    return {
      ok: false,
      error: mapKavenegarStatus(status),
      status,
      message: data.return?.message,
    };
  }

  const entry = Array.isArray(data.entries) ? data.entries[0] : undefined;
  return {
    ok: true,
    messageId: entry?.messageid,
    status: entry?.status,
  };
}

/**
 * Plain SMS send (invite links, etc.).
 * https://kavenegar.com/rest.html#sms-send
 * Receptor should be local 09… or E.164; Kavenegar accepts both.
 */
export async function sendKavenegarSms(input: {
  receptor: string;
  message: string;
}): Promise<KavenegarLookupResult> {
  const apiKey = getKavenegarApiKey();
  if (!apiKey) {
    return { ok: false, error: "kavenegar_not_configured" };
  }

  const url = new URL(
    `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/sms/send.json`,
  );
  url.searchParams.set("receptor", input.receptor);
  url.searchParams.set("message", input.message.slice(0, 900));

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    console.error("[kavenegar] sms network error", e);
    return { ok: false, error: "kavenegar_network" };
  }

  let data: KavenegarLookupResponse | null = null;
  try {
    data = (await res.json()) as KavenegarLookupResponse;
  } catch {
    return { ok: false, error: "kavenegar_bad_response", status: res.status };
  }

  const status = data.return?.status;
  if (status !== 200) {
    console.error("[kavenegar] sms failed", {
      status,
      message: data.return?.message,
      http: res.status,
    });
    return {
      ok: false,
      error: mapKavenegarStatus(status),
      status,
      message: data.return?.message,
    };
  }

  const entry = Array.isArray(data.entries) ? data.entries[0] : undefined;
  return {
    ok: true,
    messageId: entry?.messageid,
    status: entry?.status,
  };
}

function mapKavenegarStatus(status: number | undefined): string {
  switch (status) {
    case 411:
      return "invalid_phone";
    case 418:
      return "sms_credit_low";
    case 424:
      return "otp_template_missing";
    case 426:
      return "kavenegar_plan_required";
    case 431:
    case 432:
      return "otp_template_invalid";
    case 403:
    case 401:
      return "kavenegar_auth";
    default:
      return "sms_send_failed";
  }
}
