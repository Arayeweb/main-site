import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const [userRes, historyRes] = await Promise.all([
    supabase
      .from("ai_users")
      .select("plan, credits, brainstorm_demos")
      .eq("id", session.userId)
      .maybeSingle(),
    supabase
      .from("ai_usage")
      .select("mode, tokens_used, created_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  if (!userRes.data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    plan: userRes.data.plan,
    credits: userRes.data.credits,
    brainstorm_demos: userRes.data.brainstorm_demos,
    history: historyRes.data ?? [],
  });
}
