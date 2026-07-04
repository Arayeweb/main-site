import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
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
  const id = randomUUID();
  const path = `${session.userId}/${id}.${ext}`;

  try {
    const supabase = getSupabaseAdmin();
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from("ai-uploads")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("[api/ai/upload]", error.message);
      return NextResponse.json({ ok: false, error: "upload_failed" }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("ai-uploads").getPublicUrl(data.path);

    return NextResponse.json({ ok: true, url: publicUrl, mime: file.type, id });
  } catch (e) {
    console.error("[api/ai/upload]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
