import Image from "next/image";
import { medisaImages, medisaNav } from "@/lib/showcaseSites/medisa/config";

export default function MedisaHomePreview({ decorative = false }: { decorative?: boolean }) {
  return (
    <div
      className={`overflow-hidden bg-[#f7f4ef] ${decorative ? "pointer-events-none select-none" : ""}`}
      aria-hidden={decorative || undefined}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#2c2925]/10 bg-[#f7f4ef]/95 px-5 py-3 sm:px-6">
        <div className="text-right">
          <p className="text-[11px] font-medium tracking-[0.14em] text-[#2c2925] sm:text-xs">
            MEDISA STUDIO
          </p>
          <p className="text-[10px] text-[#6b6560]">معماری و طراحی داخلی</p>
        </div>
        <nav className="hidden items-center gap-4 text-[10px] font-medium text-[#6b6560] sm:flex sm:text-[11px]">
          {medisaNav.slice(0, 4).map((item) => (
            <span key={item.href}>{item.label}</span>
          ))}
        </nav>
        <span
          className="shrink-0 cursor-default rounded-sm border border-[#2c2925]/20 px-2.5 py-1.5 text-[10px] font-semibold text-[#2c2925] sm:text-[11px]"
          aria-hidden="true"
        >
          شروع همکاری
        </span>
      </div>

      <div className="relative min-h-[280px] sm:min-h-[340px]">
        <Image
          src={medisaImages.hero}
          alt="هیروی سایت استودیو معماری مدیسا"
          fill
          className="object-cover object-center"
          sizes="(max-width: 1200px) 100vw, 1200px"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#2c2925]/78 via-[#2c2925]/35 to-[#2c2925]/10"
          aria-hidden="true"
        />
        <div className="relative flex h-full min-h-[280px] flex-col justify-end px-5 pb-6 pt-16 text-right sm:min-h-[340px] sm:px-8 sm:pb-8">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#f7f4ef]/85 sm:text-[11px]">
            استودیو معماری مدیسا
          </p>
          <h3 className="mt-2 max-w-xl text-xl font-semibold leading-snug text-white sm:text-2xl lg:text-[1.75rem]">
            فضایی که با زندگی شما هم‌راستا می‌شود
          </h3>
          <p className="mt-2 max-w-lg text-[11px] leading-relaxed text-[#f7f4ef]/88 sm:text-xs">
            معماری، طراحی داخلی و بازسازی — با تمرکز بر نور، متریال و ارتباط فضاها
            برای زندگی روزمره.
          </p>
          <div className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
            <span className="cursor-default rounded-sm bg-white px-3 py-2 text-[10px] font-semibold text-[#2c2925] sm:text-[11px]">
              شروع همکاری
            </span>
            <span className="cursor-default rounded-sm border border-white/35 px-3 py-2 text-[10px] font-semibold text-white sm:text-[11px]">
              مشاهده پروژه‌ها
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
