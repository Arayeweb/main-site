"use client";

import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/home/SectionHeader";
import { pushGtmEvent } from "@/lib/gtm";
import { PORTFOLIO_SECTION_ID, portfolioItems } from "@/data/website-design";

export default function WebsiteDesignPortfolio() {
  if (!portfolioItems.length) {
    return null;
  }

  return (
    <section id={PORTFOLIO_SECTION_ID} className="section-py scroll-mt-24 bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="نمونه‌کارها"
          title="نمونه‌هایی از پروژه‌های طراحی و توسعه"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioItems.map((item) => {
            const cardContent = (
              <>
                <div className="relative aspect-[16/10] overflow-hidden bg-navy-100">
                  <Image
                    src={item.image}
                    alt={`نمای ${item.name}`}
                    fill
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[11px] font-bold text-brand-600">{item.industry}</p>
                  <h3 className="mt-1 text-base font-extrabold text-navy-900">{item.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-navy-500">
                    <span className="font-bold text-navy-700">مسئله: </span>
                    {item.problem}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-navy-500">
                    <span className="font-bold text-navy-700">خروجی: </span>
                    {item.outcome}
                  </p>
                </div>
              </>
            );

            const className =
              "group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card";

            if (item.external) {
              return (
                <a
                  key={item.slug}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  onClick={() =>
                    pushGtmEvent("website_design_portfolio_click", {
                      page: "/website-design",
                      project: item.slug,
                      timestamp: Date.now(),
                    })
                  }
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <Link
                key={item.slug}
                href={item.href}
                className={className}
                onClick={() =>
                  pushGtmEvent("website_design_portfolio_click", {
                    page: "/website-design",
                    project: item.slug,
                    timestamp: Date.now(),
                  })
                }
              >
                {cardContent}
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/#real-portfolio"
            onClick={() =>
              pushGtmEvent("website_design_portfolio_click", {
                page: "/website-design",
                location: "view_all",
                timestamp: Date.now(),
              })
            }
            className="btn-secondary"
          >
            مشاهده همه نمونه‌کارها
          </Link>
        </div>
      </div>
    </section>
  );
}
