import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function str(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

// Generate a unique referral code: ARY-XXXXXX
function genReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "ARY-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// GET — retrieve referral info by code or phone
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const code = sp.get("code");
  const phone = sp.get("phone");

  try {
    const supabase = getSupabaseAdmin();

    if (code) {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error) {
        console.error("[referral] GET error:", error.message);
        return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
      }
      if (!data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      return NextResponse.json({ ok: true, referral: data });
    }

    if (phone) {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_phone", phone)
        .maybeSingle();

      if (error) {
        console.error("[referral] GET by phone error:", error.message);
        return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
      }
      return NextResponse.json({ ok: true, referral: data || null });
    }

    return NextResponse.json({ ok: false, error: "missing_params" }, { status: 422 });
  } catch (e) {
    console.error("[referral] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// POST — create a new referral code for a customer
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const name = str(body.name, 200) || "";
  const phone = str(body.phone, 200);
  if (!phone) {
    return NextResponse.json({ ok: false, error: "missing_phone" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Check if referral already exists for this phone
    const { data: existing } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_phone", phone)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, referral: existing, existed: true });
    }

    // Generate unique code (retry if collision)
    let code = genReferralCode();
    for (let i = 0; i < 3; i++) {
      const { data: conflict } = await supabase
        .from("referrals")
        .select("code")
        .eq("code", code)
        .maybeSingle();
      if (!conflict) break;
      code = genReferralCode();
    }

    const { data, error } = await supabase
      .from("referrals")
      .insert({
        code,
        referrer_name: name,
        referrer_phone: phone,
        status: "active",
        referral_count: 0,
        reward_earned: 0,
      })
      .select("*")
      .single();

    if (error) {
      console.error("[referral] POST error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, referral: data });
  } catch (e) {
    console.error("[referral] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// PATCH — track a referral usage (when a referred lead converts)
export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const code = str(body.code, 30);
  const referredPhone = str(body.referredPhone, 200);
  const packageKey = str(body.package, 30);

  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_code" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: referral, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error || !referral) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    // Increment referral count and reward
    const newCount = (referral.referral_count || 0) + 1;
    const rewardPerReferral = 100000; // 100k toman per successful referral
    const newReward = (referral.reward_earned || 0) + rewardPerReferral;

    const { data: updated, error: updateErr } = await supabase
      .from("referrals")
      .update({
        referral_count: newCount,
        reward_earned: newReward,
        last_referral_at: new Date().toISOString(),
      })
      .eq("id", referral.id)
      .select("*")
      .single();

    if (updateErr) {
      console.error("[referral] PATCH error:", updateErr.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    // Log the referral usage
    await supabase.from("lead_activities").insert({
      lead_id: null, // no direct lead_id since this is a referral record
      author_name: "system",
      kind: "note",
      body: `Referral code ${code} used by ${referredPhone || "unknown"} for package ${packageKey || "unknown"}. Reward: ${rewardPerReferral} toman.`,
    });

    return NextResponse.json({ ok: true, referral: updated, reward: rewardPerReferral });
  } catch (e) {
    console.error("[referral] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
