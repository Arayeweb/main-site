import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Zibal merchant config — via env vars
const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT || "zibal";
const ZIBAL_API = "https://api.zibal.ir/v1";
const ZIBAL_GATEWAY = "https://gateway.zibal.ir/start";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com";

// پکیج‌های پزشکان — مبلغ پرداخت آنلاین، پیش‌پرداخت رزرو است (تومان)
// باید با doctorPackages در lib/doctorsData.ts هماهنگ بماند.
const DOCTOR_PACKAGES: Record<string, { name: string; deposit: number; price: number }> = {
  matab: { name: "مطب", deposit: 2_900_000, price: 30_000_000 },
  clinic: { name: "کلینیک", deposit: 4_900_000, price: 45_000_000 },
  center: { name: "مرکز درمانی", deposit: 9_900_000, price: 59_000_000 },
};

function str(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const pkgKey = str(body.package, 30);
  if (!pkgKey || !DOCTOR_PACKAGES[pkgKey]) {
    return NextResponse.json({ ok: false, error: "invalid_package" }, { status: 422 });
  }

  const pkg = DOCTOR_PACKAGES[pkgKey];
  const amount = pkg.deposit;

  if (amount <= 0) {
    return NextResponse.json({ ok: false, error: "zero_amount" }, { status: 422 });
  }

  const name = str(body.name, 200) || "";
  const contact = str(body.contact, 200) || "";
  const specialty = str(body.specialty, 200) || "";

  const callbackUrl = `${SITE_URL}/api/doctors/verify`;

  try {
    const res = await fetch(`${ZIBAL_API}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: ZIBAL_MERCHANT,
        amount,
        callbackUrl,
        description: `آرایه پزشکان - پیش‌پرداخت پکیج ${pkg.name} - ${name}`,
        mobile: contact,
        orderId: `doctors-${pkgKey}-${Date.now()}`,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      console.error("[doctors/checkout] zibal request error:", res.status, data);
      return NextResponse.json({ ok: false, error: "gateway_error" }, { status: 502 });
    }

    if (data.result !== 100 || !data.trackId) {
      console.error("[doctors/checkout] zibal rejected:", data);
      return NextResponse.json(
        { ok: false, error: "gateway_rejected", detail: data.message || data.result },
        { status: 400 }
      );
    }

    const trackId = String(data.trackId);

    // ذخیره تراکنش برای پیگیری — شکست ذخیره نباید پرداخت را متوقف کند
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("leads").insert({
        source: "doctors_checkout",
        page: "doctors",
        name: name || null,
        contact: contact || null,
        goal: "doctor_site",
        plan: pkgKey,
        budget: String(pkg.price),
        detail: `zibal_trackId: ${trackId} | package: ${pkg.name} | deposit: ${amount} | specialty: ${specialty}`,
        raw: {
          trackId,
          amount,
          deposit: true,
          fullPrice: pkg.price,
          package: pkgKey,
          name,
          contact,
          specialty,
          status: "pending_payment",
        },
        consent: true,
      });
    } catch (e) {
      console.error("[doctors/checkout] failed to save lead:", e);
    }

    const redirectUrl = `${ZIBAL_GATEWAY}/${trackId}`;
    return NextResponse.json({ ok: true, redirectUrl, trackId });
  } catch (e) {
    console.error("[doctors/checkout] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
