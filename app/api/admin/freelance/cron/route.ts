import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "fa,en-US;q=0.9",
};

const PONISHA_BASE =
  "https://ponisha.ir/search/projects" +
  "?page={page}&order=approved_at%7Cdesc&category=1&promotion=-&filterByProjectStatus=open";
const KARLANCER_BASE = "https://www.karlancer.com/search/projects?page={page}";

function extractProjects(
  html: string,
  source: "ponisha" | "karlancer",
  baseUrl: string
) {
  const out: { title: string; url: string; source: string }[] = [];
  const seen = new Set<string>();
  const regex = /<a[^>]*href=["']([^"']*\/project\/[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    const href = m[1];
    const rawTitle = m[2].replace(/<[^>]*>/g, "").trim();
    if (!href || !rawTitle || rawTitle === "مشاهده‌ی پروژه" || seen.has(href)) continue;
    seen.add(href);
    const fullUrl = href.startsWith("http") ? href : baseUrl + href;
    out.push({ title: rawTitle, url: fullUrl, source });
  }
  return out;
}

async function scrapeSite(
  base: string,
  source: "ponisha" | "karlancer",
  origin: string,
  maxPages = 3
) {
  const all: { title: string; url: string; source: string }[] = [];
  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(base.replace("{page}", String(page)), {
        headers: HEADERS,
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) break;
      const html = await res.text();
      const found = extractProjects(html, source, origin);
      if (!found.length) break;
      all.push(...found);
      await new Promise((r) => setTimeout(r, 800));
    } catch {
      break;
    }
  }
  return all;
}

// Vercel Cron → /api/admin/freelance/cron?secret=XXX
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.FREELANCE_CRON_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const [ponisha, karlancer] = await Promise.all([
      scrapeSite(PONISHA_BASE, "ponisha", "https://ponisha.ir"),
      scrapeSite(KARLANCER_BASE, "karlancer", "https://www.karlancer.com"),
    ]);
    const all = [...ponisha, ...karlancer];
    const now = new Date().toISOString();
    const supabase = getSupabaseAdmin();

    for (const p of all) {
      await supabase
        .from("freelance_projects")
        .upsert(
          { ...p, scanned_at: now, budget: null, description: null },
          { onConflict: "source,url", ignoreDuplicates: true }
        );
      await supabase
        .from("freelance_projects")
        .update({ scanned_at: now })
        .eq("source", p.source)
        .eq("url", p.url);
    }

    return NextResponse.json({
      ok: true,
      scanned: all.length,
      ponisha: ponisha.length,
      karlancer: karlancer.length,
    });
  } catch (e) {
    console.error("[api/admin/freelance/cron] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
