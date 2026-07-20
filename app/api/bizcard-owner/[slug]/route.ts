import { NextRequest, NextResponse } from "next/server";
import {
  buildOwnerPatch,
  requireBizcardOwner,
  toOwnerPublicCard,
} from "@/lib/bizcardOwnerServer";
import {
  getBizcardOwnerSession,
  setBizcardOwnerSessionCookie,
} from "@/lib/bizcardOwnerSession";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { slug: string } };

function withOwnerCookie(
  req: NextRequest,
  res: NextResponse,
  slug: string,
  accessToken: string
): NextResponse {
  const session = getBizcardOwnerSession(req);
  if (!session || session.slug !== slug) {
    setBizcardOwnerSessionCookie(res, slug, accessToken);
  }
  res.headers.set("Cache-Control", "no-store");
  return res;
}

/** GET /api/bizcard-owner/[slug] — load editable card for owner */
export async function GET(req: NextRequest, ctx: RouteContext) {
  const auth = await requireBizcardOwner(req, ctx.params.slug);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  const res = NextResponse.json({
    ok: true,
    card: toOwnerPublicCard(auth.card),
  });
  return withOwnerCookie(req, res, auth.card.slug, auth.accessToken);
}

/** PATCH /api/bizcard-owner/[slug] — update editable fields (no slug / is_active) */
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const auth = await requireBizcardOwner(req, ctx.params.slug);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // Explicitly ignore privileged fields even if sent
  delete body.slug;
  delete body.is_active;
  delete body.access_token;
  delete body.id;

  const patch = buildOwnerPatch(body);
  if (!patch.business_name && body.business_name !== undefined) {
    return NextResponse.json(
      { ok: false, error: "business_name_required" },
      { status: 422 }
    );
  }

  // Require at least one real field besides updated_at
  const keys = Object.keys(patch).filter((k) => k !== "updated_at");
  if (keys.length === 0) {
    return NextResponse.json({ ok: false, error: "empty_patch" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bizcards")
      .update(patch)
      .eq("id", auth.card.id)
      .eq("access_token", auth.accessToken)
      .select(
        "id,slug,business_name,category,phone,whatsapp,maps_url,neshan_url,balad_url,snap_url,osm_url,address,instagram,telegram,website,hours,logo_url,theme_color,is_active"
      )
      .single();

    if (error) {
      console.error("[bizcard-owner PATCH]", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    const res = NextResponse.json({
      ok: true,
      card: data,
    });
    return withOwnerCookie(req, res, auth.card.slug, auth.accessToken);
  } catch (e) {
    console.error("[bizcard-owner PATCH]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
