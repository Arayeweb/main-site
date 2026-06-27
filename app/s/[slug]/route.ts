import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ریدایرکت لینک کوتاه: /s/<slug> → target_url (لینک کامل UTM‌دار)
// در صورت نبود لینک یا غیرفعال‌بودن، به صفحه‌ی اصلی برمی‌گردد.
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = (params.slug || "").trim().toLowerCase();
  const home = new URL("/", req.url);
  if (!slug) return NextResponse.redirect(home, 302);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("short_links")
      .select("id, target_url, is_active, clicks")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data || !data.is_active || !data.target_url) {
      return NextResponse.redirect(home, 302);
    }

    // شمارنده‌ی کلیک را افزایش بده (منتظر پاسخ نمی‌مانیم تا ریدایرکت سریع باشد).
    void supabase
      .from("short_links")
      .update({ clicks: (data.clicks || 0) + 1 })
      .eq("id", data.id)
      .then(
        () => {},
        () => {}
      );

    return NextResponse.redirect(data.target_url, 302);
  } catch {
    return NextResponse.redirect(home, 302);
  }
}
