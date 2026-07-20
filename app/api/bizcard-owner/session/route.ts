import { NextRequest, NextResponse } from "next/server";
import {
  getBizcardOwnerSession,
  setBizcardOwnerSessionCookie,
} from "@/lib/bizcardOwnerSession";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normSlug(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 48);
  return s || null;
}

/** POST /api/bizcard-owner/session — redeem private token → cookie */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const slug = normSlug(body.slug);
  const token =
    typeof body.token === "string" ? body.token.trim() : "";

  if (!slug || !token) {
    return NextResponse.json(
      { ok: false, error: "missing_credentials" },
      { status: 422 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bizcards")
      .select("id, slug, access_token")
      .eq("slug", slug)
      .eq("access_token", token)
      .maybeSingle();

    if (error) {
      console.error("[bizcard-owner/session]", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!data || !data.access_token) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, slug: data.slug });
    setBizcardOwnerSessionCookie(res, data.slug, token);
    return res;
  } catch (e) {
    console.error("[bizcard-owner/session]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

/** GET — check if cookie session is valid for a slug */
export async function GET(req: NextRequest) {
  const slug = normSlug(req.nextUrl.searchParams.get("slug"));
  const session = getBizcardOwnerSession(req);
  if (!slug || !session || session.slug !== slug) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, authenticated: true, slug });
}
