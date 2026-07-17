import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconCheck } from "@/components/icons";

const COVER_SRC = "/assets/blog/clinic-seo-checklist.jpg";
const COVER_URL = `https://araaye.com${COVER_SRC}`;

export const metadata: Metadata = {
  title: {
    absolute: "چک‌لیست سئو کلینیک؛ از سرچ گوگل تا رزرو وقت",
  },
  description:
    "چک‌لیست عملی برای سئو کلینیک‌ها؛ از آماده‌سازی صفحه خدمات تا مسیر رزرو و اعتمادسازی. بدون محتواهای کلی و بی‌اثر.",
  alternates: {
    canonical: "https://araaye.com/blog/clinic-seo-checklist",
  },
  openGraph: {
    title: "چک‌لیست سئو کلینیک؛ از سرچ گوگل تا رزرو وقت",
    description:
      "چک‌لیست عملی برای سئو کلینیک‌ها؛ از آماده‌سازی صفحه خدمات تا مسیر رزرو و اعتمادسازی.",
    url: "https://araaye.com/blog/clinic-seo-checklist",
    type: "article",
    locale: "fa_IR",
    images: [{ url: COVER_URL }],
  },
  twitter: {
    card: "summary_large_image",
    title: "چک‌لیست سئو کلینیک؛ از سرچ گوگل تا رزرو وقت",
    description: "چک‌لیست عملی برای سئو کلینیک‌ها.",
    images: [COVER_URL],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const faq = [
  {
    q: "برای کلینیک چندبخشی، از کجا شروع کنیم؟",
    a: "از صفحاتی شروع کنید که بیشترین نیت رزرو را پوشش می‌دهند: صفحات تخصص‌ها/خدمات اصلی + مسیر رزرو واضح. بعد سراغ بلاگ و صفحات پشتیبان بروید.",
  },
  {
    q: "آیا سئو کلینیک بدون نوبت‌دهی آنلاین هم جواب می‌دهد؟",
    a: "سئو بدون مسیر اقدام ضعیف است. حتی اگر کاربر تماس بگیرد، باید مسیر تماس و فرم‌ها دقیق و سریع باشند. رزرو آنلاین معمولاً تبدیل را بهتر می‌کند.",
  },
  {
    q: "چطور مطمئن شوم گوگل صفحه‌های مهم ما را می‌بیند؟",
    a: "با Search Console و بررسی وضعیت ایندکس شروع کنید. بعد URLهای مهم را در sitemap و لینک‌دهی داخلی حمایت کنید تا ربات‌ها راحت‌تر کشف کنند.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: "چک‌لیست سئو کلینیک؛ از سرچ گوگل تا رزرو وقت",
      description:
        "چک‌لیست عملی برای سئو کلینیک‌ها؛ از آماده‌سازی صفحه خدمات تا مسیر رزرو و اعتمادسازی.",
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
        "@id": "https://araaye.com/blog/clinic-seo-checklist",
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
          name: "چک‌لیست سئو کلینیک",
          item: "https://araaye.com/blog/clinic-seo-checklist",
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

export default function ClinicSeoChecklistPage() {
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
              <span>چک‌لیست سئو کلینیک</span>
            </nav>

            <div className="mt-4">
              <h1 className="text-balance text-2xl font-extrabold text-navy-900 sm:text-3xl">
                چک‌لیست سئو کلینیک؛ از سرچ گوگل تا رزرو وقت
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-navy-600 sm:text-base">
                سئو کلینیک فقط «رتبه گرفتن» نیست. کاربر وقتی وارد سایت می‌شود باید بداند دقیقاً کجا
                رزرو کند، به چه بخش‌هایی دسترسی دارد و چرا این کلینیک قابل اعتماد است. اگر این مسیر واضح نباشد، ترافیک
                می‌آید ولی رزرو کم می‌شود.
              </p>
            </div>

            <div className="relative mt-6 aspect-[1280/560] overflow-hidden rounded-2xl bg-navy-50">
              <Image
                src={COVER_SRC}
                alt="چک‌لیست سئو کلینیک"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 760px"
                priority
              />
            </div>

            <section className="mt-8">
              <h2 className="text-lg font-extrabold text-navy-900">۷ قدم عملی برای کلینیک‌های چندبخشی</h2>
              <ol className="mt-4 space-y-4">
                {[
                  {
                    t: "۱) صفحات خدمات را بر اساس نیت رزرو بسازید",
                    d: "برای هر بخش/خدمت اصلی، صفحه‌ای داشته باشید که سوالات واقعی بیمار را پاسخ بدهد و مسیر اقدام را مستقیم به رزرو وصل کند.",
                  },
                  {
                    t: "۲) مسیر رزرو را در جای درست نمایش دهید",
                    d: "رزرو آنلاین یا فرم تماس باید در بالا و در ادامه صفحه تکرار شود (به‌خصوص برای موبایل).",
                  },
                  {
                    t: "۳) اعتمادسازی را در همان صفحه خدمات بیاورید",
                    d: "اطلاعات تخصص‌ها، قوانین مراجعه، نمونه‌های واقعی (بدون ادعاهای قطعی) و روال پیگیری را همانجا توضیح دهید.",
                  },
                  {
                    t: "۴) سرعت و تجربه موبایل را اولویت دهید",
                    d: "صفحه‌های خدمات کلینیک نباید کند باشند. بهینه‌سازی تصاویر و حذف المان‌های سنگین کمک می‌کند کاربر قبل از اقدام خارج نشود.",
                  },
                  {
                    t: "۵) سئو محلی را با NAP یکدست انجام دهید",
                    d: "نام/آدرس/تلفن (NAP) باید در سایت و پروفایل‌های شما یکسان باشد. آدرس و راه دسترسی را شفاف نگه دارید.",
                  },
                  {
                    t: "۶) ساختار داخلی و لینک‌دهی را اصلاح کنید",
                    d: "از صفحات پر بازدید، به رزرو و صفحات خدمات اصلی لینک دهید تا ربات‌ها و کاربرها سردرگم نشوند.",
                  },
                  {
                    t: "۷) اندازه‌گیری تبدیل را فعال کنید",
                    d: "رویدادهای «ارسال فرم»، «کلیک تماس» و «شروع رزرو» را رصد کنید تا بدانید کدام بخش مسیر را خراب می‌کند.",
                  },
                ].map((item) => (
                  <li key={item.t}>
                    <h3 className="font-extrabold text-navy-900">{item.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-navy-600">{item.d}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-extrabold text-navy-900">چک‌لیست رزرو محور</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "صفحه خدمات، عنوان و محتوا دقیقاً مطابق عبارت جستجو است.",
                  "دکمه رزرو/تماس در دید اول دیده می‌شود.",
                  "فرم‌ها کوتاه و موبایل‌پسند هستند.",
                  "اعتمادسازی در همان صفحه انجام شده است.",
                  "آدرس، تلفن و ساعات کاری یکدست و قابل پیدا کردن است.",
                  "لینک‌های داخلی از تخصص‌ها به رزرو وجود دارد.",
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
                  "صفحه خدمات فقط معرفی است و مسیر اقدام ندارد.",
                  "رزرو فقط در پایین صفحه است و کاربر فرصت تصمیم ندارد.",
                  "اطلاعات اعتماد در بخش‌های پراکنده سایت است.",
                  "سایت موبایل کند است و فرم ارسال سخت می‌شود.",
                  "لینک‌دهی داخلی از صفحات ورودی به صفحات رزرو ضعیف است.",
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
              <h2 className="text-lg font-extrabold text-navy-900">قدم بعدی</h2>
              <div className="mt-4 rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                <p className="text-sm leading-relaxed text-navy-600">
                  یک بررسی اولیه از صفحه‌ای که بیشترین ورودی گوگل را دارد انجام دهید، سپس مسیر تبدیل را اصلاح کنید:
                  CTA، فرم رزرو، اعتمادسازی و بخش‌هایی که با نیت جستجو هم‌خوان نیستند. برای بازنویسی متن‌های
                  CTA و مقایسه چند نسخه،{" "}
                  <a href="/ai" className="font-bold text-teal-800 hover:text-teal-950">
                    هوش مصنوعی آرایه
                  </a>{" "}
                  را امتحان کنید.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="/free-seo-audit" className="btn-primary inline-flex items-center px-5 py-2.5">
                    درخواست تحلیل رایگان
                  </a>
                  <a
                    href="/seo/clinic"
                    className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    سئو کلینیک
                  </a>
                  <a
                    href="/website/clinic"
                    className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    طراحی سایت کلینیک
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

