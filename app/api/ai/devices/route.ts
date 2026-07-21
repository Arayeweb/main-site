import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import {
  getActiveAISession,
  listDeviceSessions,
  revokeDeviceSession,
  revokeOtherDeviceSessions,
} from "@/lib/aiDeviceSessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getActiveAISession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const devices = await listDeviceSessions(
      session.userId,
      session.sessionId ?? null
    );
    return jsonNoStore({ ok: true, devices, currentSessionId: session.sessionId ?? null });
  } catch (e) {
    console.error("[api/ai/devices GET]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}

/**
 * DELETE /api/ai/devices
 * body: { id: string } — یک نشست
 * body: { others: true } — همه به‌جز نشست فعلی
 */
export async function DELETE(req: NextRequest) {
  const session = await getActiveAISession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    if (body.others === true) {
      const revoked = await revokeOtherDeviceSessions(
        session.userId,
        session.sessionId ?? null
      );
      return jsonNoStore({ ok: true, revoked });
    }

    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) {
      return jsonNoStore({ ok: false, error: "missing_id" }, { status: 422 });
    }

    const result = await revokeDeviceSession(session.userId, id);
    if (result === "not_found") {
      return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
    }
    if (result === "error") {
      return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
    }

    const isCurrent = session.sessionId === id;
    return jsonNoStore({ ok: true, revokedCurrent: isCurrent });
  } catch (e) {
    console.error("[api/ai/devices DELETE]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}
