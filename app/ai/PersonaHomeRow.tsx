"use client";

import Link from "next/link";
import { listPersonas } from "@/lib/aiPersonas";

/** ردیف avatar شخصیت‌ها روی home — discovery سریع */
export default function PersonaHomeRow({ className = "" }: { className?: string }) {
  const featured = listPersonas().filter((p) => p.enabled).slice(0, 4);

  return (
    <section className={`ar-persona-home-row ${className}`.trim()} aria-label="با چه کسی حرف بزنی؟">
      <p className="ar-persona-home-label">با چه کسی حرف بزنی؟</p>
      <div className="ar-persona-home-track">
        {featured.map((p) => (
          <Link key={p.id} href={`/ai/personas/${p.id}`} className="ar-persona-home-chip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.avatar} alt="" width={40} height={40} loading="lazy" />
            <span>{p.nameFa}</span>
          </Link>
        ))}
        <Link href="/ai/personas" className="ar-persona-home-more">
          همه شخصیت‌ها
        </Link>
      </div>
    </section>
  );
}
