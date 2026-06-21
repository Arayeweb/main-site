import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeContact } from "@/lib/validateContact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- rate-limit ساده در حافظه (per-IP) ----------
const WINDOW_MS = 60_000; // یک دقیقه
const MAX_PER_WINDOW = 6;
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

function str(v: unknown, max = 2000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

const CATEGORIES = new Set(["technical", "billing", "content", "other"]);
const PRIORITIES = new Set(["low", "normal", "high", "urgent"]);

function genTicketCode(): string {
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return "TK-" + rnd;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // honeypot
  if (str(body.company)) {
    return NextResponse.json({ ok: true, ticketCode: genTicketCode() });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const contact = normalizeContact(String(body.contact || ""));
  if (contact.kind === "invalid") {
    return NextResponse.json({ ok: false, error: "invalid_contact" }, { status: 422 });
  }

  const subject = str(body.subject, 200);
  const message = str(body.message, 4000);
  if (!subject || !message) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }

  const categoryRaw = str(body.category, 32);
  const category = categoryRaw && CATEGORIES.has(categoryRaw) ? categoryRaw : "other";
  const priorityRaw = str(body.priority, 32);
  const priority = priorityRaw && PRIORITIES.has(priorityRaw) ? priorityRaw : "normal";
  const projectCode = str(body.projectCode || body.project_code, 64);

  try {
    const supabase = getSupabaseAdmin();

    // اگر کد پروژه داده شده و با همین تماس مطابقت داشت، تیکت را به پروژه وصل می‌کنیم.
    let projectId: string | null = null;
    if (projectCode) {
      const { data: proj } = await supabase
        .from("support_projects")
        .select("id")
        .eq("project_code", projectCode)
        .eq("customer_contact", contact.value)
        .maybeSingle();
      projectId = proj?.id ?? null;
    }

    // تولید کد یکتا با چند تلاش در صورت برخورد.
    let ticketCode = genTicketCode();
    let inserted = false;
    let lastError: string | null = null;

    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      const row = {
        ticket_code: ticketCode,
        project_id: projectId,
        customer_name: str(body.name, 200),
        customer_contact: contact.value,
        subject,
        category,
        priority,
        message,
        user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
        raw: body,
      };
      const { error } = await supabase.from("support_tickets").insert(row);
      if (!error) {
        inserted = true;
        break;
      }
      lastError = error.message;
      // 23505 = unique_violation روی ticket_code → کد جدید بساز
      if ((error as { code?: string }).code === "23505") {
        ticketCode = genTicketCode();
        continue;
      }
      break;
    }

    if (!inserted) {
      console.error("[api/support/tickets] insert error:", lastError);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ticketCode });
  } catch (e) {
    console.error("[api/support/tickets] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
