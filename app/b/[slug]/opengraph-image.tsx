import { ImageResponse } from "next/og";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "edge";
export const alt = "کارت ویزیت آنلاین";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const THEMES: Record<string, string> = {
  blue: "#2f6df6",
  green: "#059669",
  purple: "#7c3aed",
  red: "#dc2626",
  orange: "#f97316",
  teal: "#0d9488",
  rose: "#e11d48",
  slate: "#475569",
};

export default async function BizcardOgImage({ params }: { params: { slug: string } }) {
  const slug = (params.slug || "").toLowerCase().trim();
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("bizcards")
    .select("business_name, category, theme_color")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  const name = data?.business_name?.trim() || "کارت ویزیت";
  const category = data?.category?.trim() || "";
  const initial = name[0] ?? "؟";
  const brand = THEMES[data?.theme_color ?? "blue"] ?? THEMES.blue;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "center",
          background: `linear-gradient(135deg, #0f172a 0%, ${brand}33 100%)`,
          padding: "72px 96px",
          fontFamily: "sans-serif",
          direction: "rtl",
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 36,
            background: brand,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 72,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 40,
          }}
        >
          {initial}
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#f8fafc", lineHeight: 1.2, textAlign: "right" }}>
          {name}
        </div>
        {category && (
          <div style={{ fontSize: 32, fontWeight: 500, color: "#94a3b8", marginTop: 16, textAlign: "right" }}>
            {category}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 96,
            fontSize: 24,
            fontWeight: 600,
            color: "#64748b",
          }}
        >
          araaye.com/b/{slug}
        </div>
      </div>
    ),
    { ...size }
  );
}
