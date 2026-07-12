import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import JSZip from "jszip";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_BYTES = 12 * 1024 * 1024;
const MAX_EXTRACTED_CHARS = 32_000;

function extensionForMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "application/pdf") return "pdf";
  if (mime === "text/plain") return "txt";
  if (mime === "text/markdown") return "md";
  if (mime === "text/csv") return "csv";
  if (mime === "application/json") return "json";
  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  return mime.split("/")[1] || "bin";
}

function cleanExtractedText(text: string): string {
  return text.replace(/\u0000/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_EXTRACTED_CHARS);
}

function extractPdfText(buffer: Buffer): string {
  const raw = buffer.toString("latin1");
  const chunks: string[] = [];
  const literalText = raw.match(/\((?:\\.|[^\\)])*\)\s*Tj/g) ?? [];
  for (const item of literalText) {
    chunks.push(item.replace(/\)\s*Tj$/, "").replace(/^\(/, ""));
  }
  const arrayText = raw.match(/\[(?:.|\n|\r)*?\]\s*TJ/g) ?? [];
  for (const item of arrayText) {
    const parts = item.match(/\((?:\\.|[^\\)])*\)/g) ?? [];
    chunks.push(parts.map((p) => p.slice(1, -1)).join(""));
  }
  return cleanExtractedText(
    chunks
      .join("\n")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\n")
      .replace(/\\t/g, " ")
      .replace(/\\([()\\])/g, "$1")
  );
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const doc = await zip.file("word/document.xml")?.async("string");
  if (!doc) return "";
  return cleanExtractedText(
    doc
      .replace(/<w:tab\/>/g, " ")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
  );
}

async function extractText(buffer: Buffer, mime: string): Promise<string | null> {
  if (mime.startsWith("image/")) return null;
  if (mime === "application/pdf") return extractPdfText(buffer);
  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return extractDocxText(buffer);
  }
  return cleanExtractedText(buffer.toString("utf8"));
}

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

  const ext = extensionForMime(file.type);
  const id = randomUUID();
  const path = `${session.userId}/${id}.${ext}`;

  try {
    const supabase = getSupabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());
    const extractedText = await extractText(buffer, file.type);

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

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      mime: file.type,
      id,
      name: file.name,
      size: file.size,
      text: extractedText,
    });
  } catch (e) {
    console.error("[api/ai/upload]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
