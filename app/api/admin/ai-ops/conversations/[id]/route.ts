import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = requireAiOpsModule(req, "conversations");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const { data: b, error } = await supabase.from("ai_battles").select("*").eq("id", params.id).single();
    if (error || !b) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

    let phone = "مهمان";
    if (b.user_id) {
      const { data: u } = await supabase.from("ai_users").select("phone").eq("id", b.user_id).single();
      phone = (u?.phone as string) || "—";
    }

    return NextResponse.json({
      ok: true,
      conversation: {
        id: b.id,
        created_at: b.created_at,
        user_phone: phone,
        prompt: b.prompt,
        model_a: b.model_a,
        model_b: b.model_b,
        response_a: b.response_a,
        response_b: b.response_b,
        tier: b.tier,
        cost_usd: Number(b.cost_usd) || 0,
        tokens_used: b.tokens_used,
        credit_cost: b.credit_cost,
        winner: b.winner,
        attachments: b.attachments || [],
      },
    });
  } catch (e) {
    console.error("[api/admin/ai-ops/conversations/:id] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
