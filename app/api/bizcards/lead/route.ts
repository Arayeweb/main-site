import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { notifyAdmin } from "@/lib/notifyAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function str(v: unknown, max = 2000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function bool(v: unknown): boolean | null {
  if (v === true || v === "true" || v === "yes" || v === 1) return true;
  if (v === false || v === "false" || v === "no" || v === 0) return false;
  return null;
}

const SERVICES = new Set(["website", "googlemap", "seo"]);
const SERVICE_FA: Record<string, string> = {
  website: "طراحی سایت معرفی کسب‌وکار",
  googlemap: "ثبت و بهینه‌سازی گوگل‌مپ",
  seo: "بررسی سئو",
};

/**
 * امتیاز لید را بر اساس جواب سوال‌ها و درخواست سرویس محاسبه می‌کند.
 * منطبق با Lead score اصلاح‌شده در اسناد فلو.
 */
function scoreLead(l: {
  has_site: boolean | null;
  has_googlemap: string | null;
  wants_google: boolean | null;
  requested_service: string | null;
}): number {
  let s = 0;
  if (l.has_site === false) s += 10;
  if (l.has_googlemap === "no") s += 10;
  if (l.wants_google === true) s += 20;
  if (l.requested_service) s += 50;
  return s;
}

// POST /api/bizcards/lead — ثبت/به‌روزرسانی لید فروش حاصل از کارت ویزیت
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  const bizcard_id = str(body.bizcard_id, 64);
  const slug = str(body.slug, 64);
  const business_name = str(body.business_name, 200);
  if (!business_name && !bizcard_id && !slug) {
    return NextResponse.json({ ok: false, error: "missing_card" }, { status: 422 });
  }

  const has_googlemapRaw = str(body.has_googlemap, 16);
  const has_googlemap =
    has_googlemapRaw === "yes" || has_googlemapRaw === "no" || has_googlemapRaw === "unknown"
      ? has_googlemapRaw
      : null;

  const requested_serviceRaw = str(body.requested_service, 32);
  const requested_service =
    requested_serviceRaw && SERVICES.has(requested_serviceRaw) ? requested_serviceRaw : null;

  const answers = {
    has_site: bool(body.has_site),
    site_url: str(body.site_url, 2000),
    has_googlemap,
    wants_google: bool(body.wants_google),
    wants_review: bool(body.wants_review),
    requested_service,
  };

  const lead_score = scoreLead(answers);
  const isHot = !!requested_service || lead_score >= 70;

  const supabase = getSupabaseAdmin();

  // اگر bizcard_id داده نشده ولی slug داریم، id را پیدا کن
  let cardId = bizcard_id;
  if (!cardId && slug) {
    const { data: card } = await supabase
      .from("bizcards")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (card) cardId = card.id;
  }

  const baseRow = {
    bizcard_id: cardId,
    slug,
    business_name,
    phone: str(body.phone, 30),
    category: str(body.category, 100),
    city: str(body.city, 100),
    ...answers,
    lead_score,
    updated_at: new Date().toISOString(),
    raw: body,
  };

  try {
    // upsert دستی: اگر لیدی برای این کارت هست به‌روزرسانی کن، وگرنه بساز
    let existingId: string | null = null;
    if (cardId) {
      const { data: existing } = await supabase
        .from("bizcard_leads")
        .select("id")
        .eq("bizcard_id", cardId)
        .maybeSingle();
      if (existing) existingId = existing.id;
    }

    let savedId = existingId;
    if (existingId) {
      const { error } = await supabase
        .from("bizcard_leads")
        .update(baseRow)
        .eq("id", existingId);
      if (error) {
        console.error("[api/bizcards/lead] update error:", error.message);
        return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
      }
    } else {
      const { data, error } = await supabase
        .from("bizcard_leads")
        .insert({ ...baseRow, source: "bizcard", sales_status: "new" })
        .select("id")
        .single();
      if (error) {
        console.error("[api/bizcards/lead] insert error:", error.message);
        return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
      }
      savedId = data.id;
    }

    // فالوآپ ۴: درخواست سرویس = لید داغ → نوتیفیکیشن فوری ادمین
    if (requested_service) {
      await notifyAdmin(
        `🔴 لید داغ جدید (کارت ویزیت)\n` +
        `کسب‌وکار: ${business_name || "نامشخص"}\n` +
        `شماره: ${baseRow.phone || "نامشخص"}\n` +
        `صنف: ${baseRow.category || "نامشخص"}\n` +
        `شهر: ${baseRow.city || "نامشخص"}\n` +
        `خدمت درخواستی: ${SERVICE_FA[requested_service]}\n` +
        `امتیاز لید: ${lead_score}` +
        (slug ? `\nکارت: https://araaye.com/b/${slug}` : "")
      );
    } else if (isHot) {
      await notifyAdmin(
        `🟠 لید داغ (امتیاز ${lead_score}) — کارت ویزیت\n` +
        `کسب‌وکار: ${business_name || "نامشخص"} | شماره: ${baseRow.phone || "نامشخص"}` +
        (slug ? `\nکارت: https://araaye.com/b/${slug}` : "")
      );
    }

    return NextResponse.json({ ok: true, id: savedId, lead_score, hot: isHot });
  } catch (e) {
    console.error("[api/bizcards/lead] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
