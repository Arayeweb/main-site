// GET /api/ai/runs/[id] — read completed run (direct / compare / council)

import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getAISession } from "@/lib/aiAuth";
import { isUuid } from "@/lib/ai/requestValidation";
import { loadRunById, serializeRun } from "@/lib/ai/runs/loadRun";
import { loadConversationThreadByRunId } from "@/lib/ai/runs/conversationContext";
import { friendlyError } from "@/lib/ai/streaming/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function statusMessageFor(run: { status: string }) {
  return run.status === "cancelled"
    ? friendlyError("cancelled")
    : run.status === "failed" || run.status === "settlement_failed"
      ? friendlyError("provider_error")
      : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const runId = params.id;
  if (!runId || !isUuid(runId)) {
    return jsonNoStore({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const bundle = await loadRunById(runId);
  if (!bundle) {
    return jsonNoStore({ ok: false, error: "run_not_found" }, { status: 404 });
  }

  const session = getAISession(req);
  const { shareSlug, isPublic } = (() => {
    const meta = bundle.run.metadata ?? {};
    return {
      shareSlug: typeof meta.share_slug === "string" ? meta.share_slug : null,
      isPublic: meta.is_public === true,
    };
  })();

  const isOwner = session?.userId === bundle.run.user_id;
  const slugParam = req.nextUrl.searchParams.get("slug");
  const isPublicAccess = isPublic && slugParam && slugParam === shareSlug;

  if (!isOwner && !isPublicAccess) {
    return jsonNoStore({ ok: false, error: "run_not_found" }, { status: 404 });
  }

  const run = serializeRun(bundle);
  const includeThread = req.nextUrl.searchParams.get("includeThread") === "1";

  if (includeThread && isOwner) {
    const thread = await loadConversationThreadByRunId(runId, session!.userId);
    return jsonNoStore({
      ok: true,
      run: { ...run, statusMessage: statusMessageFor(run) },
      thread: thread
        ? {
            conversationId: thread.conversationId,
            runs: thread.runs.map((r) => ({
              ...r,
              statusMessage: statusMessageFor(r),
            })),
          }
        : { conversationId: run.conversationId ?? run.id, runs: [run] },
    });
  }

  return jsonNoStore({
    ok: true,
    run: {
      ...run,
      statusMessage: statusMessageFor(run),
    },
  });
}
