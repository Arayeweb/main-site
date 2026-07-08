import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconCheck } from "@/components/icons";
import FreeSeoAuditForm from "@/components/seo/FreeSeoAuditForm";
import FreeSeoAuditStickyCta from "@/components/seo/FreeSeoAuditStickyCta";

export const metadata: Metadata = {
  title: {
    absolute: "تحلیل رایگان سایت و سئو | بررسی رایگان سایت با آرایه",
  },
  description:
    "آدرس سایت خود را وارد کنید تا آرایه سایت شما را از نظر سئو، سرعت، تجربه موبایل، اعتمادسازی و مسیر جذب مشتری بررسی کند.",
  alternates: {
    canonical: "https://araaye.com/free-seo-audit",
  },
  openGraph: {
    title: "تحلیل رایگان سایت و سئو | بررسی رایگان سایت با آرایه",
    description:
      "آدرس سایت خود را وارد کنید تا آرایه سایت شما را از نظر سئو، سرعت، تجربه موبایل، اعتمادسازی و مسیر جذب مشتری بررسی کند.",
    url: "https://araaye.com/free-seo-audit",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "تحلیل رایگان سایت و سئو | بررسی رایگان سایت با آرایه",
    description:
      "آدرس سایت خود را وارد کنید تا آرایه سایت شما را از نظر سئو، سرعت، تجربه موبایل، اعتمادسازی و مسیر جذب مشتری بررسی کند.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "تحلیل رایگان سایت و سئو",
      serviceType: "Free SEO audit and conversion path review",
      provider: { "@type": "Organization", name: "آرایه", url: "https://araaye.com/" },
      areaServed: { "@type": "Country", name: "ایران" },
      url: "https://araaye.com/free-seo-audit",
      description:
        "ارسال آدرس سایت برای دریافت یک بررسی اولیه رایگان از سئو، سرعت، تجربه موبایل و مسیر جذب مشتری.",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "آرایه", item: "https://araaye.com/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "تحلیل رایگان سایت و سئو",
          item: "https://araaye.com/free-seo-audit",
        },
      ],
    },
  ],
};

export default function FreeSeoAuditPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar tone="dark-hero" ctaHref="#lead-form" ctaLabel="درخواست تحلیل رایگان" />
      <main className="pb-16">
        <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-white pt-14 pb-10 sm:pt-20 sm:pb-14">
          <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />
          <div className="pointer-events-none absolute top-40 -left-20 h-64 w-64 rounded-full bg-sky-200/20 blur-3xl" />

          <div className="container-mx container-px relative text-center">
            <span className="badge mb-5 bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              آرایه — بررسی اولیه رایگان
            </span>

            <h1 className="mx-auto max-w-3xl text-balance text-3xl font-extrabold leading-[1.3] text-navy-900 sm:text-4xl lg:text-5xl">
              تحلیل رایگان سایت و سئو
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-navy-500 sm:text-lg">
              آدرس سایتت رو وارد کن؛ آرایه سایتت رو از نظر سئو، سرعت، تجربه موبایل، اعتمادسازی و مسیر جذب
              مشتری بررسی می‌کند.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a href="#lead-form" className="btn-primary inline-flex items-center px-6 py-3">
                درخواست تحلیل رایگان
              </a>
            </div>

            <div className="mt-10 mx-auto max-w-3xl rounded-3xl border border-navy-100 bg-white/70 p-6 shadow-soft backdrop-blur-sm">
              <h2 className="text-sm font-extrabold text-navy-900">تیم آرایه این موارد را چک می‌کند</h2>
              <ul className="mt-4 grid gap-2 text-right text-sm text-navy-600 sm:grid-cols-2">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <IconCheck size={12} />
                  </span>
                  اصول اولیه سئو و ساختار صفحات
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <IconCheck size={12} />
                  </span>
                  مشکلات فنی و ایندکس‌پذیری
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <IconCheck size={12} />
                  </span>
                  تجربه موبایل و UX
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <IconCheck size={12} />
                  </span>
                  سرعت و Page Speed
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <IconCheck size={12} />
                  </span>
                  سیگنال‌های اعتمادسازی
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <IconCheck size={12} />
                  </span>
                  CTA و مسیر تماس/رزرو
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <IconCheck size={12} />
                  </span>
                  آمادگی سئو محلی
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <IconCheck size={12} />
                  </span>
                  مسیر تبدیل به نوبت/تماس
                </li>
              </ul>

              <p className="mt-4 text-[13px] leading-relaxed text-navy-500">
                این صفحه وعدهٔ «نتایج فوری» یا ۱۰۰٪ اتوماسیون را نمی‌دهد. درخواست شما برای یک بررسی اولیه ارسال می‌شود
                و نتیجه اولیه را با شما هماهنگ می‌کنیم.
              </p>
            </div>
          </div>
        </section>

        <section className="section-py pt-10">
          <div className="container-mx container-px">
            <FreeSeoAuditForm />
          </div>
        </section>
      </main>

      <Footer />
      <FreeSeoAuditStickyCta />
    </>
  );
}

