import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{2,38}[a-z0-9]$/;

/** Checks whether a subdomain slug is syntactically valid and currently free. */
export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get("slug") || "").trim().toLowerCase();

  if (!slug) {
    return jsonNoStore({ ok: true, valid: false, available: false, reason: "empty" });
  }
  if (!SLUG_PATTERN.test(slug)) {
    return jsonNoStore({ ok: true, valid: false, available: false, reason: "invalid_format" });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("fastweb_orders")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    return jsonNoStore({ ok: true, valid: true, available: !data });
  } catch (e) {
    console.error("[fastweb/check-slug]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}
