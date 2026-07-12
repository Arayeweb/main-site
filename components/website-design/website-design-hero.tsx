"use client";

import Link from "next/link";
import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { PORTFOLIO_SECTION_ID } from "@/data/website-design";
import MedisaHomePreview from "@/components/home/previews/MedisaHomePreview";
import ShivaClinicHomePreview from "@/components/home/previews/ShivaClinicHomePreview";
import DeepinHomePreview from "@/components/home/previews/DeepinHomePreview";
import WebsiteDesignHeroLeadBar, {
  HERO_LEAD_BAR_ID,
  HERO_LEAD_BAR_OPEN_EVENT,
} from "@/components/website-design/website-design-hero-lead-bar";

const ACCENT = "#3157F6";
const HERO_BG = "#F4F6FF";

const FEATURED_PROJECTS = [
  {
    id: "medisa",
    name: "استودیو معماری مدیسا",
    description: "سایت معرفی پروژه‌ها و دریافت درخواست همکاری",
    href: "/showcase/medisa-studio",
    Preview: MedisaHomePreview,
    thumbLabel: "استودیو معماری مدیسا",
  },
  {
    id: "shiva",
    name: "کلینیک شنوایی شیوا",
    description: "سایت معرفی خدمات شنوایی و دریافت درخواست مشاوره",
    href: "/showcase/shiva-hearing",
    Preview: ShivaClinicHomePreview,
    thumbLabel: "کلینیک شنوایی شیوا",
  },
  {
    id: "deepinhq",
    name: "DeepinHQ",
    description: "سایت محصول SaaS برای معرفی پلتفرم، قابلیت‌ها و ثبت‌نام کاربران",
    href: "https://deepinhq.com",
    Preview: DeepinHomePreview,
    thumbLabel: "DeepinHQ",
  },
] as const;

type ProjectId = (typeof FEATURED_PROJECTS)[number]["id"];

function track(event: string, extra: Record<string, string | number | undefined> = {}) {
  pushGtmEvent(event, {
    page: "/website-design",
    timestamp: Date.now(),
    ...extra,
  });
}

const ctaBase =
  "inline-flex h-14 items-center justify-center rounded-xl px-6 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157F6] focus-visible:ring-offset-2 active:scale-[0.98] sm:px-7";

function FeaturedPreview() {
  const [activeId, setActiveId] = useState<ProjectId>("medisa");
  const activeIndex = FEATURED_PROJECTS.findIndex((p) => p.id === activeId);
  const active = FEATURED_PROJECTS[activeIndex] ?? FEATURED_PROJECTS[0];
  const ActivePreview = active.Preview;
  const others = FEATURED_PROJECTS.filter((p) => p.id !== activeId);

  return (
    <div className="w-full">
      <div className="relative mx-auto w-full max-w-[1200px] pb-6 md:pb-20">
        <div className="overflow-hidden rounded-[12px] border border-navy-100/90 bg-white shadow-soft">
          <div className="pointer-events-none max-h-[650px] select-none overflow-hidden [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!shadow-none">
            {active.id === "medisa" ? <MedisaHomePreview decorative /> : <ActivePreview />}
          </div>

          <div className="flex flex-col gap-3 border-t border-navy-100 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5 sm:py-4">
            <div className="text-right">
              <p className="text-sm font-extrabold text-navy-900 sm:text-[15px]">{active.name}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-navy-500">{active.description}</p>
              {active.href.startsWith("http") ? (
                <a
                  href={active.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track("website_design_portfolio_click", {
                      location: "hero_featured_link",
                      project: active.id,
                    })
                  }
                  className="mt-2 inline-flex items-center text-[13px] font-bold transition-colors hover:opacity-80"
                  style={{ color: ACCENT }}
                >
                  مشاهده پروژه
                  <span aria-hidden="true" className="ms-1">
                    ↗
                  </span>
                </a>
              ) : (
                <Link
                  href={active.href}
                  onClick={() =>
                    track("website_design_portfolio_click", {
                      location: "hero_featured_link",
                      project: active.id,
                    })
                  }
                  className="mt-2 inline-flex items-center text-[13px] font-bold transition-colors hover:opacity-80"
                  style={{ color: ACCENT }}
                >
                  مشاهده پروژه
                  <span aria-hidden="true" className="ms-1">
                    ↗
                  </span>
                </Link>
              )}
            </div>
            <p className="shrink-0 text-[12px] font-bold tabular-nums text-navy-400 sm:text-[13px]">
              {String(activeIndex + 1).padStart(2, "0")} / {String(FEATURED_PROJECTS.length).padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className="relative z-10 mx-auto hidden w-[calc(100%-2rem)] max-w-[900px] md:absolute md:bottom-0 md:left-1/2 md:block md:-translate-x-1/2 md:translate-y-1/2">
          <WebsiteDesignHeroLeadBar />
        </div>
      </div>

      {others.length > 0 ? (
        <div className="mx-auto mt-4 flex max-w-[1200px] flex-wrap items-stretch justify-center gap-3 sm:gap-4">
          {others.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => {
                setActiveId(project.id);
                track("website_design_portfolio_click", {
                  location: "hero_thumbnail",
                  project: project.id,
                });
              }}
              className="min-w-[140px] flex-1 rounded-[12px] border border-navy-100 bg-white px-4 py-3 text-center text-[13px] font-bold text-navy-700 transition-colors hover:border-[#C5D0FF] hover:text-[#3157F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157F6] focus-visible:ring-offset-2 sm:max-w-[280px] sm:flex-none"
            >
              {project.thumbLabel}
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-4 text-center text-[12px] font-medium leading-relaxed text-navy-400 sm:text-[13px]">
        طراحی اختصاصی · نمایش درست در موبایل · آماده برای گوگل · اتصال فرم و تماس
      </p>
    </div>
  );
}

export default function WebsiteDesignHero() {
  return (
    <section
      className="relative overflow-hidden pb-36 md:pb-16"
      style={{ backgroundColor: HERO_BG, paddingTop: "calc(3.5rem + 80px)" }}
    >
      <div className="container-mx container-px">
        <div className="mx-auto flex max-w-[950px] flex-col items-center text-center">
          <span
            className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold"
            style={{ backgroundColor: "#E8EDFF", color: ACCENT }}
          >
            طراحی سایت آرایه
          </span>

          <h1 className="mt-[28px] max-w-[950px] text-balance text-[clamp(2rem,4.2vw,4.25rem)] font-extrabold leading-[1.12] tracking-tight text-navy-900">
            <span className="block">سایتی که به مشتری نشان دهد</span>
            <span className="block">چرا باید شما را انتخاب کند</span>
          </h1>

          <p className="mt-8 max-w-[780px] text-[15px] leading-[1.9] text-navy-500 sm:text-base">
            خدمات، نمونه‌کارها و تفاوت کسب‌وکار شما را طوری کنار هم می‌چینیم که مشتری با
            اطمینان تصمیم بگیرد؛ برای مشاوره، رزرو، سفارش یا شروع همکاری.
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row sm:justify-center">
            <a
              href={`#${PORTFOLIO_SECTION_ID}`}
              onClick={() => track("website_design_portfolio_click", { location: "hero_primary" })}
              className={`${ctaBase} text-white hover:opacity-95`}
              style={{ backgroundColor: ACCENT }}
            >
              مشاهده نمونه سایت‌ها
            </a>
            <button
              type="button"
              onClick={() => {
                track("cta_click", { location: "website_design_hero_chat" });
                window.dispatchEvent(new CustomEvent(HERO_LEAD_BAR_OPEN_EVENT));
                const target = document.getElementById(HERO_LEAD_BAR_ID);
                if (target) {
                  target.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className={`${ctaBase} border border-navy-200 bg-white text-navy-700 hover:border-[#C5D0FF] hover:bg-white hover:text-navy-900`}
            >
              گفت‌وگو درباره سایت
            </button>
          </div>
        </div>

        <div className="mx-auto mt-16 w-full max-w-[1200px]">
          <FeaturedPreview />
        </div>
      </div>
    </section>
  );
}
