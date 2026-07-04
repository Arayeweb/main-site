import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { resolveCode } from "@/lib/aiPromo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// پیش‌نمایش قیمت با کد تخفیف/معرفی — بدون ایجاد سفارش
export async function POST(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const packageId = String(body.packageId ?? "");
  const code = body.code != null ? String(body.code) : "";

  const supabase = getSupabaseAdmin();
  const result = await resolveCode(supabase, code, session.userId, packageId);

  if ("error" in result) {
    return NextResponse.json(
      { ok: false, error: result.error, message: result.message },
      { status: 422 }
    );
  }

  return NextResponse.json({
    ok: true,
    listPrice: result.listAmountToman,
    discount: result.discountToman,
    finalPrice: result.finalAmountToman,
    codeType: result.type,
    label: result.label || null,
  });
}
