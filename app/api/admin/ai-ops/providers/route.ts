import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BRAND_TO_PROVIDER: Record<string, string> = {
  openai: "openai",
  claude: "anthropic",
  gemini: "google",
  google: "google",
  grok: "x-ai",
  deepseek: "deepseek",
  llama: "meta-llama",
  mistral: "mistralai",
  bytedance: "bytedance",
  kwaivgi: "kwaivgi",
};

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "providers");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const [{ data: providers }, { data: models }, { data: battles }] = await Promise.all([
      supabase.from("ai_providers").select("*").order("name"),
      supabase.from("ai_model_registry").select("id, brand"),
      supabase
        .from("ai_battles")
        .select("model_a, model_b, cost_usd")
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
        .range(0, 9999),
    ]);

    const brandOfModelId = new Map((models || []).map((m) => [m.id as string, m.brand as string]));
    const costByProvider = new Map<string, number>();
    for (const b of battles || []) {
      const cost = Number(b.cost_usd) || 0;
      for (const key of [b.model_a, b.model_b]) {
        const brand = brandOfModelId.get(key as string);
        if (!brand) continue;
        const provider = BRAND_TO_PROVIDER[brand] || brand;
        costByProvider.set(provider, (costByProvider.get(provider) || 0) + cost / (b.model_b ? 2 : 1));
      }
    }

    const out = (providers || []).map((p) => ({
      id: p.id,
      name: p.name,
      base_url: p.base_url,
      api_key_masked: p.api_key_masked,
      status: p.status,
      enabled: p.enabled,
      error_rate: Number(p.error_rate) || 0,
      avg_latency_ms: p.avg_latency_ms,
      uptime_percent: Number(p.uptime_percent) || 100,
      last_checked_at: p.last_checked_at,
      notes: p.notes,
      cost_usd_30d: Number((costByProvider.get(p.id as string) || 0).toFixed(4)),
    }));

    return NextResponse.json({ ok: true, providers: out });
  } catch (e) {
    console.error("[api/admin/ai-ops/providers] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
