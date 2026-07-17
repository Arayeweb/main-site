"use client";

import SectionHeader from "@/components/home/SectionHeader";
import {
  clinicBenefits,
  clinicPackages,
  clinicProof,
  clinicServices,
  clinicTurnkey,
} from "@/lib/clinicData";
import { pushGtmEvent } from "@/lib/gtm";

function trackPrice(plan: string) {
  pushGtmEvent("cta_click", { location: `clinic_price_${plan}`, page: "clinic" });
}

export default function ClinicSections() {
  return (
    <>
      {/* Turnkey */}
      <section className="section-py bg-white" id="turnkey">
        <div className="container-mx container-px">
          <SectionHeader
            badge="همه‌چیز با ماست"
            title="از طراحی تا انتشار؛ بدون کار فنی از سمت شما"
            subtitle="آرایه می‌سازد، راه می‌اندازد و نگه می‌دارد. شما کلید تحویل می‌گیرید."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clinicTurnkey.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-navy-100 bg-slate-50/60 p-5 transition hover:border-brand-200 hover:bg-white"
              >
                <h3 className="text-sm font-extrabold text-navy-900">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm font-bold text-navy-500">
            یک قرارداد، یک تیم، یک فاکتور — بدون فریلنسرهای جداگانه.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="section-py bg-slate-50/70" id="services">
        <div className="container-mx container-px">
          <SectionHeader
            badge="برای کلینیک شما"
            title="دقیقاً همان چیزی که کلینیک زیبایی نیاز دارد"
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {clinicServices.map((svc) => (
              <article
                key={svc.title}
                className={`relative rounded-2xl border p-6 ${
                  svc.featured
                    ? "border-brand-200 bg-white shadow-soft ring-1 ring-brand-100"
                    : "border-navy-100 bg-white"
                }`}
              >
                {svc.featured ? (
                  <span className="absolute -top-2.5 start-5 rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    پرتقاضا
                  </span>
                ) : null}
                <h3 className="text-base font-extrabold text-navy-900">{svc.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{svc.desc}</p>
                <ul className="mt-4 space-y-2">
                  {svc.items.map((li) => (
                    <li
                      key={li}
                      className="flex items-start gap-2 text-[12px] font-medium leading-relaxed text-navy-600"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {li}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-py bg-white" id="benefits">
        <div className="container-mx container-px">
          <SectionHeader
            badge="نتیجه واقعی"
            title="آنچه می‌خرید، اعتماد و مراجع بیشتر است"
          />
          <ul className="mx-auto max-w-3xl divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
            {clinicBenefits.map((row) => (
              <li
                key={row.feature}
                className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto_1.2fr] sm:items-center sm:gap-4"
              >
                <span className="text-sm font-extrabold text-navy-900">{row.feature}</span>
                <span className="hidden text-brand-400 sm:block" aria-hidden="true">
                  ←
                </span>
                <span className="text-[13px] leading-relaxed text-navy-500">{row.result}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Proof */}
      <section className="section-py bg-slate-50/70" id="proof">
        <div className="container-mx container-px">
          <SectionHeader badge="اثبات اجتماعی" title="نتیجه را مشتریان‌مان روایت می‌کنند" />
          <div className="grid gap-5 lg:grid-cols-3">
            {clinicProof.map((item) => (
              <figure
                key={item.brand}
                className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6"
              >
                <span className="text-xs font-extrabold text-brand-600">{item.brand}</span>
                <blockquote className="mt-3 flex-1 text-[13px] leading-relaxed text-navy-600">
                  «{item.quote}»
                </blockquote>
                <figcaption className="mt-4 border-t border-navy-50 pt-3">
                  <strong className="block text-sm font-bold text-navy-900">{item.name}</strong>
                  {item.role ? (
                    <span className="mt-0.5 block text-[11px] text-navy-400">{item.role}</span>
                  ) : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <ClinicPricing />
    </>
  );
}

function ClinicPricing() {
  return (
    <section className="section-py bg-white" id="pricing">
      <div className="container-mx container-px">
        <SectionHeader
          badge="پکیج‌ها"
          title="متناسب با اندازه کلینیک شما"
          subtitle="شفاف و بدون هزینه پنهان. مطمئن نیستید؟ در فرم مشاوره بگویید تا پیشنهاد اختصاصی بدهیم."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {clinicPackages.map((pkg) => (
            <article
              key={pkg.key}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                pkg.popular
                  ? "border-brand-300 bg-white shadow-soft ring-1 ring-brand-100"
                  : "border-navy-100 bg-slate-50/50"
              }`}
            >
              {pkg.popular ? (
                <span className="absolute -top-2.5 start-5 rounded-full bg-navy-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  پیشنهاد آرایه
                </span>
              ) : null}
              <span className="text-lg font-extrabold text-navy-900">{pkg.name}</span>
              <p className="mt-1 text-[13px] text-navy-500">{pkg.desc}</p>
              <ul className="mt-5 flex-1 space-y-2">
                {pkg.feats.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-[13px] font-medium text-navy-600"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm font-extrabold text-navy-900">تماس با پشتیبانی</p>
              <a
                href={`#leadform`}
                onClick={() => trackPrice(pkg.key)}
                className={`mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] ${
                  pkg.popular
                    ? "bg-navy-900 text-white hover:bg-navy-800"
                    : "border border-navy-200 bg-white text-navy-700 hover:border-brand-200 hover:text-brand-600"
                }`}
              >
                انتخاب پکیج {pkg.name}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
