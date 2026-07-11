import { NextRequest } from "next/server";
import { getAdReadySession } from "@/lib/adreadySession";
import { isUuid } from "@/lib/adready";
import { getCampaignAnalytics } from "@/lib/adreadyAnalytics";
import { jsonNoStore } from "@/lib/apiHeaders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const session = getAdReadySession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isUuid(params.id)) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  try {
    const analytics = await getCampaignAnalytics(params.id, session.userId);
    if (!analytics) {
      return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
    }
    return jsonNoStore({ ok: true, analytics });
  } catch {
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}
