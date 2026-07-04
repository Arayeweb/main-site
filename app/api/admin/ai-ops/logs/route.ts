import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "logs");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get("kind");

    const logs: {
      id: string;
      created_at: string;
      kind: "request" | "audit";
      summary: string;
      detail: string;
      actor: string | null;
    }[] = [];

    if (!kind || kind === "request") {
      const { data: battles } = await supabase
        .from("ai_battles")
        .select("id, created_at, model_a, model_b, tier, cost_usd, tokens_used, user_id")
        .order("created_at", { ascending: false })
        .limit(100);
      for (const b of battles || []) {
        logs.push({
          id: `req-${b.id}`,
          created_at: b.created_at as string,
          kind: "request",
          summary: `${b.model_a}${b.model_b ? " / " + b.model_b : ""} — ${b.tier}`,
          detail: `هزینه: $${Number(b.cost_usd || 0).toFixed(5)} — توکن: ${b.tokens_used ?? "—"}`,
          actor: b.user_id ? String(b.user_id).slice(0, 8) : "مهمان",
        });
      }
    }

    if (!kind || kind === "audit") {
      const { data: audit } = await supabase
        .from("ai_admin_audit_log")
        .select("id, created_at, admin_name, action, entity_type, entity_id")
        .order("created_at", { ascending: false })
        .limit(100);
      for (const a of audit || []) {
        logs.push({
          id: `audit-${a.id}`,
          created_at: a.created_at as string,
          kind: "audit",
          summary: a.action as string,
          detail: `${a.entity_type ?? ""} ${a.entity_id ?? ""}`.trim(),
          actor: (a.admin_name as string) || null,
        });
      }
    }

    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ ok: true, logs: logs.slice(0, 150) });
  } catch (e) {
    console.error("[api/admin/ai-ops/logs] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
