import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface Bizcard {
  slug: string;
  business_name: string;
  category: string | null;
  phone: string | null;
  maps_url: string | null;
  address: string | null;
  instagram: string | null;
  telegram: string | null;
  website: string | null;
  hours: string | null;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("bizcards")
    .select("business_name, category")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!data) return { title: "کارت ویزیت" };
  return {
    title: `${data.business_name} — کارت ویزیت آنلاین`,
    description: data.category ?? undefined,
    robots: { index: false },
  };
}

export default async function BizcardPage({ params }: { params: { slug: string } }) {
  const slug = (params.slug || "").toLowerCase().trim();
  if (!slug) notFound();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bizcards")
    .select("slug,business_name,category,phone,maps_url,address,instagram,telegram,website,hours")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) notFound();
  const card = data as Bizcard;

  const initial = card.business_name.trim()[0] ?? "؟";

  return (
    <>
      <link rel="stylesheet" href="/assets/css/bizcard.css" />

      <div className="bc-root">
        <main className="bc-card">
          <div className="bc-banner" />

          <div className="bc-id">
            <div className="bc-avatar">{initial}</div>
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
            {card.phone && (
              <a className="bc-cta call" href={`tel:${card.phone}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
                تماس: {card.phone}
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
            <a href="https://araaye.com" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3Z"/></svg>
              ساخته‌شده با <b>آرایه</b>
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
