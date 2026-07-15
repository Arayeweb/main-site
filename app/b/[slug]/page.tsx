import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BizcardChatWidget from "@/components/bizcard/BizcardChatWidget";
import { fetchActiveBizcardBySlug, type BizcardRow } from "@/lib/bizcardDb";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeReactStyle } from "@/lib/style";
import { SITE_URL } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

type Bizcard = BizcardRow;

const THEMES: Record<string, { brand: string; deep: string }> = {
  blue:   { brand: "#2f6df6", deep: "#1b4fd6" },
  green:  { brand: "#059669", deep: "#047857" },
  purple: { brand: "#7c3aed", deep: "#6d28d9" },
  red:    { brand: "#dc2626", deep: "#b91c1c" },
  orange: { brand: "#f97316", deep: "#ea580c" },
  teal:   { brand: "#0d9488", deep: "#0f766e" },
  rose:   { brand: "#e11d48", deep: "#be123c" },
  slate:  { brand: "#475569", deep: "#334155" },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = (params.slug || "").toLowerCase().trim();
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("bizcards")
    .select("business_name, category, logo_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!data) return { title: "کارت ویزیت" };

  const title = `${data.business_name} — کارت ویزیت آنلاین`;
  const description = data.category ?? `کارت ویزیت دیجیتال ${data.business_name}`;
  const pageUrl = `${SITE_URL}/b/${slug}`;
  const ogImage = data.logo_url
    ? { url: data.logo_url, alt: data.business_name }
    : { url: `/b/${slug}/opengraph-image`, width: 1200, height: 630, alt: data.business_name };

  return {
    title,
    description,
    robots: { index: false },
    alternates: { canonical: pageUrl },
    openGraph: {
      title: data.business_name,
      description,
      url: pageUrl,
      type: "website",
      locale: "fa_IR",
      siteName: data.business_name,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: data.business_name,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function BizcardPage({ params }: { params: { slug: string } }) {
  const slug = (params.slug || "").toLowerCase().trim();
  if (!slug) notFound();

  const supabase = getSupabaseAdmin();
  const { data, error } = await fetchActiveBizcardBySlug(supabase, slug);

  if (error || !data) notFound();
  const card = data as Bizcard;

  const initial = card.business_name.trim()[0] ?? "؟";
  // واتساپ: 09xxxxxxxxx → 98xxxxxxxxx برای لینک wa.me
  const waDigits = (card.whatsapp ?? "").replace(/[^\d]/g, "");
  const waNumber = waDigits
    ? (waDigits.startsWith("0") ? "98" + waDigits.slice(1)
      : waDigits.startsWith("98") ? waDigits
      : waDigits.startsWith("9") ? "98" + waDigits
      : waDigits)
    : "";
  const theme = THEMES[card.theme_color ?? "blue"] ?? THEMES.blue;
  const themeStyle = normalizeReactStyle(
    `--brand:${theme.brand};--brand-deep:${theme.deep};`
  );

  return (
    <>
      <link rel="stylesheet" href="/assets/css/bizcard.css" />

      <div className="bc-root" style={themeStyle}>
        <main className="bc-card">
          <div className="bc-banner" />

          <div className="bc-id">
            <div className="bc-avatar">
              {card.logo_url
                ? <img src={card.logo_url} alt={card.business_name} />
                : initial}
            </div>
            <h1 className="bc-name">{card.business_name}</h1>
            {card.category && (
              <span className="bc-cat"><span className="dot" />{card.category}</span>
            )}
          </div>

          {(card.address || card.hours) && (
            <div className="bc-meta">
              {card.address && (
                <div className="bc-row">
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  <span className="tx"><small>آدرس</small>{card.address}</span>
                </div>
              )}
              {card.hours && (
                <div className="bc-row">
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                  </span>
                  <span className="tx"><small>ساعت کاری</small>{card.hours}</span>
                </div>
              )}
            </div>
          )}

          <div className="bc-actions">
            {card.maps_url && (
              <a className="bc-cta primary" href={card.maps_url} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                مسیریابی در گوگل مپ
              </a>
            )}
            {card.neshan_url && (
              <a className="bc-cta neshan" href={card.neshan_url} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                مسیریابی در نشان
              </a>
            )}
            {card.balad_url && (
              <a className="bc-cta balad" href={card.balad_url} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                مسیریابی در بلد
              </a>
            )}
            {card.snap_url && (
              <a className="bc-cta snap" href={card.snap_url} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                مسیریابی در اسنپ
              </a>
            )}
            {card.osm_url && (
              <a className="bc-cta osm" href={card.osm_url} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                مسیریابی OpenStreetMap
              </a>
            )}
            {card.phone && (
              <a className="bc-cta call" href={`tel:${card.phone}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
                تماس: {card.phone}
              </a>
            )}
            {waNumber && (
              <a className="bc-cta whatsapp" href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.2-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.5-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.5 0-.1-.6-1.5-.9-2-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 5 4.3 1.8.8 2.5.9 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Z"/></svg>
                واتساپ
              </a>
            )}
          </div>

          {(card.instagram || card.telegram || card.website) && (
            <div className="bc-socials">
              {card.instagram && (
                <a className="bc-soc ig" href={`https://instagram.com/${card.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                  اینستاگرام
                </a>
              )}
              {card.telegram && (
                <a className="bc-soc tg" href={`https://t.me/${card.telegram.replace("@","")}`} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.94 4.6 18.7 19.86c-.24 1.08-.88 1.35-1.78.84l-4.92-3.63-2.37 2.29c-.26.26-.48.48-.99.48l.35-5.02 9.14-8.26c.4-.35-.09-.55-.62-.2L4.93 13.2.06 11.68c-1.06-.33-1.08-1.06.22-1.57L20.57 2.3c.88-.33 1.65.2 1.37 2.3Z"/></svg>
                  تلگرام
                </a>
              )}
              {card.website && (
                <a className="bc-soc web" href={card.website} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/></svg>
                  وب‌سایت
                </a>
              )}
            </div>
          )}

          <div className="bc-foot">
            <a href="https://araaye.com/bizcard" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3Z"/></svg>
              کارت ویزیت با <b>آرایه</b> بساز
            </a>
          </div>
        </main>
      </div>

      <BizcardChatWidget
        card={{
          slug: card.slug,
          business_name: card.business_name,
          category: card.category,
          phone: card.phone,
          whatsapp: card.whatsapp,
          address: card.address,
          hours: card.hours,
          maps_url: card.maps_url,
          neshan_url: card.neshan_url,
          balad_url: card.balad_url,
        }}
      />
    </>
  );
}
