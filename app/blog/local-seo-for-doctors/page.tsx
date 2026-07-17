import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconCheck } from "@/components/icons";

const COVER_SRC = "/assets/blog/local-seo-for-doctors.jpg";
const COVER_URL = `https://araaye.com${COVER_SRC}`;

export const metadata: Metadata = {
  title: { absolute: "لوکال سئو برای پزشکان؛ چطور در جستجوهای محلی بهتر دیده شویم؟" },
  description:
    "لوکال سئو برای پزشکان: چک‌لیست عملی برای دیده‌شدن در نتایج محلی، بدون تولید صفحه‌های بی‌محتوا یا اسپم.",
  alternates: {
    canonical: "https://araaye.com/blog/local-seo-for-doctors",
  },
  openGraph: {
    title: "لوکال سئو برای پزشکان؛ چطور در جستجوهای محلی بهتر دیده شویم؟",
    description:
      "لوکال سئو برای پزشکان: چک‌لیست عملی برای دیده‌شدن در نتایج محلی.",
    url: "https://araaye.com/blog/local-seo-for-doctors",
    type: "article",
    locale: "fa_IR",
    images: [{ url: COVER_URL }],
  },
  twitter: {
    card: "summary_large_image",
    title: "لوکال سئو برای پزشکان؛ چطور در جستجوهای محلی بهتر دیده شویم؟",
    description: "چک‌لیست عملی لوکال سئو برای پزشکان.",
    images: [COVER_URL],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const faq = [
  {
    q: "آیا باید برای هر شهر صفحه جدا بسازیم؟",
    a: "برای لوکال سئو معمولاً لازم نیست (و اغلب به نتیجه نمی‌رسد). به‌جای آن روی صفحات تخصصیِ واقعی، اطلاعات دقیق آدرس/دسترسی و سیگنال‌های محلی تمرکز کنید.",
  },
  {
    q: "بهینه‌سازی Google Business Profile چه تاثیری دارد؟",
    a: "بیشتر نتایج محلی به اطلاعات و سیگنال‌های همان پروفایل واکنش نشان می‌دهد. دسته‌بندی درست، عکس‌های واقعی و سازگاری NAP مهم است.",
  },
  {
    q: "چطور بفهمم لوکال سئو کار می‌کند؟",
    a: "در Search Console و گزارش‌های محلی، به افزایش ایمپرشن و کلیک برای عبارت‌های محلی (مثل «نوبت دکتر نزدیک من») نگاه کنید. بعد هم ورودی‌ها را به تماس/رزرو وصل کنید و تبدیل را اندازه بگیرید.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: "لوکال سئو برای پزشکان؛ چطور در جستجوهای محلی بهتر دیده شویم؟",
      description: "لوکال سئو برای پزشکان؛ چک‌لیست عملی برای دیده‌شدن در نتایج محلی.",
      inLanguage: "fa-IR",
      datePublished: "2026-07-08",
      dateModified: "2026-07-08",
      author: { "@type": "Organization", name: "آرایه" },
      publisher: {
        "@type": "Organization",
        name: "آرایه",
        logo: { "@type": "ImageObject", url: "https://araaye.com/assets/og-cover.svg" },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://araaye.com/blog/local-seo-for-doctors",
      },
      image: COVER_URL,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "آرایه", item: "https://araaye.com/" },
        { "@type": "ListItem", position: 2, name: "بلاگ", item: "https://araaye.com/blog" },
        {
          "@type": "ListItem",
          position: 3,
          name: "لوکال سئو برای پزشکان",
          item: "https://araaye.com/blog/local-seo-for-doctors",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function LocalSeoForDoctorsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar ctaHref="/free-seo-audit" ctaLabel="تحلیل رایگان سایت" />

      <main className="pb-16">
        <article className="container-mx container-px mx-auto pt-12">
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
            <nav className="text-sm text-navy-500" aria-label="مسیر صفحه">
              <a href="https://araaye.com/" className="hover:text-navy-900">
                آرایه
              </a>
              <span className="px-2">/</span>
              <a href="/blog" className="hover:text-navy-900">
                بلاگ
              </a>
              <span className="px-2">/</span>
              <span>لوکال سئو برای پزشکان</span>
            </nav>

            <div className="mt-4">
              <h1 className="text-balance text-2xl font-extrabold text-navy-900 sm:text-3xl">
                لوکال سئو برای پزشکان؛ چطور در جستجوهای محلی بهتر دیده شویم؟
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-navy-600 sm:text-base">
                خیلی از بیماران دنبال «نزدیک من» یا «در این محله» هستند. اگر اطلاعات مطب شما دقیق نباشد یا
                سیگنال‌های محلی در سایت و پروفایل‌ها کامل نباشد، حتی با محتوای خوب هم ممکن است دیده نشوید.
              </p>
            </div>

            <div className="relative mt-6 aspect-[1280/560] overflow-hidden rounded-2xl bg-navy-50">
              <Image
                src={COVER_SRC}
                alt="لوکال سئو برای پزشکان"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 760px"
                priority
              />
            </div>

            <section className="mt-8">
              <h2 className="text-lg font-extrabold text-navy-900">۶ اقدام که واقعاً روی نتایج محلی اثر دارد</h2>
              <div className="mt-4 grid gap-4">
                {[
                  {
                    t: "۱) Google Business Profile را دقیق و کامل کنید",
                    d: "دسته‌بندی درست، ساعت کاری واقعی، عکس‌های واقعی، توضیح کوتاه و لینک مسیر تماس/نوبت را تنظیم کنید.",
                  },
                  {
                    t: "۲) NAP را یکدست نگه دارید",
                    d: "نام، آدرس و شماره تماس باید در سایت و منابع بیرونی (دائیرکتوری‌ها، پروفایل‌ها) یکسان باشد.",
                  },
                  {
                    t: "۳) در سایت صفحه «راهنمای مراجعه» بسازید",
                    d: "یک صفحه کاربردی برای آدرس، راه دسترسی، پارکینگ/رمپ، روند اولین مراجعه و سوالات پرتکرار. این صفحه به نیت محلی جواب می‌دهد.",
                  },
                  {
                    t: "۴) اعتمادسازی محلی را در همان صفحه تخصصی بیاورید",
                    d: "اطلاعات مطب و تخصص را در صفحات مربوط به همان خدمات، نه فقط صفحه تماس، قرار دهید تا مسیر تصمیم کوتاه شود.",
                  },
                  {
                    t: "۵) داده‌های ساختاریافته درست استفاده کنید",
                    d: "اگر پروژه شما JSON-LD برای سازمان/سرویس/بردکرامب دارد، کامل و مطابق آدرس واقعی باشد تا برداشت ربات‌ها بهتر شود.",
                  },
                  {
                    t: "۶) تبدیل را رصد کنید",
                    d: "به جای نگاه کلی به بازدید، رویداد «شروع رزرو/ارسال فرم/تماس» را ببینید تا بفهمید لوکال سئو باعث اقدام می‌شود یا نه.",
                  },
                ].map((item) => (
                  <div key={item.t} className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                    <h3 className="font-extrabold text-navy-900">{item.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-navy-600">{item.d}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-extrabold text-navy-900">چک‌لیست لوکال (بدون اسپم)</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "اطلاعات مطب (آدرس/تلفن/ساعات) در سایت یکدست است.",
                  "لینک رزرو یا فرم تماس از صفحات تخصصی قابل دسترس است.",
                  "صفحه راهنمای مراجعه دارید و برای «نزدیک من» بی‌هدف نیست.",
                  "برای درخواست‌های محلی، محتوا و CTA همان صفحه مرتبط است.",
                  "در پروفایل‌های بیرونی، NAP دقیقاً مطابق است.",
                  "آمار تبدیل (تماس/فرم) فعال و قابل رصد است.",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2 text-sm text-navy-600">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                      <IconCheck size={12} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-extrabold text-navy-900">اشتباهات رایج</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "تولید صفحات متعدد با محتوای نزدیک به هم برای شهرها/محله‌ها.",
                  "بی‌توجهی به سرعت موبایل و مسیر رزرو.",
                  "وجود اطلاعات متناقض (آدرس/شماره/ساعت) در منابع مختلف.",
                  "نداشتن صفحه راهنمای مراجعه یا CTA ضعیف.",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2 text-sm text-navy-600">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                      <IconCheck size={12} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                <h2 className="text-lg font-extrabold text-navy-900">قدم بعدی</h2>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">
                  یک بررسی اولیه از صفحه‌ای که کاربران محلی از گوگل واردش می‌شوند انجام دهید و سپس مسیر
                  تبدیل (تماس/رزرو) را اصلاح کنید. اگر ساختار فعلی شما نیاز به تغییر دارد، می‌شود از مسیرهای تخصصی سئو/وب‌سایت پزشک شروع کرد.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="/free-seo-audit" className="btn-primary inline-flex items-center px-5 py-2.5">
                    درخواست تحلیل رایگان
                  </a>
                  <a
                    href="/seo/doctor"
                    className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    سئو سایت پزشکان
                  </a>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-extrabold text-navy-900">سوالات متداول</h2>
              <div className="mt-4 grid gap-3">
                {faq.map((item) => (
                  <details
                    key={item.q}
                    className="rounded-2xl border border-navy-100 bg-white p-4 text-sm"
                    open={false}
                  >
                    <summary className="cursor-pointer font-bold text-navy-900">{item.q}</summary>
                    <div className="mt-2 text-navy-600 leading-relaxed">{item.a}</div>
                  </details>
                ))}
              </div>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}

