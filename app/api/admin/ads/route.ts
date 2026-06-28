import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireAny(req: NextRequest) {
  return getSession(req);
}
function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

function str(v: unknown, max = 2000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function num(v: unknown): number {
  const n = Number(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

function normDate(v: unknown): string | null {
  const s = str(v, 20);
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

// لیست همه‌ی رکوردهای تبلیغات (مرتب بر اساس تاریخ نزولی).
export async function GET(req: NextRequest) {
  if (!requireAny(req)) return unauthorized();
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("ad_campaigns")
      .select("id, created_at, updated_at, date, platform, campaign_name, spend, impressions, clicks, leads, currency, note")
      .order("date", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("[api/admin/ads] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, ads: data || [] });
  } catch (e) {
    console.error("[api/admin/ads] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ساخت رکورد تبلیغات جدید.
export async function POST(req: NextRequest) {
  const session = requireAny(req);
  if (!session) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const date = normDate(body.date);
  if (!date) {
    return NextResponse.json({ ok: false, error: "invalid_date" }, { status: 422 });
  }

  const platform = str(body.platform, 50);
  if (!platform) {
    return NextResponse.json({ ok: false, error: "missing_platform" }, { status: 422 });
  }

  const row: Record<string, unknown> = {
    date,
    platform,
    campaign_name: str(body.campaign_name, 200),
    spend: num(body.spend),
    impressions: Math.round(num(body.impressions)),
    clicks: Math.round(num(body.clicks)),
    leads: Math.round(num(body.leads)),
    currency: str(body.currency, 10) || "IRR",
    note: str(body.note, 2000),
    created_by: session.userId,
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("ad_campaigns")
      .insert(row)
      .select("id, date, platform, campaign_name, spend, impressions, clicks, leads, currency, note, created_at")
      .single();

    if (error) {
      console.error("[api/admin/ads] POST error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, ad: data });
  } catch (e) {
    console.error("[api/admin/ads] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ویرایش رکورد تبلیغات.
export async function PATCH(req: NextRequest) {
  if (!requireAny(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const id = str(body.id, 64);
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });
  }

  const patch: Record<string, unknown> = {};
  if ("date" in body) {
    const d = normDate(body.date);
    if (!d) return NextResponse.json({ ok: false, error: "invalid_date" }, { status: 422 });
    patch.date = d;
  }
  if ("platform" in body) {
    const p = str(body.platform, 50);
    if (!p) return NextResponse.json({ ok: false, error: "missing_platform" }, { status: 422 });
    patch.platform = p;
  }
  if ("campaign_name" in body) patch.campaign_name = str(body.campaign_name, 200);
  if ("spend" in body) patch.spend = num(body.spend);
  if ("impressions" in body) patch.impressions = Math.round(num(body.impressions));
  if ("clicks" in body) patch.clicks = Math.round(num(body.clicks));
  if ("leads" in body) patch.leads = Math.round(num(body.leads));
  if ("currency" in body) patch.currency = str(body.currency, 10) || "IRR";
  if ("note" in body) patch.note = str(body.note, 2000);

  if (!Object.keys(patch).length) {
    return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 422 });
  }
  patch.updated_at = new Date().toISOString();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("ad_campaigns")
      .update(patch)
      .eq("id", id)
      .select("id, date, platform, campaign_name, spend, impressions, clicks, leads, currency, note, created_at")
      .maybeSingle();

    if (error) {
      console.error("[api/admin/ads] PATCH error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, ad: data });
  } catch (e) {
    console.error("[api/admin/ads] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// حذف رکورد تبلیغات.
export async function DELETE(req: NextRequest) {
  if (!requireAny(req)) return unauthorized();

  const id = str(req.nextUrl.searchParams.get("id"), 64);
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("ad_campaigns").delete().eq("id", id);
    if (error) {
      console.error("[api/admin/ads] DELETE error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/admin/ads] DELETE error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
