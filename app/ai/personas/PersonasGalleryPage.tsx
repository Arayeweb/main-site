"use client";

import Link from "next/link";
import { listPersonas, PERSONA_DISCLAIMER_FA } from "@/lib/aiPersonas";

export default function PersonasGalleryPage() {
  const personas = listPersonas();

  return (
    <div className="ar-personas-page">
      <header className="ar-personas-hero ar-personas-hero--v2">
        <p className="ar-personas-kicker">Character.ai فارسی</p>
        <h1>گفتگو با شخصیت‌های مشهور</h1>
        <p>با فیگورهای الهام‌گرفته از چهره‌های تاریخ و فناوری حرف بزن — یک پیام رایگان برای مهمان.</p>
        <p className="ar-persona-disclaimer ar-persona-disclaimer--banner">{PERSONA_DISCLAIMER_FA}</p>
      </header>

      <ul className="ar-personas-grid">
        {personas.map((p) => (
          <li key={p.id}>
            <Link href={`/ai/personas/${p.id}`} className="ar-persona-card">
              <div className="ar-persona-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.avatar} alt={`فیگور ${p.nameFa}`} width={160} height={160} loading="lazy" />
              </div>
              <div className="ar-persona-card-body">
                <h2>{p.nameFa}</h2>
                <p>{p.taglineFa}</p>
                <span className="ar-persona-card-cta">شروع گفتگو</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
