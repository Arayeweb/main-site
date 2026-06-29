import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

export async function POST(req: NextRequest) {
  if (!getSession(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 }); }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ ok: false, error: "missing_file" }, { status: 422 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 422 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "file_too_large" }, { status: 422 });

  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const supabase = getSupabaseAdmin();
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from("bizcards")
      .upload(name, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("[bizcards/upload]", error.message);
      return NextResponse.json({ ok: false, error: "upload_failed", detail: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from("bizcards").getPublicUrl(data.path);
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (e) {
    console.error("[bizcards/upload]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
