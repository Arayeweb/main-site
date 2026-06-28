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
      <style>{`
        @font-face{font-family:"Vazirmatn";src:url("/assets/fonts/Vazirmatn-Regular.woff2") format("woff2");font-weight:400;font-display:swap;}
        @font-face{font-family:"Vazirmatn";src:url("/assets/fonts/Vazirmatn-Bold.woff2") format("woff2");font-weight:700;font-display:swap;}
        *{box-sizing:border-box;margin:0;padding:0;}
        .bc-root{
          font-family:"Vazirmatn",Tahoma,sans-serif;
          direction:rtl;background:#f0f2f5;
          min-height:100vh;display:flex;flex-direction:column;align-items:center;
          padding:0 0 48px;
        }
        /* header */
        .bc-header{
          width:100%;background:linear-gradient(135deg,#4285F4 0%,#1b6ef3 100%);
          padding:40px 24px 80px;text-align:center;position:relative;
        }
        .bc-avatar{
          width:82px;height:82px;border-radius:50%;
          background:#fff;color:#4285F4;
          font-size:34px;font-weight:700;
          display:grid;place-items:center;
          margin:0 auto 14px;
          box-shadow:0 4px 16px rgba(0,0,0,.18);
        }
        .bc-name{font-size:24px;font-weight:700;color:#fff;line-height:1.35;}
        .bc-category{
          display:inline-block;margin-top:8px;
          background:rgba(255,255,255,.22);color:#fff;
          font-size:13px;padding:4px 14px;border-radius:999px;
        }
        /* card body */
        .bc-card{
          background:#fff;border-radius:24px;
          max-width:480px;width:calc(100% - 32px);
          margin:-44px auto 0;padding:24px;
          box-shadow:0 4px 24px rgba(0,0,0,.10);
        }
        /* info rows */
        .bc-info{margin-bottom:20px;}
        .bc-row{display:flex;gap:10px;align-items:flex-start;font-size:14px;color:#5f6368;padding:8px 0;border-bottom:1px solid #f0f2f5;}
        .bc-row:last-child{border-bottom:none;}
        .bc-icon{font-size:18px;flex-shrink:0;margin-top:1px;}
        .bc-row-text{line-height:1.65;}
        /* buttons */
        .bc-btn{
          display:flex;align-items:center;justify-content:center;gap:10px;
          width:100%;font-family:"Vazirmatn",Tahoma,sans-serif;
          font-weight:700;font-size:16px;border:0;border-radius:14px;
          padding:15px 20px;cursor:pointer;text-decoration:none;
          transition:opacity .15s,transform .15s;
          margin-bottom:10px;
        }
        .bc-btn:active{opacity:.85;transform:scale(.98);}
        .bc-btn-maps{background:#34A853;color:#fff;}
        .bc-btn-phone{background:#4285F4;color:#fff;}
        .bc-secondary{display:flex;gap:10px;margin-top:4px;}
        .bc-btn-sm{
          flex:1;font-family:"Vazirmatn",Tahoma,sans-serif;
          font-size:14px;font-weight:700;border:2px solid #e3e6ea;
          border-radius:12px;padding:11px 8px;background:#fff;
          display:flex;align-items:center;justify-content:center;gap:6px;
          text-decoration:none;color:#202124;
          transition:background .15s,border-color .15s;
        }
        .bc-btn-sm:hover{background:#f1f3f4;border-color:#c6d3ff;}
        /* footer */
        .bc-footer{text-align:center;margin-top:20px;font-size:12px;color:#9aa0a6;}
        .bc-footer a{color:#4285F4;text-decoration:none;font-weight:700;}
      `}</style>

      <div className="bc-root">
        <div className="bc-header">
          <div className="bc-avatar">{initial}</div>
          <div className="bc-name">{card.business_name}</div>
          {card.category && <div className="bc-category">{card.category}</div>}
        </div>

        <div className="bc-card">
          {(card.address || card.hours) && (
            <div className="bc-info">
              {card.address && (
                <div className="bc-row">
                  <span className="bc-icon">📍</span>
                  <span className="bc-row-text">{card.address}</span>
                </div>
              )}
              {card.hours && (
                <div className="bc-row">
                  <span className="bc-icon">🕐</span>
                  <span className="bc-row-text">{card.hours}</span>
                </div>
              )}
            </div>
          )}

          {card.maps_url && (
            <a className="bc-btn bc-btn-maps" href={card.maps_url} target="_blank" rel="noopener noreferrer">
              <span>📍</span> مشاهده در گوگل مپ
            </a>
          )}

          {card.phone && (
            <a className="bc-btn bc-btn-phone" href={`tel:${card.phone}`}>
              <span>📞</span> تماس: {card.phone}
            </a>
          )}

          {(card.instagram || card.telegram || card.website) && (
            <div className="bc-secondary">
              {card.instagram && (
                <a className="bc-btn-sm" href={`https://instagram.com/${card.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer">
                  <span>📸</span> اینستاگرام
                </a>
              )}
              {card.telegram && (
                <a className="bc-btn-sm" href={`https://t.me/${card.telegram.replace("@","")}`} target="_blank" rel="noopener noreferrer">
                  <span>✈️</span> تلگرام
                </a>
              )}
              {card.website && (
                <a className="bc-btn-sm" href={card.website} target="_blank" rel="noopener noreferrer">
                  <span>🌐</span> وب‌سایت
                </a>
              )}
            </div>
          )}

          <div className="bc-footer">
            <a href="https://araaye.com">ساخته‌شده با آرایه</a>
          </div>
        </div>
      </div>
    </>
  );
}
