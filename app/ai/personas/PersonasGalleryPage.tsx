"use client";

import Link from "next/link";
import { listPersonas, PERSONA_DISCLAIMER_FA } from "@/lib/aiPersonas";
import PersonaImage from "../PersonaImage";

export default function PersonasGalleryPage() {
  const personas = listPersonas();

  return (
    <div className="ar-personas-page">
      <header className="ar-personas-hero ar-personas-hero--v2">
        <p className="ar-personas-kicker">شخصیت‌های هوشمند فارسی</p>
        <h1>با ذهن شبیه‌سازی‌شده چهره‌های بزرگ گفتگو کن</h1>
        <p className="ar-personas-lede">
          برای یادگیری، ایده‌گیری، تصمیم‌سازی و سرگرمی — نه ادعای واقعی بودن شخصیت‌ها
        </p>
        <p className="ar-persona-disclaimer ar-persona-disclaimer--banner">{PERSONA_DISCLAIMER_FA}</p>
      </header>

      <ul className="ar-personas-grid">
        {personas.map((p, index) => (
          <li key={p.id}>
            <Link href={`/ai/personas/${p.id}`} className="ar-persona-card">
              <div className="ar-persona-card-img">
                <PersonaImage persona={p} variant="card" priority={index < 4} />
              </div>
              <div className="ar-persona-card-body">
                <h2>{p.nameFa}</h2>
                <p>{p.taglineFa}</p>
                <span className="ar-persona-card-cta">{p.ctaFa}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
