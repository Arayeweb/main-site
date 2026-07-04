import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { DIRECT_MODELS, COMPARE_MODELS, IMAGE_MODELS, VIDEO_MODELS, AUDIO_MODELS, TRANSCRIBE_MODELS } from "@/lib/aiModels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALL_STATIC_MODELS = [
  ...DIRECT_MODELS,
  ...COMPARE_MODELS,
  ...IMAGE_MODELS,
  ...VIDEO_MODELS,
  ...AUDIO_MODELS,
  ...TRANSCRIBE_MODELS,
];

async function ensureModelsSeeded(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { count } = await supabase.from("ai_model_registry").select("*", { count: "exact", head: true });
  if (count && count > 0) return;
  const rows = ALL_STATIC_MODELS.map((m) => ({
    id: m.id,
    route_id: m.routeId,
    kind: m.kind,
    brand: m.brand,
    name: m.name,
    persona_name: m.personaName ?? null,
    tier: m.tier,
    cost_per_1k_tokens: m.estCostPer1kTokens,
    credit_cost: m.imageCreditCost ?? m.videoCreditCost ?? m.audioCreditCost ?? m.transcribeCreditPerMinute ?? null,
    enabled: true,
  }));
  await supabase.from("ai_model_registry").upsert(rows, { onConflict: "id" });
}

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "models");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    await ensureModelsSeeded(supabase);

    const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
    const [{ data: models }, { data: battles }] = await Promise.all([
      supabase.from("ai_model_registry").select("*").order("tier", { ascending: false }),
      supabase.from("ai_battles").select("model_a, model_b, cost_usd").gte("created_at", since30).range(0, 9999),
    ]);

    const usageCount = new Map<string, number>();
    const costByModel = new Map<string, number>();
    for (const b of battles || []) {
      const cost = Number(b.cost_usd) || 0;
      for (const key of [b.model_a, b.model_b]) {
        const k = key as string;
        if (!k) continue;
        usageCount.set(k, (usageCount.get(k) || 0) + 1);
        costByModel.set(k, (costByModel.get(k) || 0) + cost / (b.model_b ? 2 : 1));
      }
    }

    // Map raw model route ids to registry ids using static lookup helper semantics
    function resolveRegistryId(raw: string): string {
      const found = ALL_STATIC_MODELS.find((m) => m.id === raw || m.routeId === raw);
      return found?.id || raw;
    }

    const usageByRegistryId = new Map<string, number>();
    const costByRegistryId = new Map<string, number>();
    for (const [k, v] of usageCount.entries()) {
      const rid = resolveRegistryId(k);
      usageByRegistryId.set(rid, (usageByRegistryId.get(rid) || 0) + v);
    }
    for (const [k, v] of costByModel.entries()) {
      const rid = resolveRegistryId(k);
      costByRegistryId.set(rid, (costByRegistryId.get(rid) || 0) + v);
    }

    const out = (models || []).map((m) => ({
      id: m.id,
      route_id: m.route_id,
      kind: m.kind,
      brand: m.brand,
      name: m.name,
      persona_name: m.persona_name,
      tier: m.tier,
      cost_per_1k_tokens: Number(m.cost_per_1k_tokens) || 0,
      credit_cost: m.credit_cost,
      enabled: m.enabled,
      notes: m.notes,
      usage_count_30d: usageByRegistryId.get(m.id as string) || 0,
      cost_usd_30d: Number((costByRegistryId.get(m.id as string) || 0).toFixed(4)),
    }));

    out.sort((a, b) => b.cost_usd_30d - a.cost_usd_30d);

    return NextResponse.json({ ok: true, models: out });
  } catch (e) {
    console.error("[api/admin/ai-ops/models] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
