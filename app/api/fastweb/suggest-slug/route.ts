import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  FastWebSlugGenerationError,
  suggestFastWebSlugs,
} from "@/lib/fastwebGeneration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
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

function str(v: unknown, max = 200): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

/** Suggests up to 3 available subdomain slugs for the business (AI, best-effort). */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return jsonNoStore({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const businessName = str(body.businessName, 120);
  if (!businessName) {
    return jsonNoStore({ ok: false, error: "missing_business_name" }, { status: 422 });
  }

  const input = {
    businessName,
    industry: str(body.industry, 120) || undefined,
    city: str(body.city, 80) || undefined,
    shortDescription: str(body.shortDescription, 400) || undefined,
  };

  try {
    const slugs = await suggestFastWebSlugs(input);

    const supabase = getSupabaseAdmin();
    const { data: taken } = await supabase
      .from("fastweb_orders")
      .select("slug")
      .in("slug", slugs);
    const takenSet = new Set((taken || []).map((r) => r.slug as string));

    const available = slugs.filter((s) => !takenSet.has(s));

    return jsonNoStore({ ok: true, slugs: available.length > 0 ? available : slugs });
  } catch (e) {
    if (e instanceof FastWebSlugGenerationError) {
      return jsonNoStore({ ok: false, error: e.code }, { status: 502 });
    }
    console.error("[fastweb/suggest-slug]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}
