import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession, type AdminRole } from "@/lib/auth";
import { normalizeContact } from "@/lib/validateContact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SALES_ROLES: AdminRole[] = ["sales", "admin"];
const SOURCE_TYPES = new Set([
  "bizcard",
  "website_brief",
  "fastweb",
  "adready",
]);

function salesSession(req: NextRequest) {
  const session = getSession(req);
  if (!session || !SALES_ROLES.includes(session.role)) return null;
  return session;
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

function str(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

type LeadPayload = {
  source: string;
  name: string | null;
  contact: string;
  company?: string | null;
  goal?: string | null;
  budget?: string | null;
  page?: string | null;
  channel?: string | null;
  detail?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referrer?: string | null;
  raw?: Record<string, unknown>;
};

async function loadPayload(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  sourceType: string,
  sourceId: string
): Promise<LeadPayload | { error: string; status: number }> {
  if (sourceType === "bizcard") {
    const { data, error } = await supabase
      .from("bizcard_leads")
      .select("*")
      .eq("id", sourceId)
      .maybeSingle();
    if (error || !data) return { error: "not_found", status: 404 };
    const phone = str(data.phone, 200);
    if (!phone) return { error: "missing_contact", status: 422 };
    return {
      source: "promoted_bizcard",
      name: str(data.business_name, 200),
      contact: phone,
      company: str(data.business_name, 200),
      goal: str(data.requested_service, 500),
      page: data.slug ? `/b/${data.slug}` : "bizcard",
      channel: str(data.category, 120),
      detail: [data.city, data.lead_score != null ? `امتیاز: ${data.lead_score}` : null]
        .filter(Boolean)
        .join(" · "),
      raw: { promoted_from: { type: "bizcard", id: sourceId }, record: data },
    };
  }

  if (sourceType === "website_brief") {
    const { data, error } = await supabase
      .from("website_project_briefs")
      .select("*")
      .eq("id", sourceId)
      .maybeSingle();
    if (error || !data) return { error: "not_found", status: 404 };
    const phone = str(data.contact_phone, 200);
    if (!phone) return { error: "missing_contact", status: 422 };
    return {
      source: "promoted_website_brief",
      name: str(data.contact_name, 200),
      contact: phone,
      company: str(data.business_name, 200),
      goal: str(data.primary_conversion_goal, 500),
      page: "website-design-brief",
      detail: str(data.primary_business_problem, 1000),
      raw: { promoted_from: { type: "website_brief", id: sourceId }, record: data },
    };
  }

  if (sourceType === "fastweb") {
    const { data, error } = await supabase
      .from("fastweb_orders")
      .select("*")
      .eq("id", sourceId)
      .maybeSingle();
    if (error || !data) return { error: "not_found", status: 404 };
    const phone = str(data.phone ?? data.buyer_phone, 200);
    if (!phone) return { error: "missing_contact", status: 422 };
    return {
      source: "promoted_fastweb",
      name: str(data.business_name ?? data.buyer_name, 200),
      contact: phone,
      company: str(data.business_name, 200),
      goal: "fastweb_order",
      budget: data.amount_toman != null ? String(data.amount_toman) : null,
      page: data.slug ? `/s/${data.slug}` : "fastweb",
      detail: str(data.package_key, 200),
      raw: { promoted_from: { type: "fastweb", id: sourceId }, record: data },
    };
  }

  if (sourceType === "adready") {
    const { data, error } = await supabase
      .from("campaign_leads")
      .select("*, campaign_pages(title, slug)")
      .eq("id", sourceId)
      .maybeSingle();
    if (error || !data) return { error: "not_found", status: 404 };
    const phone = str(data.phone, 200);
    if (!phone) return { error: "missing_contact", status: 422 };
    const page = data.campaign_pages as { title?: string; slug?: string } | null;
    return {
      source: "promoted_adready",
      name: str(data.full_name, 200),
      contact: phone,
      company: str(page?.title, 200),
      goal: "adready_campaign",
      page: page?.slug ? `/c/${page.slug}` : "adready",
      detail: str(data.message, 1000),
      utm_source: str(data.utm_source, 120),
      utm_medium: str(data.utm_medium, 120),
      utm_campaign: str(data.utm_campaign, 120),
      utm_content: str(data.utm_content, 120),
      utm_term: str(data.utm_term, 120),
      referrer: str(data.referrer, 500),
      raw: { promoted_from: { type: "adready", id: sourceId }, record: data },
    };
  }

  return { error: "invalid_source_type", status: 422 };
}

export async function POST(req: NextRequest) {
  const session = salesSession(req);
  if (!session) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const sourceType = str(body.source_type, 64) || "";
  const sourceId = str(body.id, 64) || "";
  if (!SOURCE_TYPES.has(sourceType) || !sourceId) {
    return NextResponse.json({ ok: false, error: "invalid_params" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const payload = await loadPayload(supabase, sourceType, sourceId);
    if ("error" in payload) {
      return NextResponse.json({ ok: false, error: payload.error }, { status: payload.status });
    }

    const { kind, value } = normalizeContact(payload.contact);
    if (kind === "invalid") {
      return NextResponse.json({ ok: false, error: "invalid_contact" }, { status: 422 });
    }

    const { data: recent } = await supabase
      .from("leads")
      .select("id, raw")
      .eq("source", payload.source)
      .order("created_at", { ascending: false })
      .limit(20);

    const existing = (recent || []).find((row) => {
      const raw = row.raw as { promoted_from?: { id?: string } } | null;
      return raw?.promoted_from?.id === sourceId;
    });

    if (existing?.id) {
      return NextResponse.json({ ok: true, id: existing.id, already_exists: true });
    }

    const insert = {
      ...payload,
      contact: value,
      crm_status: "new",
      crm_updated_at: new Date().toISOString(),
      consent: true,
    };

    const { data, error } = await supabase.from("leads").insert(insert).select("id").single();
    if (error) {
      console.error("[api/sales/leads/promote] insert error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    await supabase.from("lead_activities").insert({
      lead_id: data.id,
      author_id: session.userId === "admin" ? null : session.userId,
      author_name: session.role === "admin" ? "مدیر" : "فروش",
      kind: "note",
      body: `لید از ${sourceType} به CRM منتقل شد`,
    });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    console.error("[api/sales/leads/promote] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
