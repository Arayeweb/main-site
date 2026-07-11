import { NextRequest } from "next/server";
import { isAdReadyRateLimited, isPlainObject, readString } from "@/lib/adready";
import { jsonNoStore } from "@/lib/apiHeaders";
import {
  readUtmFromBody,
  saveCampaignLead,
} from "@/lib/adreadyPublicHandlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { slug: string } };

export async function POST(req: NextRequest, { params }: RouteContext) {
  if (isAdReadyRateLimited(req, "lead", 8)) {
    return jsonNoStore({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }
  if (!isPlainObject(body)) {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const utm = readUtmFromBody(body, {
    referrer:
      readString(body.referrer, 2000) ||
      readString(req.headers.get("referer"), 2000),
    pagePath: readString(body.pagePath, 500),
    userAgent: readString(req.headers.get("user-agent"), 500),
  });

  const result = await saveCampaignLead({
    slug: params.slug,
    fullName: String(body.fullName ?? ""),
    phone: String(body.phone ?? ""),
    message: readString(body.message, 4000),
    visitorId: readString(body.visitorId, 200),
    sessionId: readString(body.sessionId, 200),
    utm,
    userAgent: utm.userAgent,
  });

  if (!result.ok) {
    return jsonNoStore({ ok: false, error: result.error }, { status: result.status });
  }

  return jsonNoStore(
    { ok: true, lead: result.data },
    { status: 201 }
  );
}
