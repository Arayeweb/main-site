import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STATUSES = new Set(["new", "applied", "won", "lost"]);

const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "fa,en-US;q=0.9",
};

const PONISHA_BASE =
  "https://ponisha.ir/search/projects" +
  "?page={page}&order=approved_at%7Cdesc&category=1&promotion=-&filterByProjectStatus=open";

const KARLANCER_BASE =
  "https://www.karlancer.com/search/projects?page={page}";

interface ScrapedProject {
  title: string;
  url: string;
  source: "ponisha" | "karlancer";
  budget?: string | null;
  description?: string | null;
}

/* ---------- scrapers ---------- */

function extractProjects(
  html: string,
  source: "ponisha" | "karlancer",
  baseUrl: string
): ScrapedProject[] {
  const out: ScrapedProject[] = [];
  const seen = new Set<string>();
  const regex = /<a[^>]*href=["']([^"']*\/project\/[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    const href = m[1];
    const rawTitle = m[2].replace(/<[^>]*>/g, "").trim();
    if (!href || !rawTitle || rawTitle === "مشاهده‌ی پروژه" || seen.has(href)) continue;
    seen.add(href);
    const fullUrl = href.startsWith("http") ? href : baseUrl + href;
    out.push({ title: rawTitle, url: fullUrl, source, budget: null, description: null });
  }
  return out;
}

async function scrapePonisha(maxPages = 5): Promise<ScrapedProject[]> {
  const all: ScrapedProject[] = [];
  for (let page = 1; page <= maxPages; page++) {
    try {
      const url = PONISHA_BASE.replace("{page}", String(page));
      const res = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) break;
      const html = await res.text();
      const found = extractProjects(html, "ponisha", "https://ponisha.ir");
      if (!found.length) break;
      all.push(...found);
      await new Promise((r) => setTimeout(r, 800));
    } catch {
      break;
    }
  }
  return all;
}

async function scrapeKarlancer(maxPages = 5): Promise<ScrapedProject[]> {
  const all: ScrapedProject[] = [];
  for (let page = 1; page <= maxPages; page++) {
    try {
      const url = KARLANCER_BASE.replace("{page}", String(page));
      const res = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) break;
      const html = await res.text();
      const found = extractProjects(html, "karlancer", "https://www.karlancer.com");
      if (!found.length) break;
      all.push(...found);
      await new Promise((r) => setTimeout(r, 800));
    } catch {
      break;
    }
  }
  return all;
}

/* ---------- helpers ---------- */

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}
function forbidden() {
  return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
}
function str(v: unknown, max = 5000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

/* ---------- GET: list projects ---------- */
export async function GET(req: NextRequest) {
  if (!getSession(req)) return unauthorized();
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("freelance_projects")
      .select(
        "id, created_at, scanned_at, source, title, url, budget, description, status, applied_at, result_note"
      )
      .order("scanned_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[api/admin/freelance] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, projects: data || [] });
  } catch (e) {
    console.error("[api/admin/freelance] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

/* ---------- POST: trigger scan ---------- */
export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) return unauthorized();

  try {
    const [ponisha, karlancer] = await Promise.all([
      scrapePonisha(),
      scrapeKarlancer(),
    ]);
    const all = [...ponisha, ...karlancer];

    if (!all.length) {
      return NextResponse.json({
        ok: true,
        scanned: 0,
        new: 0,
        message: "هیچ پروژه‌ای پیدا نشد",
      });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    let newCount = 0;

    for (const p of all) {
      const row = {
        source: p.source,
        title: p.title,
        url: p.url,
        budget: p.budget,
        description: p.description,
        scanned_at: now,
      };
      const { error } = await supabase
        .from("freelance_projects")
        .upsert(row, { onConflict: "source,url", ignoreDuplicates: true });

      if (!error) newCount++;
    }

    // به‌روزرسانی scanned_at برای پروژه‌های موجود که دوباره دیده شدند
    for (const p of all) {
      await supabase
        .from("freelance_projects")
        .update({ scanned_at: now })
        .eq("source", p.source)
        .eq("url", p.url);
    }

    return NextResponse.json({
      ok: true,
      scanned: all.length,
      new: newCount,
      ponisha: ponisha.length,
      karlancer: karlancer.length,
    });
  } catch (e) {
    console.error("[api/admin/freelance] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

/* ---------- PATCH: update status ---------- */
export async function PATCH(req: NextRequest) {
  if (!getSession(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const id = str(body.id, 64);
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });

  const patch: Record<string, unknown> = {};

  if ("status" in body) {
    const s = str(body.status, 32);
    if (!s || !STATUSES.has(s))
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 422 });
    patch.status = s;
    if (s === "applied") patch.applied_at = new Date().toISOString();
  }
  if ("result_note" in body) {
    patch.result_note = str(body.result_note, 4000);
  }

  if (!Object.keys(patch).length)
    return NextResponse.json({ ok: false, error: "no_fields" }, { status: 422 });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("freelance_projects")
      .update(patch)
      .eq("id", id)
      .select("id, status")
      .maybeSingle();

    if (error) {
      console.error("[api/admin/freelance] PATCH error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!data)
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, project: data });
  } catch (e) {
    console.error("[api/admin/freelance] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
