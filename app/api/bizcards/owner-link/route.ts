import { NextRequest, NextResponse } from "next/server";
import { ownerPanelUrl } from "@/lib/bizcardOwner";
import { createBizcardOwnerAccessToken } from "@/lib/bizcardOwnerSession";
import { resolvePublicOrigin } from "@/lib/siteUrl";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function str(v: unknown, max = 200): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function normSlug(v: unknown): string | null {
  const s = str(v, 64);
  if (!s) return null;
  const slug = s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 48);
  return slug || null;
}

/**
 * POST /api/bizcards/owner-link
 * Admin: create or rotate owner panel access_token and return private URL.
 * Body: { id?: string, slug?: string, rotate?: boolean }
 */
export async function POST(req: NextRequest) {
  if (!getSession(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const id = str(body.id, 64);
  const slug = normSlug(body.slug);
  const rotate = body.rotate === true;

  if (!id && !slug) {
    return NextResponse.json(
      { ok: false, error: "missing_id_or_slug" },
      { status: 422 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("bizcards")
      .select("id, slug, access_token, business_name");

    if (id) query = query.eq("id", id);
    else query = query.eq("slug", slug!);

    const { data: existing, error: findErr } = await query.maybeSingle();
    if (findErr) {
      console.error("[bizcards/owner-link] find", findErr.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    let token =
      typeof existing.access_token === "string" && existing.access_token
        ? existing.access_token
        : null;

    if (!token || rotate) {
      token = createBizcardOwnerAccessToken();
      const { error: updErr } = await supabase
        .from("bizcards")
        .update({
          access_token: token,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updErr) {
        console.error("[bizcards/owner-link] update", updErr.message);
        return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
      }
    }

    const origin = resolvePublicOrigin();
    const url = ownerPanelUrl(existing.slug, token, origin);

    return NextResponse.json({
      ok: true,
      slug: existing.slug,
      business_name: existing.business_name,
      url,
      rotated: rotate || !existing.access_token,
      has_token: true,
    });
  } catch (e) {
    console.error("[bizcards/owner-link]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
