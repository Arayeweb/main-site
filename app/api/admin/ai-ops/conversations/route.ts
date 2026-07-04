import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "conversations");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier");
    const page = Math.max(0, Number(searchParams.get("page") || "0"));

    let query = supabase
      .from("ai_battles")
      .select("id, created_at, user_id, prompt, model_a, model_b, tier, cost_usd, tokens_used, credit_cost, winner", {
        count: "exact",
      });
    if (tier) query = query.eq("tier", tier);

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (error) throw error;

    const userIds = Array.from(new Set((data || []).map((b) => b.user_id as string).filter(Boolean)));
    let phoneMap = new Map<string, string>();
    if (userIds.length) {
      const { data: users } = await supabase.from("ai_users").select("id, phone").in("id", userIds);
      phoneMap = new Map((users || []).map((u) => [u.id as string, u.phone as string]));
    }

    const conversations = (data || []).map((b) => ({
      id: b.id,
      created_at: b.created_at,
      user_phone: b.user_id ? phoneMap.get(b.user_id as string) || "—" : "مهمان",
      prompt: (b.prompt as string)?.slice(0, 200) || "",
      model_a: b.model_a,
      model_b: b.model_b,
      tier: b.tier,
      cost_usd: Number(b.cost_usd) || 0,
      tokens_used: b.tokens_used,
      credit_cost: b.credit_cost,
      winner: b.winner,
    }));

    return NextResponse.json({ ok: true, conversations, total: count ?? conversations.length });
  } catch (e) {
    console.error("[api/admin/ai-ops/conversations] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
