import Image from "next/image";
import { FASTWEB_FEATURED_DEMO } from "@/lib/fastwebDemoData";

/**
 * Compact browser-frame preview of the featured FastWeb demo (landing hero).
 */
export default function FastWebDemoHomePreview() {
  const demo = FASTWEB_FEATURED_DEMO;
  const { hero } = demo;

  return (
    <div className="overflow-hidden bg-[#ECEEF0]">
      <div className="flex items-center justify-between gap-3 border-b border-[#1A1C1E]/10 bg-[#ECEEF0]/95 px-4 py-2.5 sm:px-5">
        <div className="text-right">
          <p className="text-sm font-extrabold text-[#1A1C1E]">{demo.businessName}</p>
          <p className="text-[10px] font-semibold text-[#5E656C]">{demo.tagline}</p>
        </div>
        <nav className="hidden items-center gap-3 text-[10px] font-semibold text-[#5E656C] sm:flex">
          {demo.nav.slice(0, 3).map((item) => (
            <span key={item.href}>{item.label}</span>
          ))}
        </nav>
        <span className="shrink-0 rounded-sm bg-[#1F3D3A] px-2.5 py-1.5 text-[10px] font-bold text-white">
          {hero.primaryCta}
        </span>
      </div>

      <div className="relative min-h-[260px] sm:min-h-[320px]">
        <Image
          src={hero.image}
          alt={hero.imageAlt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 560px"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#1A1C1E] via-[#1A1C1E]/50 to-[#1A1C1E]/15"
          aria-hidden="true"
        />
        <div className="relative flex h-full min-h-[260px] flex-col justify-end px-4 pb-5 pt-14 text-right sm:min-h-[320px] sm:px-6 sm:pb-6">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#C9A86C] sm:text-[11px]">
            {hero.eyebrow}
          </p>
          <h3 className="mt-2 max-w-md text-lg font-bold leading-snug text-white sm:text-xl">
            {hero.title}{" "}
            <span className="text-[#C9A86C]">{hero.titleAccent}</span>
          </h3>
          <p className="mt-2 max-w-sm text-[11px] leading-relaxed text-white/80 sm:text-xs">
            {hero.subtitle}
          </p>
          <div className="mt-3 flex flex-wrap gap-2" aria-hidden="true">
            <span className="rounded-sm bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#1A1C1E]">
              {hero.primaryCta}
            </span>
            <span className="rounded-sm border border-white/35 px-2.5 py-1.5 text-[10px] font-semibold text-white">
              {hero.secondaryCta}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
