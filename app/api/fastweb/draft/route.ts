import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import {
  buildSlugCandidate,
  FASTWEB_PACKAGES,
  isFastWebPackageKey,
  mapFastWebOrder,
  type FastWebBrief,
} from "@/lib/fastweb";
import { createAccessToken } from "@/lib/fastwebSession";
import { ensureUniqueSlug } from "@/lib/fastwebServer";
import { buildDraftPreview } from "@/lib/fastwebContent";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asBrief(v: unknown): FastWebBrief {
  if (!v || typeof v !== "object") return {};
  return v as FastWebBrief;
}

/** Create or update a draft order (guest). Returns id + accessToken. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const brief = asBrief(body.brief);
  const packageKey = isFastWebPackageKey(body.package) ? body.package : "fast";
  const pkg = FASTWEB_PACKAGES[packageKey];
  const existingId =
    typeof body.orderId === "string" ? body.orderId : null;
  const existingToken =
    typeof body.accessToken === "string" ? body.accessToken : null;

  const businessName =
    brief.businessName?.trim() ||
    (typeof body.businessName === "string" ? body.businessName.trim() : "") ||
    null;

  try {
    const supabase = getSupabaseAdmin();

    if (existingId && existingToken) {
      const { data: current, error: findErr } = await supabase
        .from("fastweb_orders")
        .select("id, access_token, payment_status, slug")
        .eq("id", existingId)
        .eq("access_token", existingToken)
        .maybeSingle();

      if (findErr) {
        console.error("[fastweb/draft] find", findErr);
        return jsonNoStore({ ok: false, error: "db_error" }, { status: 500 });
      }

      if (current && current.payment_status !== "paid") {
        const preview = buildDraftPreview(brief);
        let slug = current.slug as string;
        if (brief.slugPreference?.trim()) {
          const slugBase = buildSlugCandidate(
            businessName || "business",
            brief.slugPreference
          );
          if (slugBase !== slug) {
            slug = await ensureUniqueSlug(slugBase);
          }
        }
        const { data, error } = await supabase
          .from("fastweb_orders")
          .update({
            brief,
            slug,
            business_name: businessName,
            package: packageKey,
            amount_toman: pkg.priceToman,
            preview_content: preview,
            template_key: preview.templateKey,
            style_key: preview.styleKey,
            brand_color: preview.brandColor,
          })
          .eq("id", existingId)
          .eq("access_token", existingToken)
          .select("*")
          .maybeSingle();

        if (error || !data) {
          console.error("[fastweb/draft] update", error);
          return jsonNoStore({ ok: false, error: "db_error" }, { status: 500 });
        }

        const order = mapFastWebOrder(data as Record<string, unknown>, {
          includeAccessToken: true,
        });
        return jsonNoStore({
          ok: true,
          order,
          accessToken: existingToken,
        });
      }
    }

    const slugBase = buildSlugCandidate(
      businessName || "business",
      brief.slugPreference
    );
    const slug = await ensureUniqueSlug(slugBase);
    const accessToken = createAccessToken();
    const preview = buildDraftPreview(brief);

    const { data, error } = await supabase
      .from("fastweb_orders")
      .insert({
        access_token: accessToken,
        slug,
        phone: brief.contacts?.phone || null,
        business_name: businessName,
        package: packageKey,
        amount_toman: pkg.priceToman,
        payment_status: "draft",
        fulfillment_status: "draft",
        brief,
        preview_content: preview,
        style_key: preview.styleKey,
        brand_color: preview.brandColor,
        template_key: preview.templateKey,
      })
      .select("*")
      .single();

    if (error || !data) {
      console.error("[fastweb/draft] insert", error);
      return jsonNoStore({ ok: false, error: "db_error" }, { status: 500 });
    }

    const order = mapFastWebOrder(data as Record<string, unknown>, {
      includeAccessToken: true,
    });
    return jsonNoStore({ ok: true, order, accessToken }, { status: 201 });
  } catch (e) {
    console.error("[fastweb/draft]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}
