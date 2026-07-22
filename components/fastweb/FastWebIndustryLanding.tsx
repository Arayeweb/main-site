"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FastWebIndustryAnalytics from "@/components/fastweb/FastWebIndustryAnalytics";
import IndustryPreviewFrame from "@/components/fastweb/industry/IndustryPreviewFrame";
import {
  getFastWebExamplePath,
  getFastWebIndustry,
  getFastWebIndustryPath,
  getIndustryOrderHref,
  type FastWebIndustry,
} from "@/lib/fastweb/industries";
import { FASTWEB_PACKAGES } from "@/lib/fastweb";
import {
  FASTWEB_START_PRICE_TOMAN,
  formatWebsiteDesignPrice,
} from "@/lib/websitePricing";
import { trackFastWebEvent } from "@/lib/analytics/fastwebEvents";
import type { FastWebCtaPosition } from "@/lib/analytics/fastwebEvents";
import { canonicalUrl } from "@/lib/siteUrl";
import { ORGANIZATION_ID, SITE_NAME, organizationProviderRef } from "@/lib/seo/siteIdentity";
import type { FastWebPageSectionKey, FastWebBlockKey } from "@/lib/fastweb/industrySchema";

const PROCESS_STEPS = [
  { n: "۱", title: "اطلاعات صنف را می‌دهید", text: "خدمات، مخاطب و راه تماس را در ویزارد وارد می‌کنید." },
  { n: "۲", title: "نسخه اول آماده می‌شود", text: "ساختار، متن و جهت بصری مناسب همان صنف در ۲۴ ساعت کاری." },
  { n: "۳", title: "بررسی و انتشار", text: "پیش‌نمایش را می‌بینید، اصلاح می‌کنید و تأیید می‌کنید." },
] as const;

const BLOCK_LABELS: Record<FastWebBlockKey, string> = {
  services: "خدمات",
  gallery: "گالری",
  beforeAfter: "قبل و بعد",
  pricing: "قیمت / پلن",
  booking: "درخواست / رزرو",
  team: "تیم",
  schedule: "برنامه زمانی",
  transformations: "نتایج",
  practiceAreas: "حوزه‌های تخصصی",
  credentials: "مدارک و اعتبار",
  process: "فرایند همکاری",
  testimonials: "نظرات",
  faq: "سؤالات متداول",
  contact: "تماس",
  hours: "ساعات کاری",
  map: "نقشه",
  about: "درباره",
};

/** Industry-specific section headlines — avoids identical H2 copy across pages. */
function sectionCopy(industry: FastWebIndustry): Record<
  "outcomes" | "problems" | "blueprint" | "blocks" | "design" | "pricing" | "faq",
  { eyebrow: string; title: string }
> {
  switch (industry.slug) {
    case "beauty-salon":
      return {
        outcomes: {
          eyebrow: "اعتماد قبل از رزرو",
          title: "مشتری خدمات و نمونه‌کار را می‌بیند، بعد نوبت می‌گیرد",
        },
        problems: {
          eyebrow: "سالن بدون سایت شفاف",
          title: "کجا نوبت از دست می‌رود؟",
        },
        blueprint: {
          eyebrow: "نقشه صفحه سالن",
          title: "از گالری تا درخواست رزرو — به همین ترتیب",
        },
        blocks: {
          eyebrow: "بخش‌های سالن",
          title: "چه چیزهایی روی سایت سالن زیبایی باید باشد؟",
        },
        design: {
          eyebrow: "فضای بصری سالن",
          title: "سه جهت طراحی برای سالن‌های مختلف",
        },
        pricing: {
          eyebrow: "تعرفه سالن",
          title: "هزینه سایت فوری برای سالن زیبایی",
        },
        faq: {
          eyebrow: "رزرو، قیمت، گالری",
          title: "سؤالات پرتکرار صاحبان سالن",
        },
      };
    case "gym":
      return {
        outcomes: {
          eyebrow: "از بازدید تا جلسه اول",
          title: "مسیر جلسه آزمایشی باید در همان صفحه تمام شود",
        },
        problems: {
          eyebrow: "باشگاه بدون مسیر اقدام",
          title: "چرا عضو بالقوه در استوری گیر می‌کند؟",
        },
        blueprint: {
          eyebrow: "نقشه صفحه باشگاه",
          title: "جلسه آزمایشی، کلاس‌ها، مربیان — به ترتیب تصمیم",
        },
        blocks: {
          eyebrow: "بخش‌های باشگاه",
          title: "چه بلوک‌هایی عضویت را جلو می‌برد؟",
        },
        design: {
          eyebrow: "زبان ورزشی",
          title: "سه جهت بصری برای باشگاه و استودیو",
        },
        pricing: {
          eyebrow: "تعرفه باشگاه",
          title: "هزینه سایت فوری برای باشگاه ورزشی",
        },
        faq: {
          eyebrow: "پلن، کلاس، اپ",
          title: "سؤالات پرتکرار مدیران باشگاه",
        },
      };
    case "law-firm":
      return {
        outcomes: {
          eyebrow: "اعتماد حقوقی",
          title: "حوزه، اعتبار و مسیر مشاوره — قبل از تماس",
        },
        problems: {
          eyebrow: "دفتر بدون صفحه رسمی",
          title: "مراجع جدی چرا تماس نمی‌گیرد؟",
        },
        blueprint: {
          eyebrow: "نقشه صفحه حقوقی",
          title: "از حوزه‌های تخصصی تا درخواست مشاوره",
        },
        blocks: {
          eyebrow: "بخش‌های دفتر وکالت",
          title: "چه بخش‌هایی اعتماد حقوقی می‌سازد؟",
        },
        design: {
          eyebrow: "زبان بصری حقوقی",
          title: "سه جهت رسمی برای دفتر وکالت",
        },
        pricing: {
          eyebrow: "تعرفه حقوقی",
          title: "هزینه سایت فوری برای دفتر وکالت",
        },
        faq: {
          eyebrow: "پرونده، حق‌الوکاله، محرمانگی",
          title: "سؤالات پرتکرار وکلا و موسسات",
        },
      };
    default:
      return {
        outcomes: { eyebrow: "نتیجه", title: `بعد از سایت ${industry.name} چه تغییری می‌کند؟` },
        problems: { eyebrow: "مشکل", title: `بدون سایت شفاف، ${industry.name} کجا مشتری از دست می‌دهد؟` },
        blueprint: { eyebrow: "نقشه", title: `ترتیب بخش‌ها برای ${industry.shortName}` },
        blocks: { eyebrow: "بلوک‌ها", title: `بخش‌های ضروری سایت ${industry.name}` },
        design: { eyebrow: "جهت بصری", title: `زبان‌های طراحی مناسب ${industry.name}` },
        pricing: { eyebrow: "قیمت", title: `هزینه سایت فوری برای ${industry.shortName}` },
        faq: { eyebrow: "پرسش‌ها", title: `سؤالات متداول ${industry.name}` },
      };
  }
}

function blockTitle(industry: FastWebIndustry, key: FastWebBlockKey): string {
  return industry.requiredBlocks.find((b) => b.key === key)?.title ?? BLOCK_LABELS[key] ?? key;
}

type Tone = FastWebIndustry["pageTone"];

const TONE: Record<
  Tone,
  {
    accent: string;
    accentSoft: string;
    ink: string;
    paper: string;
    panel: string;
    cta: string;
    ctaHover: string;
  }
> = {
  warm: {
    accent: "text-[#9a4a32]",
    accentSoft: "bg-[#f3e6dc]",
    ink: "text-[#2a221c]",
    paper: "bg-[#f7f1ea]",
    panel: "bg-white",
    cta: "bg-[#2a221c] hover:bg-black",
    ctaHover: "hover:text-[#9a4a32]",
  },
  energetic: {
    accent: "text-[#1f7a45]",
    accentSoft: "bg-[#e5f3ea]",
    ink: "text-[#12151a]",
    paper: "bg-[#eef1f4]",
    panel: "bg-white",
    cta: "bg-[#12151a] hover:bg-black",
    ctaHover: "hover:text-[#1f7a45]",
  },
  formal: {
    accent: "text-[#1e3a5f]",
    accentSoft: "bg-[#e8eef5]",
    ink: "text-[#152033]",
    paper: "bg-[#f3f5f8]",
    panel: "bg-white",
    cta: "bg-[#152033] hover:bg-[#0d1624]",
    ctaHover: "hover:text-[#1e3a5f]",
  },
};

function trackCta(industry: FastWebIndustry, position: FastWebCtaPosition) {
  const base = {
    page_path: getFastWebIndustryPath(industry.slug),
    industry: industry.slug,
    primary_keyword: industry.searchTerms[0] ?? industry.slug,
    cta_position: position,
    offer: "fastweb" as const,
    page_type: "industry" as const,
  };
  if (position === "sample") {
    trackFastWebEvent("fastweb_sample_click", base);
    return;
  }
  trackFastWebEvent("fastweb_cta_click", base);
  trackFastWebEvent("fastweb_primary_cta_click", base);
}

function OrderLink({
  industry,
  position,
  className,
  children,
  source,
}: {
  industry: FastWebIndustry;
  position: FastWebCtaPosition;
  className: string;
  children: React.ReactNode;
  source?: string;
}) {
  return (
    <Link
      href={getIndustryOrderHref(industry.slug, source ?? `industry_${position}`)}
      className={className}
      onClick={() => trackCta(industry, position)}
    >
      {children}
    </Link>
  );
}

function SectionShell({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-14 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">{children}</div>
    </section>
  );
}

function Breadcrumb({ industry }: { industry: FastWebIndustry }) {
  return (
    <nav aria-label="مسیر صفحه" className="mx-auto max-w-6xl px-5 pt-20 sm:px-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-navy-400">
        <li>
          <Link href="/" className="hover:text-navy-700">
            خانه
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href="/fastweb" className="hover:text-navy-700">
            سایت فوری
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="font-semibold text-navy-700">{industry.name}</li>
      </ol>
    </nav>
  );
}

function HeroSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  const isEnergetic = industry.pageTone === "energetic";
  const isFormal = industry.pageTone === "formal";

  return (
    <SectionShell className={tone.paper}>
      <div
        className={`grid items-end gap-10 ${
          isFormal ? "lg:grid-cols-[1.1fr_0.9fr]" : isEnergetic ? "lg:grid-cols-[0.9fr_1.1fr]" : "lg:grid-cols-12"
        }`}
      >
        <div className={isFormal || isEnergetic ? "" : "lg:col-span-7"}>
          {industry.hero.eyebrow ? (
            <p className={`text-sm font-bold ${tone.accent}`}>{industry.hero.eyebrow}</p>
          ) : null}
          <h1 className={`mt-3 max-w-2xl text-balance text-3xl font-extrabold leading-[1.25] sm:text-4xl lg:text-[2.6rem] ${tone.ink}`}>
            {industry.metadata.h1}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.9] text-navy-500 sm:text-base">
            {industry.hero.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-navy-500">
            <span className="font-bold text-navy-800">
              از {formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN)} تومان
            </span>
            <span aria-hidden="true">·</span>
            <span>نسخه اول در ۲۴ ساعت کاری</span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <OrderLink
              industry={industry}
              position="hero"
              className={`inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-bold text-white transition-colors ${tone.cta}`}
            >
              {industry.primaryCta}
            </OrderLink>
            <Link
              href={getFastWebExamplePath(industry.slug)}
              className={`text-sm font-bold text-navy-800 underline decoration-current/30 underline-offset-4 ${tone.ctaHover}`}
              onClick={() =>
                trackFastWebEvent("fastweb_secondary_cta_click", {
                  page_path: getFastWebIndustryPath(industry.slug),
                  industry: industry.slug,
                  primary_keyword: industry.searchTerms[0] ?? industry.slug,
                  cta_position: "sample",
                  offer: "fastweb",
                  page_type: "industry",
                })
              }
            >
              {industry.secondaryCta}
            </Link>
          </div>
        </div>
        <div className={isFormal || isEnergetic ? "" : "lg:col-span-5"}>
          <IndustryPreviewFrame industry={industry} variant="desktop" />
          <p className="mt-3 text-center text-xs text-navy-400">
            پیش‌نمایش ساختاری — نمونه طراحی فرضی
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

function OutcomesSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  const copy = sectionCopy(industry).outcomes;
  return (
    <SectionShell className="bg-white">
      <div className="max-w-2xl">
        <p className={`text-xs font-bold tracking-wide ${tone.accent}`}>{copy.eyebrow}</p>
        <h2 className={`mt-3 text-2xl font-extrabold sm:text-3xl ${tone.ink}`}>{copy.title}</h2>
      </div>
      <ol className="mt-10 divide-y divide-navy-100 border-y border-navy-100">
        {industry.outcomes.map((item, i) => (
          <li key={item.title} className="grid grid-cols-[3rem_1fr] gap-4 py-5 sm:grid-cols-[4rem_1fr]">
            <span className={`pt-1 text-sm font-bold ${tone.accent}`}>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="text-base font-extrabold text-navy-900">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-7 text-navy-500">{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

function ProblemsSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  const stacked = industry.pageTone === "formal";
  const copy = sectionCopy(industry).problems;
  return (
    <SectionShell className={tone.paper}>
      <div className="max-w-2xl">
        <p className={`text-xs font-bold tracking-wide ${tone.accent}`}>{copy.eyebrow}</p>
        <h2 className={`mt-3 text-2xl font-extrabold sm:text-3xl ${tone.ink}`}>{copy.title}</h2>
        <p className="mt-3 text-sm text-navy-500">هدف صفحه: {industry.primaryGoal}</p>
      </div>
      <div className={`mt-10 ${stacked ? "space-y-4" : "grid gap-4 md:grid-cols-3"}`}>
        {industry.problems.map((p) => (
          <article
            key={p.title}
            className={`${tone.panel} ${stacked ? "border-s-4 border-navy-900 ps-5 py-2" : "rounded-xl border border-navy-100 p-5"}`}
          >
            <h3 className="text-base font-extrabold text-navy-900">{p.title}</h3>
            <p className="mt-2 text-sm leading-7 text-navy-500">{p.description}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function BlueprintSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  const copy = sectionCopy(industry).blueprint;
  return (
    <SectionShell className="bg-white">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className={`text-xs font-bold tracking-wide ${tone.accent}`}>{copy.eyebrow}</p>
          <h2 className={`mt-3 text-2xl font-extrabold sm:text-3xl ${tone.ink}`}>{copy.title}</h2>
          <p className="mt-4 text-sm leading-7 text-navy-500">{industry.searchIntent}</p>
        </div>
        <ol className="space-y-0 border border-navy-100">
          {industry.blueprint.map((key, i) => {
            const block = industry.requiredBlocks.find((b) => b.key === key);
            return (
              <li
                key={`${key}-${i}`}
                className="flex items-baseline gap-4 border-b border-navy-100 px-4 py-3 last:border-b-0"
              >
                <span className={`text-xs font-bold ${tone.accent}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className="font-bold text-navy-900">{blockTitle(industry, key)}</span>
                {block ? <span className="text-sm text-navy-400">{block.description}</span> : null}
              </li>
            );
          })}
        </ol>
      </div>
    </SectionShell>
  );
}

function RequiredBlocksSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  const copy = sectionCopy(industry).blocks;
  return (
    <SectionShell className={tone.paper}>
      <div className="max-w-2xl">
        <p className={`text-xs font-bold tracking-wide ${tone.accent}`}>{copy.eyebrow}</p>
        <h2 className={`mt-3 text-2xl font-extrabold sm:text-3xl ${tone.ink}`}>{copy.title}</h2>
      </div>
      <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-navy-100 bg-navy-100 sm:grid-cols-2">
        {industry.requiredBlocks.map((block) => (
          <article key={block.key} className={`${tone.panel} p-5`}>
            <h3 className="text-base font-extrabold text-navy-900">{block.title}</h3>
            <p className="mt-2 text-sm leading-7 text-navy-500">{block.description}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function DesignSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  const copy = sectionCopy(industry).design;
  return (
    <SectionShell className="bg-white">
      <div className="max-w-2xl">
        <p className={`text-xs font-bold tracking-wide ${tone.accent}`}>{copy.eyebrow}</p>
        <h2 className={`mt-3 text-2xl font-extrabold sm:text-3xl ${tone.ink}`}>{copy.title}</h2>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {industry.designDirections.map((d) => (
          <article key={d.key} className="border-t-2 border-navy-900 pt-4">
            <h3 className="text-lg font-extrabold text-navy-900">{d.label}</h3>
            <p className="mt-2 text-sm leading-7 text-navy-500">{d.description}</p>
            <p className={`mt-3 text-xs font-bold ${tone.accent}`}>مناسب برای: {d.bestFor}</p>
          </article>
        ))}
      </div>
      <div className={`mt-10 rounded-lg ${tone.accentSoft} p-5 sm:p-6`}>
        <h3 className="text-sm font-extrabold text-navy-900">دستور تصویر</h3>
        <dl className="mt-4 grid gap-3 text-sm text-navy-600 sm:grid-cols-2">
          <div>
            <dt className="font-bold text-navy-800">سبک عکاسی</dt>
            <dd className="mt-1 leading-7">{industry.imageDirection.photographyStyle}</dd>
          </div>
          <div>
            <dt className="font-bold text-navy-800">نور</dt>
            <dd className="mt-1 leading-7">{industry.imageDirection.lighting}</dd>
          </div>
          <div>
            <dt className="font-bold text-navy-800">ترکیب‌بندی</dt>
            <dd className="mt-1 leading-7">{industry.imageDirection.composition}</dd>
          </div>
          <div>
            <dt className="font-bold text-navy-800">پالت</dt>
            <dd className="mt-1 leading-7">{industry.imageDirection.colorPalette}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-navy-500">
          پرهیز از: {industry.imageDirection.avoid.join(" · ")}
        </p>
      </div>
    </SectionShell>
  );
}

function ExampleSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  const example = industry.examples[0];
  if (!example) return null;
  return (
    <SectionShell className={tone.paper} id="example">
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <div>
          <p className={`text-xs font-bold tracking-wide ${tone.accent}`}>نمونه</p>
          <h2 className={`mt-3 text-2xl font-extrabold sm:text-3xl ${tone.ink}`}>
            {example.conceptName}
          </h2>
          <p className="mt-2 text-xs font-bold text-navy-400">نمونه طراحی فرضی</p>
          <p className="mt-4 text-sm leading-7 text-navy-500">{example.whyStructure}</p>
          <p className="mt-3 text-sm text-navy-600">
            <span className="font-bold">هدف:</span> {example.businessGoal}
          </p>
          <Link
            href={getFastWebExamplePath(industry.slug)}
            className={`mt-6 inline-flex text-sm font-bold underline underline-offset-4 ${tone.accent}`}
          >
            جزئیات این نمونه
          </Link>
        </div>
        <div className="space-y-4">
          <IndustryPreviewFrame industry={industry} variant="desktop" />
          <p className="text-xs text-navy-400">{example.disclaimer}</p>
        </div>
      </div>
    </SectionShell>
  );
}

function DeliverablesSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  const titles =
    industry.slug === "beauty-salon"
      ? { in: "داخل بسته سالن", inH: "چه چیزی برای سالن زیبایی تحویل می‌گیرید", out: "خارج از بسته سالن", outH: "رزرو تقویمی و فروشگاه شامل نیست" }
      : industry.slug === "gym"
        ? { in: "داخل بسته باشگاه", inH: "چه چیزی برای باشگاه تحویل می‌گیرید", out: "خارج از بسته باشگاه", outH: "اپ عضویت و فروش مکمل شامل نیست" }
        : industry.slug === "law-firm"
          ? { in: "داخل بسته حقوقی", inH: "چه چیزی برای دفتر وکالت تحویل می‌گیرید", out: "خارج از بسته حقوقی", outH: "پرونده آنلاین و پرداخت حق‌الوکاله شامل نیست" }
          : { in: "داخل بسته", inH: "چه چیزی تحویل می‌گیرید", out: "خارج از بسته", outH: "چه چیزی شامل نیست" };

  return (
    <SectionShell className="bg-white">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <p className={`text-xs font-bold tracking-wide ${tone.accent}`}>{titles.in}</p>
          <h2 className={`mt-3 text-2xl font-extrabold ${tone.ink}`}>{titles.inH}</h2>
          <ul className="mt-6 space-y-3">
            {industry.deliverables.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-navy-700">
                <span className={tone.accent}>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold tracking-wide text-navy-400">{titles.out}</p>
          <h2 className="mt-3 text-2xl font-extrabold text-navy-700">{titles.outH}</h2>
          <ul className="mt-6 space-y-3">
            {industry.exclusions.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-navy-500 line-through decoration-navy-200">
                <span>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-navy-500">
            برای امکانات خارج از بسته:{" "}
            <Link href={industry.advancedProjectRoute} className="font-bold text-navy-800 underline">
              طراحی سایت اختصاصی
            </Link>
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

function ExclusionsOnly({ industry }: { industry: FastWebIndustry }) {
  // Used when deliverables already shown separately — skip duplicate if both in order sequentially handled by DeliverablesSection
  return (
    <SectionShell className="bg-white">
      <h2 className="text-2xl font-extrabold text-navy-800">خارج از محدوده FastWeb برای {industry.name}</h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {industry.exclusions.map((item) => (
          <li key={item} className="border border-navy-100 px-4 py-3 text-sm text-navy-500">
            {item}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function ProcessSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  return (
    <SectionShell className={tone.paper}>
      <h2 className={`text-2xl font-extrabold sm:text-3xl ${tone.ink}`}>فرایند از سفارش تا انتشار</h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {PROCESS_STEPS.map((step) => (
          <li key={step.n} className="border-t border-navy-200 pt-4">
            <span className={`text-sm font-bold ${tone.accent}`}>{step.n}</span>
            <h3 className="mt-2 font-extrabold text-navy-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-7 text-navy-500">{step.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-navy-500">
        صنعت انتخابی شما در ویزارد از قبل روی «{industry.name}» تنظیم می‌شود؛ قابل تغییر است.
      </p>
    </SectionShell>
  );
}

function PricingSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  const copy = sectionCopy(industry).pricing;
  return (
    <SectionShell className="bg-white" id="pricing">
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
        <div>
          <p className={`text-xs font-bold tracking-wide ${tone.accent}`}>{copy.eyebrow}</p>
          <h2 className={`mt-3 text-2xl font-extrabold sm:text-3xl ${tone.ink}`}>{copy.title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-navy-500">
            از {formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN)} تومان برای بسته{" "}
            {FASTWEB_PACKAGES.fast.name}. میزبانی یک‌ساله و دامنه .ir در صورت آزاد بودن شامل است.
          </p>
        </div>
        <OrderLink
          industry={industry}
          position="pricing"
          className={`inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-bold text-white ${tone.cta}`}
        >
          {industry.primaryCta}
        </OrderLink>
      </div>
    </SectionShell>
  );
}

function FaqSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  const copy = sectionCopy(industry).faq;
  return (
    <SectionShell className={tone.paper} id="faq">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className={`text-xs font-bold tracking-wide ${tone.accent}`}>{copy.eyebrow}</p>
          <h2 className={`mt-3 text-2xl font-extrabold sm:text-3xl lg:sticky lg:top-24 ${tone.ink}`}>
            {copy.title}
          </h2>
        </div>
        <div>
          {industry.faqs.map((faq, i) => (
            <details key={faq.question} className="group border-b border-navy-200 first:border-t">
              <summary className="flex cursor-pointer list-none items-baseline gap-3 py-4 [&::-webkit-details-marker]:hidden">
                <span className={`text-xs font-bold ${tone.accent}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 font-bold text-navy-900">{faq.question}</span>
                <span aria-hidden="true" className="text-navy-400 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-4 ps-8 text-sm leading-7 text-navy-500">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function RelatedSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  const related = industry.relatedIndustries
    .map((slug) => getFastWebIndustry(slug))
    .filter((i): i is FastWebIndustry => Boolean(i));
  if (!related.length) return null;
  return (
    <SectionShell className="bg-white">
      <h2 className={`text-2xl font-extrabold ${tone.ink}`}>اصناف مرتبط</h2>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
        {related.map((item) => (
          <li key={item.slug}>
            <Link
              href={getFastWebIndustryPath(item.slug)}
              className={`text-base font-bold text-navy-800 underline-offset-4 hover:underline ${tone.ctaHover}`}
            >
              {item.hubAnchor}
            </Link>
          </li>
        ))}
        <li>
          <Link href={getFastWebExamplePath(industry.slug)} className="text-base font-bold text-navy-500">
            نمونه {industry.name}
          </Link>
        </li>
        <li>
          <Link href="/fastweb" className="text-base font-bold text-navy-500">
            بازگشت به سایت فوری
          </Link>
        </li>
      </ul>
    </SectionShell>
  );
}

function FinalCtaSection({ industry, tone }: { industry: FastWebIndustry; tone: (typeof TONE)[Tone] }) {
  return (
    <SectionShell className="bg-navy-950 text-[#f4f1ea]">
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-bold tracking-wide text-white/50">شروع سفارش</p>
          <p className="mt-3 text-2xl font-extrabold sm:text-3xl">
            {industry.hero.title}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">{industry.searchIntent}</p>
        </div>
        <OrderLink
          industry={industry}
          position="final"
          className="inline-flex items-center justify-center rounded-md bg-[#f4f1ea] px-6 py-3.5 text-sm font-extrabold text-navy-950 hover:bg-white"
        >
          {industry.primaryCta}
        </OrderLink>
      </div>
    </SectionShell>
  );
}

function renderSection(
  key: FastWebPageSectionKey,
  industry: FastWebIndustry,
  tone: (typeof TONE)[Tone],
  rendered: Set<string>,
) {
  // Collapse deliverables+exclusions if both present to avoid twin card grids
  if (key === "exclusions" && industry.sectionOrder.includes("deliverables")) {
    if (rendered.has("deliverables")) return null;
  }
  if (key === "deliverables") {
    rendered.add("deliverables");
    return <DeliverablesSection key="deliverables" industry={industry} tone={tone} />;
  }
  if (key === "exclusions") {
    if (rendered.has("deliverables")) return null;
    return <ExclusionsOnly key="exclusions" industry={industry} />;
  }

  switch (key) {
    case "hero":
      return <HeroSection key="hero" industry={industry} tone={tone} />;
    case "outcomes":
      return <OutcomesSection key="outcomes" industry={industry} tone={tone} />;
    case "problems":
      return <ProblemsSection key="problems" industry={industry} tone={tone} />;
    case "blueprint":
      return <BlueprintSection key="blueprint" industry={industry} tone={tone} />;
    case "requiredBlocks":
      return <RequiredBlocksSection key="blocks" industry={industry} tone={tone} />;
    case "designDirections":
      return <DesignSection key="design" industry={industry} tone={tone} />;
    case "example":
      return <ExampleSection key="example" industry={industry} tone={tone} />;
    case "process":
      return <ProcessSection key="process" industry={industry} tone={tone} />;
    case "pricing":
      return <PricingSection key="pricing" industry={industry} tone={tone} />;
    case "faq":
      return <FaqSection key="faq" industry={industry} tone={tone} />;
    case "related":
      return <RelatedSection key="related" industry={industry} tone={tone} />;
    case "finalCta":
      return <FinalCtaSection key="final" industry={industry} tone={tone} />;
    default:
      return null;
  }
}

export default function FastWebIndustryLanding({ industry }: { industry: FastWebIndustry }) {
  const tone = TONE[industry.pageTone];
  const pagePath = getFastWebIndustryPath(industry.slug);
  const pageUrl = canonicalUrl(pagePath);
  const rendered = new Set<string>();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationProviderRef(),
      {
        "@type": "WebPage",
        name: industry.metadata.title,
        description: industry.metadata.description,
        url: pageUrl,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: canonicalUrl("/") },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: "سایت فوری FastWeb", item: canonicalUrl("/fastweb") },
          { "@type": "ListItem", position: 3, name: industry.name, item: pageUrl },
        ],
      },
      {
        "@type": "Service",
        name: `سایت فوری ${industry.name}`,
        serviceType: industry.searchTerms[0],
        provider: { "@id": ORGANIZATION_ID },
        areaServed: { "@type": "Country", name: "Iran" },
        url: pageUrl,
        description: industry.metadata.description,
      },
      {
        "@type": "FAQPage",
        mainEntity: industry.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <>
      <FastWebIndustryAnalytics industry={industry} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={`min-h-screen ${tone.paper} ${tone.ink}`} dir="rtl">
        <Navbar solid ctaHref={getIndustryOrderHref(industry.slug)} ctaLabel={industry.primaryCta} />
        <main>
          <Breadcrumb industry={industry} />
          {industry.sectionOrder.map((key) => renderSection(key, industry, tone, rendered))}
        </main>
        <Footer />
      </div>
    </>
  );
}
