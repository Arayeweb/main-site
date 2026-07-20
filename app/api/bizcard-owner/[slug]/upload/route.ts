import { NextRequest, NextResponse } from "next/server";
import { requireBizcardOwner } from "@/lib/bizcardOwnerServer";
import {
  getBizcardOwnerSession,
  setBizcardOwnerSessionCookie,
} from "@/lib/bizcardOwnerSession";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { slug: string } };

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

/** POST /api/bizcard-owner/[slug]/upload — logo upload for card owner */
export async function POST(req: NextRequest, ctx: RouteContext) {
  const auth = await requireBizcardOwner(req, ctx.params.slug);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ ok: false, error: "missing_file" }, { status: 422 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "file_too_large" }, { status: 422 });
  }

  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const name = `owner-${auth.card.slug}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const supabase = getSupabaseAdmin();
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from("bizcards")
      .upload(name, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("[bizcard-owner/upload]", error.message);
      return NextResponse.json(
        { ok: false, error: "upload_failed", detail: error.message },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("bizcards").getPublicUrl(data.path);

    const res = NextResponse.json({ ok: true, url: publicUrl });
    res.headers.set("Cache-Control", "no-store");
    const session = getBizcardOwnerSession(req);
    if (!session || session.slug !== auth.card.slug) {
      setBizcardOwnerSessionCookie(res, auth.card.slug, auth.accessToken);
    }
    return res;
  } catch (e) {
    console.error("[bizcard-owner/upload]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
