import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_BYTES = 10 * 1024 * 1024;

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Guest upload for FastWeb wizard reference files (image or PDF, max 10 MB). */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
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

  const ext =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "application/pdf"
        ? "pdf"
        : file.type.split("/")[1];
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const supabase = getSupabaseAdmin();
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from("fastweb-uploads")
      .upload(name, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("[fastweb/upload]", error.message);
      return NextResponse.json(
        { ok: false, error: "upload_failed", detail: error.message },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("fastweb-uploads").getPublicUrl(data.path);

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      name: file.name.slice(0, 120),
    });
  } catch (e) {
    console.error("[fastweb/upload]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
