import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireSession, unauthorized, dbError } from "@/lib/adminRouteHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SQUADS = new Set(["acquisition", "conversion", "product", "cs", "experimentation"]);
const STATUSES = new Set(["backlog", "running", "measuring", "shipped", "killed"]);
const BUCKETS = new Set(["core", "optimize", "new"]);

function str(v: unknown, max = 2000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function int1to10(v: unknown): number | null {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 10) return null;
  return n;
}

export async function GET(req: NextRequest) {
  if (!requireSession(req)) return unauthorized();

  const sprintWeek = req.nextUrl.searchParams.get("sprint_week");
  const status = req.nextUrl.searchParams.get("status");

  try {
    const supabase = getSupabaseAdmin();
    let q = supabase
      .from("growth_experiments")
      .select("*")
      .order("score", { ascending: false });

    if (sprintWeek) q = q.eq("sprint_week", sprintWeek);
    if (status) q = q.eq("status", status);

    const { data, error } = await q;
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, experiments: data ?? [] });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function POST(req: NextRequest) {
  if (!requireSession(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const squad = str(body.squad, 32);
  const idea = str(body.idea);
  const hypothesis = str(body.hypothesis);
  const kpi_target = str(body.kpi_target);
  const impact = int1to10(body.impact);
  const confidence = int1to10(body.confidence);
  const effort = int1to10(body.effort);

  if (!squad || !SQUADS.has(squad)) {
    return NextResponse.json({ ok: false, error: "invalid_squad" }, { status: 422 });
  }
  if (!idea || !hypothesis || !kpi_target) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }
  if (impact === null || confidence === null || effort === null) {
    return NextResponse.json({ ok: false, error: "invalid_ice" }, { status: 422 });
  }

  const bucket = str(body.bucket, 16) || "optimize";
  const status = str(body.status, 16) || "backlog";

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("growth_experiments")
      .insert({
        squad,
        idea,
        hypothesis,
        kpi_target,
        impact,
        confidence,
        effort,
        bucket: BUCKETS.has(bucket) ? bucket : "optimize",
        status: STATUSES.has(status) ? status : "backlog",
        sprint_week: str(body.sprint_week, 10),
        measured_value: str(body.measured_value, 500),
        result_notes: str(body.result_notes),
        owner_id: str(body.owner_id, 64),
      })
      .select()
      .single();

    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, experiment: data });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireSession(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const id = str(body.id, 64);
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });

  const patch: Record<string, unknown> = {};
  if ("status" in body) {
    const status = str(body.status, 16);
    if (!status || !STATUSES.has(status)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 422 });
    }
    patch.status = status;
  }
  if ("measured_value" in body) patch.measured_value = str(body.measured_value, 500);
  if ("result_notes" in body) patch.result_notes = str(body.result_notes);
  if ("sprint_week" in body) patch.sprint_week = str(body.sprint_week, 10);
  if ("bucket" in body) {
    const bucket = str(body.bucket, 16);
    if (bucket && BUCKETS.has(bucket)) patch.bucket = bucket;
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("growth_experiments")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) return dbError(error.message);
    if (!data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, experiment: data });
  } catch (e) {
    return dbError(String(e));
  }
}
