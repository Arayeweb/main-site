import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- rate-limit ساده در حافظه (per-IP) ----------
const WINDOW_MS = 60_000; // یک دقیقه
const MAX_PER_WINDOW = 12;
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

function str(v: unknown): string {
  return String(v ?? "").trim();
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const projectCode = str(body.projectCode || body.project_code).slice(0, 64);
  const password = str(body.password).slice(0, 200);
  if (!projectCode || !password) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("support_projects")
      .select(
        "access_password, project_code, customer_name, title, service_type, status, progress_percent, estimated_delivery_at, last_note, updated_at"
      )
      .eq("project_code", projectCode)
      .maybeSingle();

    if (error) {
      console.error("[api/support/project-status] query error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    // پیام عمومی تا مشخص نشود کدِ پروژه درست بوده یا رمز.
    if (!data || !verifyPassword(password, data.access_password)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    // رمز هرگز به کلاینت برنمی‌گردد.
    const { access_password: _omit, ...project } = data;
    return NextResponse.json({ ok: true, project });
  } catch (e) {
    console.error("[api/support/project-status] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
