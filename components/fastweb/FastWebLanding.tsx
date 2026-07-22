"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { pushGtmEvent } from "@/lib/gtm";
import { getAllFastWebIndustries, getFastWebIndustryPath } from "@/lib/fastweb/industries";
import { getAllFastWebCategories } from "@/lib/fastwebCategories";
import { getFastWebCategoryIcon } from "@/components/fastweb/fastwebCategoryIcons";
import MiniSite from "@/components/fastweb/landing/MiniSite";
import ProductionLine from "@/components/fastweb/landing/ProductionLine";
import {
  FASTWEB_ORDER_HREF,
  HERO_STAGE,
  PRICE_SHEET,
  SCOPE_LEDGER,
  SHOWCASE,
  SPEC_COLOPHON,
  fastwebFaq,
} from "@/components/fastweb/landing/content";
import "@/components/fastweb/landing/fastweb.css";

// Re-exported for backward compatibility (page metadata + industry landing).
export { FASTWEB_ORDER_HREF, fastwebFaq };

type CtaPosition = "hero" | "manifest" | "showcase" | "pricing" | "final";

function track(position: CtaPosition, extra: Record<string, string> = {}) {
  pushGtmEvent("fastweb_cta_click", {
    page_path: "/fastweb",
    cta_position: position,
    offer: "fastweb",
    ...extra,
  });
}

function useReveal() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(document.querySelectorAll<HTMLElement>(".fw-reveal"));
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ------------------------------- HERO --------------------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 sm:pt-28">
      <div className="fw-shell">
        {/* index line */}
        <div className="flex items-center justify-between border-b border-[var(--fw-line)] pb-4">
          <span className="fw-annot">سایت فوری آرایه</span>
          <span className="fw-index">۲۰۲۶ / نسخهٔ اول</span>
        </div>

        {/* asymmetric masthead */}
        <div className="grid grid-cols-12 gap-x-4 pt-8 sm:pt-12">
          <h1 className="fw-display-1 col-span-12 lg:col-span-11">
            سایت فوری،
            <br />
            برای کسب‌وکارهایی که باید
            <br className="hidden sm:block" /> همین حالا{" "}
            <span className="fw-accent-word">دیده شوند</span>.
          </h1>

          <div className="col-span-12 mt-8 flex flex-col gap-7 sm:mt-12 lg:col-span-6">
            <p className="fw-lead">
              کسب‌وکارت را در چند سؤال کوتاه توضیح می‌دهی؛ آرایه نسخهٔ اول قابل
              انتشار را با ساختار، متن و طراحیِ مناسب آماده می‌کند. قبل از پرداخت،
              همان سایت را <span className="font-bold text-[var(--fw-ink)]">زنده</span> می‌بینی.
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link href={FASTWEB_ORDER_HREF} onClick={() => track("hero")} className="fw-cta-solid fw-focus">
                شروع سفارش
                <span aria-hidden="true">←</span>
              </Link>
              <Link href={SHOWCASE.dominant.href} onClick={() => track("hero", { target: "demo" })} className="fw-cta-text fw-focus">
                دیدن یک دموی واقعی
              </Link>
            </div>
          </div>

          {/* right-aligned meta colophon — asymmetry + deliberate empty space */}
          <dl className="col-span-12 mt-8 grid grid-cols-2 gap-x-6 gap-y-4 self-end sm:mt-12 lg:col-span-5 lg:col-start-8 lg:grid-cols-2">
            {SPEC_COLOPHON.slice(0, 2).map((item) => (
              <div key={item.term} className="border-t border-[var(--fw-line)] pt-3">
                <dt className="text-[0.75rem] font-bold text-[var(--fw-muted)]">{item.term}</dt>
                <dd className="mt-1 text-[0.95rem] font-extrabold text-[var(--fw-ink)]">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* staggered stage of three real website outputs */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 lg:grid-cols-3 lg:gap-6">
          {HERO_STAGE.map((item, i) => (
            <figure
              key={item.variant}
              className={`fw-reveal ${i === 1 ? "lg:mt-10" : ""} ${i === 2 ? "lg:mt-20" : ""}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="fw-annot">{item.industry}</span>
                <span className="fw-index">{item.index}</span>
              </div>
              <div className="fw-frame aspect-[16/10]">
                <MiniSite variant={item.variant} device={item.device} />
              </div>
              <figcaption className="mt-3 flex items-center gap-4 text-[0.8rem] text-[var(--fw-muted)]">
                <span>
                  <span className="text-[var(--fw-ink)]">هدف:</span> {item.goal}
                </span>
                <span className="h-3 w-px bg-[var(--fw-line-strong)]" aria-hidden="true" />
                <span>
                  <span className="text-[var(--fw-ink)]">جهت:</span> {item.direction}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- MANIFEST -------------------------------- */
function Manifest() {
  return (
    <section className="mt-[var(--fw-section)]">
      <div className="w-full border-y border-[var(--fw-ink)] bg-[var(--fw-paper-3)]">
        <div className="fw-shell grid grid-cols-12 items-end gap-x-4 gap-y-10 py-[var(--fw-section-tight)]">
          <p className="fw-display-2 col-span-12 max-w-4xl font-extrabold lg:col-span-8">
            یک صفحهٔ درست‌ساخته‌شده، بیشتر از ده‌ها پست پراکندهٔ اینستاگرام{" "}
            <span className="fw-accent-word">کار می‌کند</span>.
          </p>
          <dl className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-5 lg:col-span-4">
            {SPEC_COLOPHON.map((item) => (
              <div key={item.term} className="border-t border-[var(--fw-line-strong)] pt-2.5">
                <dt className="text-[0.72rem] font-bold text-[var(--fw-muted)]">{item.term}</dt>
                <dd className="mt-1 text-[0.9rem] font-extrabold">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ CATEGORIES ------------------------------ */
function Categories() {
  const categories = getAllFastWebCategories();
  return (
    <section className="fw-shell mt-[var(--fw-section)]">
      <div className="grid grid-cols-12 items-end gap-4">
        <div className="col-span-12 lg:col-span-8">
          <span className="fw-annot">۱۰ دسته اصلی</span>
          <h2 className="fw-display-2 mt-4">
            برای هر کسب‌وکار، ساختار
            <br />
            <span className="fw-accent-word">مخصوص همان صنف</span>
          </h2>
        </div>
        <p className="col-span-12 self-end text-[0.9rem] leading-7 text-[var(--fw-muted)] lg:col-span-4">
          هرکدام روی ۵ ساختار پایه ساخته شده‌اند، اما بخش‌ها و چیدمان مخصوص همان
          صنف است — نه یک قالب یکسان با رنگ متفاوت.
        </p>
      </div>

      <hr className="fw-rule-strong mt-8" />
      <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category, i) => {
          const Icon = getFastWebCategoryIcon(category.icon);
          return (
            <Link
              key={category.key}
              href={`${FASTWEB_ORDER_HREF}?category=${category.key}`}
              onClick={() => track("manifest", { category: category.key })}
              className="fw-focus group flex flex-col gap-3 border-b border-[var(--fw-line)] px-1 py-6 transition-colors hover:bg-[var(--fw-paper-3)] sm:border-e sm:px-4"
            >
              <div className="flex items-center justify-between">
                <span className="fw-index">{String(i + 1).padStart(2, "0")}</span>
                <Icon className="h-4 w-4 text-[var(--fw-muted)] transition-colors group-hover:text-[var(--fw-accent)]" aria-hidden="true" />
              </div>
              <h3 className="text-[1.02rem] font-extrabold text-[var(--fw-ink)]">
                {category.label}
              </h3>
              <p className="text-[0.8rem] leading-6 text-[var(--fw-muted)]">
                {category.targetMarket.slice(0, 3).join("، ")}
              </p>
            </Link>
          );
        })}
      </div>
      <hr className="fw-rule" />
    </section>
  );
}

/* ------------------------------ SHOWCASE ------------------------------- */
function Showcase() {
  const { dominant, secondary } = SHOWCASE;
  return (
    <section className="fw-shell mt-[var(--fw-section)]">
      <div className="grid grid-cols-12 items-end gap-x-4 gap-y-6">
        <div className="col-span-12 lg:col-span-7">
          <span className="fw-annot">نمونه‌ها</span>
          <h2 className="fw-display-2 mt-4">
            سه کسب‌وکار،
            <br />
            سه <span className="fw-accent-word">زبان طراحی</span> متفاوت
          </h2>
        </div>
        <p className="col-span-12 self-end text-[0.95rem] leading-8 text-[var(--fw-muted)] lg:col-span-4 lg:col-start-9">
          هر نمونه ساختار و چیدمان متفاوتی دارد — نه فقط رنگ متفاوت. سایت تو هم بر
          اساس همان کسب‌وکار ساخته می‌شود، نه یک قالب آماده.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-12 gap-6">
        {/* dominant desktop */}
        <figure className="fw-reveal col-span-12 lg:col-span-8">
          <Link href={dominant.href} onClick={() => track("showcase", { target: "demo" })} className="fw-focus block">
            <div className="fw-frame fw-frame-lg aspect-[16/10]">
              <MiniSite variant={dominant.variant} device={dominant.device} />
            </div>
          </Link>
          <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
            <span className="flex items-baseline gap-2">
              <span className="fw-index">{dominant.index}</span>
              <span className="text-[1.05rem] font-extrabold">{dominant.title}</span>
              <span className="text-[0.85rem] text-[var(--fw-muted)]">— {dominant.kind}</span>
            </span>
            <span className="text-[0.82rem] text-[var(--fw-muted)]">{dominant.note}</span>
          </figcaption>
        </figure>

        {/* secondary mobile crops */}
        <div className="col-span-12 grid grid-cols-2 gap-6 lg:col-span-4 lg:grid-cols-1">
          {secondary.map((item) => (
            <figure key={item.variant} className="fw-reveal">
              <div className="fw-frame mx-auto aspect-[10/19] w-full max-w-[190px] lg:max-w-[160px]">
                <MiniSite variant={item.variant} device={item.device} />
              </div>
              <figcaption className="mt-3 text-center lg:text-right">
                <span className="flex items-baseline justify-center gap-2 lg:justify-start">
                  <span className="fw-index">{item.index}</span>
                  <span className="text-[0.95rem] font-extrabold">{item.title}</span>
                </span>
                <p className="mt-1 text-[0.78rem] leading-6 text-[var(--fw-muted)]">{item.note}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- INDUSTRIES ------------------------------- */
function IndustriesIndex() {
  const industries = getAllFastWebIndustries();
  return (
    <section className="fw-shell mt-[var(--fw-section)]">
      <div className="grid grid-cols-12 items-end gap-4">
        <div className="col-span-12 lg:col-span-9">
          <span className="fw-annot">صنف‌ها</span>
          <h2 className="fw-display-2 mt-4">سایت فوری برای چه کسب‌وکارهایی مناسب است؟</h2>
        </div>
        <span className="col-span-12 self-end text-[0.85rem] text-[var(--fw-muted)] lg:col-span-3 lg:text-left">
          {industries.length} صنف با صفحهٔ اختصاصی
        </span>
      </div>

      <hr className="fw-rule-strong mt-8" />
      <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-4 py-8">
        {industries.map((industry, i) => (
          <li key={industry.slug} className="flex items-baseline gap-6">
            <Link
              href={getFastWebIndustryPath(industry.slug)}
              className="fw-focus group inline-flex items-baseline gap-2 text-[1.05rem] font-bold text-[var(--fw-ink)] transition-colors hover:text-[var(--fw-accent)] sm:text-[1.3rem]"
            >
              <span className="fw-index">{String(i + 1).padStart(2, "0")}</span>
              {industry.hubAnchor}
            </Link>
            {i < industries.length - 1 && (
              <span aria-hidden="true" className="text-[var(--fw-line-strong)]">
                ·
              </span>
            )}
          </li>
        ))}
      </ul>
      <hr className="fw-rule" />
    </section>
  );
}

/* ------------------------------- SCOPE --------------------------------- */
function LedgerColumn({
  head,
  items,
  tone,
}: {
  head: string;
  items: readonly string[];
  tone: "in" | "out";
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between border-b-[1.5px] border-[var(--fw-ink)] pb-3">
        <h3 className="fw-display-3 text-[1.25rem]">{head}</h3>
        <span className="fw-index">{tone === "in" ? "شامل" : "خارج"}</span>
      </div>
      <ul>
        {items.map((item, i) => (
          <li
            key={item}
            className="flex items-baseline gap-4 border-b border-[var(--fw-line)] py-3.5"
          >
            <span className="w-6 shrink-0 font-mono text-[0.75rem] text-[var(--fw-muted)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={`text-[0.98rem] ${
                tone === "in" ? "font-semibold text-[var(--fw-ink)]" : "text-[var(--fw-muted)] line-through decoration-[var(--fw-line-strong)]"
              }`}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Scope() {
  return (
    <section className="fw-shell mt-[var(--fw-section)]">
      <div className="max-w-2xl">
        <span className="fw-annot">محدودهٔ کار</span>
        <h2 className="fw-display-2 mt-4">دقیقاً چه چیزی می‌گیری</h2>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
        <LedgerColumn head="داخل بسته" items={SCOPE_LEDGER.included} tone="in" />
        <LedgerColumn head="خارج از بسته" items={SCOPE_LEDGER.excluded} tone="out" />
      </div>
      <p className="mt-8 max-w-xl text-[0.92rem] leading-8 text-[var(--fw-muted)]">
        امکانات خارج از بسته را می‌توانی از طریق{" "}
        <Link href="/website-design" className="font-bold text-[var(--fw-ink)] underline decoration-[var(--fw-accent)] underline-offset-4">
          طراحی سایت اختصاصی آرایه
        </Link>{" "}
        پیش ببری.
      </p>
    </section>
  );
}

/* ------------------------------- PRICING ------------------------------- */
function Pricing() {
  return (
    <section className="fw-shell mt-[var(--fw-section)]">
      <div className="grid grid-cols-12 items-end gap-4">
        <div className="col-span-12 lg:col-span-8">
          <span className="fw-annot">قیمت</span>
          <h2 className="fw-display-2 mt-4">دو بسته، بدون پیچیدگی</h2>
        </div>
        <p className="col-span-12 self-end text-[0.9rem] text-[var(--fw-muted)] lg:col-span-4">
          قیمت‌ها شفاف است. میزبانی یک‌ساله و دامنهٔ .ir در صورت آزاد بودن، شامل هر دو بسته می‌شود.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {PRICE_SHEET.map((plan) => (
          <div
            key={plan.key}
            className="flex flex-col p-7 sm:p-9"
            style={{
              borderRadius: "var(--fw-r-md)",
              border: plan.emphasized ? "1.5px solid var(--fw-ink)" : "1px solid var(--fw-line)",
              background: plan.emphasized ? "var(--fw-paper)" : "transparent",
            }}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="fw-display-3 text-[1.4rem]">{plan.name}</h3>
              {plan.emphasized && (
                <span className="rounded-[var(--fw-r-sm)] bg-[var(--fw-accent)] px-2.5 py-1 text-[0.72rem] font-bold text-white">
                  پرطرفدار
                </span>
              )}
            </div>
            <p className="mt-2 text-[0.92rem] leading-7 text-[var(--fw-muted)]">{plan.tagline}</p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-[0.85rem] text-[var(--fw-muted)]">از</span>
              <span className="text-[2.6rem] font-black leading-none tracking-tight">{plan.price}</span>
              <span className="text-[0.9rem] font-bold text-[var(--fw-muted)]">تومان</span>
            </div>

            <dl className="mt-6 grid grid-cols-3 border-y border-[var(--fw-line)]">
              {plan.meta.map((m, i) => (
                <div
                  key={m.term}
                  className={`py-3 text-center ${i > 0 ? "border-s border-[var(--fw-line)]" : ""}`}
                >
                  <dt className="text-[0.72rem] text-[var(--fw-muted)]">{m.term}</dt>
                  <dd className="mt-1 text-[0.85rem] font-extrabold">{m.value}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-6 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-baseline gap-2.5 text-[0.92rem] text-[var(--fw-ink)]">
                  <span className="mt-0.5 text-[var(--fw-accent)]">—</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={`${FASTWEB_ORDER_HREF}?package=${plan.packageParam}`}
              onClick={() => track("pricing", { package: plan.packageParam })}
              className={`fw-focus mt-8 inline-flex items-center justify-center gap-2 py-3.5 text-[0.95rem] font-bold ${
                plan.emphasized ? "fw-cta-solid" : ""
              }`}
              style={
                plan.emphasized
                  ? undefined
                  : { border: "1.5px solid var(--fw-ink)", borderRadius: "var(--fw-r-sm)", color: "var(--fw-ink)" }
              }
            >
              انتخاب {plan.name}
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- FAQ --------------------------------- */
function Faq() {
  return (
    <section id="faq" className="fw-shell mt-[var(--fw-section)] scroll-mt-24">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4">
          <span className="fw-annot">پرسش‌های رایج</span>
          <h2 className="fw-display-2 mt-4 lg:sticky lg:top-24">
            چیزهایی که
            <br />
            معمولاً می‌پرسند
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          {fastwebFaq.map((item, i) => (
            <details key={item.q} className="group border-b border-[var(--fw-line)] first:border-t">
              <summary className="flex cursor-pointer list-none items-baseline gap-4 py-5 text-right [&::-webkit-details-marker]:hidden">
                <span className="fw-index shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-[1.02rem] font-bold text-[var(--fw-ink)]">{item.q}</span>
                <span aria-hidden="true" className="shrink-0 text-xl font-light text-[var(--fw-muted)] transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 ps-11 text-[0.95rem] leading-8 text-[var(--fw-muted)]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- CLOSING ------------------------------- */
function Closing() {
  return (
    <section className="mt-[var(--fw-section)]">
      <div className="w-full bg-[var(--fw-ink)] text-[var(--fw-paper)]">
        <div className="fw-shell grid grid-cols-12 items-center gap-y-10 py-[var(--fw-section)]">
          <div className="col-span-12 lg:col-span-8">
            <span className="fw-annot" style={{ color: "rgba(244,241,234,0.6)" }}>
              شروع سفارش
            </span>
            <p className="fw-display-2 mt-5 text-[var(--fw-paper)]">
              کسب‌وکارت را توضیح بده،
              <br />
              نسخهٔ اول را در <span style={{ color: "var(--fw-accent)" }}>۲۴ ساعت</span> ببین.
            </p>
          </div>
          <div className="col-span-12 flex lg:col-span-4 lg:justify-end">
            <Link
              href={FASTWEB_ORDER_HREF}
              onClick={() => track("final")}
              className="fw-focus inline-flex items-center gap-2 rounded-[var(--fw-r-sm)] bg-[var(--fw-paper)] px-7 py-4 text-[1rem] font-extrabold text-[var(--fw-ink)] transition-colors hover:bg-white"
            >
              شروع سفارش سایت فوری
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function FastWebLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal();

  return (
    <div ref={rootRef} className="fw" dir="rtl">
      <Navbar solid ctaHref={FASTWEB_ORDER_HREF} ctaLabel="شروع سفارش" />
      <main className="pb-px">
        <Hero />
        <Manifest />
        <ProductionLine />
        <Categories />
        <Showcase />
        <IndustriesIndex />
        <Scope />
        <Pricing />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
