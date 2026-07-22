import Image from "next/image";
import type { CSSProperties } from "react";
import type { FwPreviewDevice, FwPreviewVariant } from "./content";

/**
 * Miniature but *real* website compositions used as the primary visual
 * material on the FastWeb landing. Each variant is a genuinely different
 * structural design language — not the same layout recolored.
 */

const PALETTE: Record<FwPreviewVariant, Record<string, string>> = {
  clinic: {
    "--ms-bg": "#eef3f1",
    "--ms-panel": "#ffffff",
    "--ms-ink": "#17332e",
    "--ms-muted": "#6a827c",
    "--ms-accent": "#2f6b5e",
    "--ms-line": "#dbe6e2",
  },
  local: {
    "--ms-bg": "#fbf5ee",
    "--ms-panel": "#ffffff",
    "--ms-ink": "#3a2c22",
    "--ms-muted": "#8a7565",
    "--ms-accent": "#b5642c",
    "--ms-line": "#eaddce",
  },
  studio: {
    "--ms-bg": "#1b1a17",
    "--ms-panel": "#24231f",
    "--ms-ink": "#f3efe6",
    "--ms-muted": "#a49d8d",
    "--ms-accent": "#c9a86c",
    "--ms-line": "#39362f",
  },
};

const HERO_IMG: Record<FwPreviewVariant, string> = {
  clinic: "/showcase-assets/shiva/hero.jpg",
  local: "/showcase-assets/kaveh/hero.jpg",
  studio: "/showcase-assets/medisa/hero.jpg",
};

const STUDIO_GRID = [
  "/showcase-assets/medisa/project-courtyard.jpg",
  "/showcase-assets/medisa/project-bright.jpg",
  "/showcase-assets/medisa/project-office.jpg",
];

function Bar({ w, c, h = 4 }: { w: string; c?: string; h?: number }) {
  return (
    <span
      className="block rounded-[1px]"
      style={{ width: w, height: h, background: c ?? "currentColor", opacity: c ? 1 : 0.28 }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------- CLINIC -------------------------------- */
function ClinicDesktop() {
  return (
    <div className="flex h-full flex-col" style={{ background: "var(--ms-bg)", color: "var(--ms-ink)" }}>
      <div
        className="flex items-center justify-between px-[6%] py-[3.5%]"
        style={{ borderBottom: "1px solid var(--ms-line)", background: "var(--ms-panel)" }}
      >
        <span className="text-[2.6cqw] font-extrabold">مطب دکتر راد</span>
        <div className="hidden items-center gap-[3cqw] text-[1.9cqw] font-semibold sm:flex" style={{ color: "var(--ms-muted)" }}>
          <span>خدمات</span><span>درباره</span><span>سؤالات</span>
        </div>
        <span className="rounded-[2px] px-[2.6cqw] py-[1.4cqw] text-[1.9cqw] font-bold text-white" style={{ background: "var(--ms-accent)" }}>
          رزرو نوبت
        </span>
      </div>
      <div className="flex flex-1 items-center gap-[5%] px-[6%] py-[5%]">
        <div className="flex-1">
          <span className="text-[1.8cqw] font-bold tracking-wide" style={{ color: "var(--ms-accent)" }}>روان‌درمانی و مشاوره</span>
          <p className="mt-[2.5%] text-[3.6cqw] font-extrabold leading-[1.35]">آرامش، با یک قدم ساده شروع می‌شود</p>
          <div className="mt-[6%] flex flex-col gap-[3%]" style={{ color: "var(--ms-muted)" }}>
            <Bar w="90%" /><Bar w="72%" />
          </div>
          <div className="mt-[7%] flex items-center gap-[3%]">
            <span className="rounded-[2px] px-[3.4cqw] py-[1.8cqw] text-[2cqw] font-bold text-white" style={{ background: "var(--ms-accent)" }}>دریافت نوبت</span>
            <span className="text-[2cqw] font-bold" style={{ color: "var(--ms-ink)" }}>۰۲۱ — ۹۱۰۰</span>
          </div>
        </div>
        <div className="relative h-[74%] w-[34%] overflow-hidden rounded-[4px]" style={{ border: "1px solid var(--ms-line)" }}>
          <Image src={HERO_IMG.clinic} alt="" fill className="object-cover" sizes="200px" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-[3%] px-[6%] pb-[5%]">
        {["مشاوره فردی", "زوج‌درمانی", "کودک و نوجوان"].map((s) => (
          <div key={s} className="rounded-[3px] p-[4%]" style={{ background: "var(--ms-panel)", border: "1px solid var(--ms-line)" }}>
            <span className="text-[2cqw] font-extrabold">{s}</span>
            <div className="mt-[10%] flex flex-col gap-[8%]"><Bar w="100%" /><Bar w="60%" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClinicMobile() {
  return (
    <div className="flex h-full flex-col" style={{ background: "var(--ms-bg)", color: "var(--ms-ink)" }}>
      <div className="flex items-center justify-between px-[7%] py-[4%]" style={{ borderBottom: "1px solid var(--ms-line)", background: "var(--ms-panel)" }}>
        <span className="text-[4.4cqw] font-extrabold">مطب دکتر راد</span>
        <span className="flex flex-col gap-[3px]"><Bar w="16px" c="var(--ms-ink)" h={2} /><Bar w="16px" c="var(--ms-ink)" h={2} /></span>
      </div>
      <div className="px-[7%] py-[7%]">
        <span className="text-[3.4cqw] font-bold" style={{ color: "var(--ms-accent)" }}>مشاوره</span>
        <p className="mt-[3%] text-[6.6cqw] font-extrabold leading-[1.3]">آرامش با یک قدم ساده</p>
        <div className="mt-[6%] flex flex-col gap-[3%]" style={{ color: "var(--ms-muted)" }}><Bar w="95%" /><Bar w="70%" /></div>
        <span className="mt-[7%] block rounded-[2px] py-[3.5%] text-center text-[3.6cqw] font-bold text-white" style={{ background: "var(--ms-accent)" }}>دریافت نوبت</span>
      </div>
      <div className="relative mx-[7%] h-[26%] overflow-hidden rounded-[5px]" style={{ border: "1px solid var(--ms-line)" }}>
        <Image src={HERO_IMG.clinic} alt="" fill className="object-cover" sizes="160px" />
      </div>
      <div className="mt-[6%] flex flex-col gap-[3%] px-[7%]">
        {["مشاوره فردی", "زوج‌درمانی"].map((s) => (
          <div key={s} className="flex items-center justify-between rounded-[3px] px-[4%] py-[3.5%]" style={{ background: "var(--ms-panel)", border: "1px solid var(--ms-line)" }}>
            <span className="text-[3.6cqw] font-bold">{s}</span>
            <span className="text-[3.6cqw]" style={{ color: "var(--ms-accent)" }}>←</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- LOCAL -------------------------------- */
function LocalDesktop() {
  return (
    <div className="flex h-full flex-col" style={{ background: "var(--ms-bg)", color: "var(--ms-ink)" }}>
      <div className="flex items-center justify-between px-[6%] py-[3.2%]">
        <span className="text-[2.6cqw] font-extrabold">آهنگری کاوه</span>
        <span className="text-[2cqw] font-bold" style={{ color: "var(--ms-accent)" }}>۰۹۱۲ — ۰۰۰</span>
      </div>
      <div className="flex flex-1 gap-[4%] px-[6%]">
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-[4cqw] font-black leading-[1.25]">سازه فلزی،<br />ساخت و نصب در محل</p>
          <div className="mt-[6%] flex flex-col gap-[3%]" style={{ color: "var(--ms-muted)" }}><Bar w="85%" /><Bar w="65%" /></div>
          <div className="mt-[8%] flex items-center gap-[3%]">
            <span className="rounded-[2px] px-[3.4cqw] py-[1.8cqw] text-[2cqw] font-bold text-white" style={{ background: "#1f8a4c" }}>واتساپ</span>
            <span className="rounded-[2px] px-[3.4cqw] py-[1.8cqw] text-[2cqw] font-bold" style={{ border: "1.5px solid var(--ms-ink)" }}>تماس</span>
          </div>
        </div>
        <div className="relative w-[42%] self-stretch overflow-hidden rounded-t-[6px]">
          <Image src={HERO_IMG.local} alt="" fill className="object-cover" sizes="240px" />
        </div>
      </div>
      <div className="grid grid-cols-3 text-center" style={{ background: "var(--ms-ink)", color: "var(--ms-bg)" }}>
        {[["ساعت کاری", "۸ تا ۲۰"], ["منطقه", "کل شهر"], ["برآورد", "رایگان"]].map(([t, v]) => (
          <div key={t} className="py-[3%]" style={{ borderInlineStart: "1px solid rgba(255,255,255,0.12)" }}>
            <span className="block text-[1.8cqw] opacity-70">{t}</span>
            <span className="mt-[6%] block text-[2.4cqw] font-extrabold" style={{ color: "var(--ms-accent)" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocalMobile() {
  return (
    <div className="flex h-full flex-col" style={{ background: "var(--ms-bg)", color: "var(--ms-ink)" }}>
      <div className="flex items-center justify-between px-[7%] py-[4%]">
        <span className="text-[4.4cqw] font-extrabold">آهنگری کاوه</span>
        <span className="text-[3.4cqw] font-bold" style={{ color: "var(--ms-accent)" }}>تماس</span>
      </div>
      <div className="relative mx-[6%] h-[30%] overflow-hidden rounded-[6px]">
        <Image src={HERO_IMG.local} alt="" fill className="object-cover" sizes="160px" />
      </div>
      <div className="px-[7%] py-[6%]">
        <p className="text-[6.4cqw] font-black leading-[1.25]">سازه فلزی، نصب در محل</p>
        <div className="mt-[5%] flex flex-col gap-[3%]" style={{ color: "var(--ms-muted)" }}><Bar w="90%" /></div>
      </div>
      <div className="mt-auto flex gap-[3%] px-[6%] pb-[6%]">
        <span className="flex-1 rounded-[2px] py-[3.5%] text-center text-[3.8cqw] font-bold text-white" style={{ background: "#1f8a4c" }}>واتساپ</span>
        <span className="flex-1 rounded-[2px] py-[3.5%] text-center text-[3.8cqw] font-bold" style={{ border: "1.5px solid var(--ms-ink)" }}>تماس</span>
      </div>
    </div>
  );
}

/* ------------------------------- STUDIO ------------------------------- */
function StudioDesktop() {
  return (
    <div className="flex h-full flex-col" style={{ background: "var(--ms-bg)", color: "var(--ms-ink)" }}>
      <div className="relative flex-1 overflow-hidden">
        <Image src={HERO_IMG.studio} alt="" fill className="object-cover" sizes="320px" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,19,16,0.92), rgba(20,19,16,0.25))" }} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-[6%] py-[3.5%] text-[1.9cqw] font-semibold text-white/80">
          <span className="text-[2.4cqw] font-extrabold text-white">ژوان</span>
          <span className="hidden gap-[3cqw] sm:flex"><span>خدمات</span><span>پروژه‌ها</span><span>تماس</span></span>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-[6%] pb-[6%]">
          <span className="text-[1.8cqw] font-bold tracking-[0.2em]" style={{ color: "var(--ms-accent)" }}>استودیو معماری</span>
          <p className="mt-[2%] text-[4.6cqw] font-extrabold leading-[1.15] text-white">فضایی که با زندگی شما<br />هم‌راستا می‌شود</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-[2%] p-[3%]">
        {STUDIO_GRID.map((src) => (
          <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-[3px]">
            <Image src={src} alt="" fill className="object-cover" sizes="120px" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StudioMobile() {
  return (
    <div className="flex h-full flex-col" style={{ background: "var(--ms-bg)", color: "var(--ms-ink)" }}>
      <div className="relative h-[58%] overflow-hidden">
        <Image src={HERO_IMG.studio} alt="" fill className="object-cover" sizes="160px" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,19,16,0.94), rgba(20,19,16,0.2))" }} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-[7%] py-[4%]">
          <span className="text-[4.4cqw] font-extrabold text-white">ژوان</span>
          <span className="flex flex-col gap-[3px]"><Bar w="16px" c="#fff" h={2} /><Bar w="16px" c="#fff" h={2} /></span>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-[7%] pb-[7%]">
          <span className="text-[3.2cqw] font-bold tracking-[0.18em]" style={{ color: "var(--ms-accent)" }}>استودیو معماری</span>
          <p className="mt-[3%] text-[7cqw] font-extrabold leading-[1.15] text-white">فضایی هم‌راستا با زندگی</p>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-[3%] p-[5%]">
        {STUDIO_GRID.slice(0, 2).map((src) => (
          <div key={src} className="relative overflow-hidden rounded-[4px]">
            <Image src={src} alt="" fill className="object-cover" sizes="90px" />
          </div>
        ))}
      </div>
    </div>
  );
}

const RENDERERS: Record<FwPreviewVariant, Record<FwPreviewDevice, () => JSX.Element>> = {
  clinic: { desktop: ClinicDesktop, mobile: ClinicMobile },
  local: { desktop: LocalDesktop, mobile: LocalMobile },
  studio: { desktop: StudioDesktop, mobile: StudioMobile },
};

export default function MiniSite({
  variant,
  device,
}: {
  variant: FwPreviewVariant;
  device: FwPreviewDevice;
}) {
  const Renderer = RENDERERS[variant][device];
  return (
    <div
      className="fw-mini"
      dir="rtl"
      style={{ ...(PALETTE[variant] as CSSProperties), containerType: "inline-size" } as CSSProperties}
    >
      <Renderer />
    </div>
  );
}
