import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconCheck } from "@/components/icons";

export const metadata: Metadata = {
  title: { absolute: "سایت کلینیک باید چه امکاناتی داشته باشد؟" },
  description:
    "امکانات ضروری برای سایت کلینیک که واقعاً به رزرو وقت و تماس بیشتر کمک می‌کند: از مسیر نوبت‌دهی تا اعتمادسازی، موبایل و CTA.",
  alternates: {
    canonical: "https://araaye.com/blog/clinic-website-features",
  },
  openGraph: {
    title: "سایت کلینیک باید چه امکاناتی داشته باشد؟",
    description:
      "امکانات ضروری برای سایت کلینیک که واقعاً به رزرو وقت و تماس بیشتر کمک می‌کند.",
    url: "https://araaye.com/blog/clinic-website-features",
    type: "article",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "سایت کلینیک باید چه امکاناتی داشته باشد؟",
    description: "چک‌لیست امکانات لازم برای سایت کلینیک.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const faq = [
  {
    q: "اگر سایت ما فقط معرفی است، از کجا باید تغییر را شروع کنیم؟",
    a: "از بخش‌های رزرو/تماس شروع کنید: دکمه اقدام در دید اول، فرم کوتاه، و مسیر روشن از صفحه خدمات به رزرو. بعد سراغ سرعت، اعتمادسازی و محتوای تخصصی بروید.",
  },
  {
    q: "آیا چت‌بات برای کلینیک ضروری است؟",
    a: "چت‌بات به‌تنهایی جای رزرو را نمی‌گیرد، اما می‌تواند سوال‌های پرتکرار را سریع پاسخ بدهد و کاربر را به مسیر نوبت‌دهی هدایت کند.",
  },
  {
    q: "چه امکاناتی باعث می‌شود کاربر در موبایل اقدام کند؟",
    a: "فرم‌های کوتاه، سرعت بارگذاری، دکمه‌های بزرگ و قابل لمس، و تکرار CTA در طول صفحه مهم‌ترین عوامل هستند.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: "سایت کلینیک باید چه امکاناتی داشته باشد؟",
      description:
        "امکانات ضروری برای سایت کلینیک که واقعاً به رزرو وقت و تماس بیشتر کمک می‌کند.",
      inLanguage: "fa-IR",
      datePublished: "2026-07-08",
      dateModified: "2026-07-08",
      author: { "@type": "Organization", name: "آرایه" },
      publisher: {
        "@type": "Organization",
        name: "آرایه",
        logo: { "@type": "ImageObject", url: "https://araaye.com/assets/og-cover.svg" },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": "https://araaye.com/blog/clinic-website-features" },
      image: "https://araaye.com/assets/og-cover.svg",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "آرایه", item: "https://araaye.com/" },
        { "@type": "ListItem", position: 2, name: "بلاگ", item: "https://araaye.com/blog" },
        {
          "@type": "ListItem",
          position: 3,
          name: "امکانات سایت کلینیک",
          item: "https://araaye.com/blog/clinic-website-features",
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

export default function ClinicWebsiteFeaturesPage() {
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
              <span>امکانات سایت کلینیک</span>
            </nav>

            <div className="mt-4">
              <h1 className="text-balance text-2xl font-extrabold text-navy-900 sm:text-3xl">
                سایت کلینیک باید چه امکاناتی داشته باشد؟
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-navy-600 sm:text-base">
                سایت کلینیک اگر فقط ویترین باشد، سوال ایجاد می‌کند و بیمار را به تماس‌های تلفنی طولانی می‌راند.
                اما اگر امکانات درست را داشته باشد، از سرچ گوگل تا رزرو وقت را کوتاه می‌کند: سریع، روشن و اعتمادساز.
              </p>
            </div>

            <section className="mt-8">
              <h2 className="text-lg font-extrabold text-navy-900">امکاناتی که واقعاً روی رزرو اثر دارند</h2>
              <div className="mt-4 grid gap-4">
                {[
                  {
                    t: "مسیر نوبت‌دهی واضح (رزرو آنلاین یا فرم تماس کوتاه)",
                    d: "بیمار باید بداند دقیقاً چه کار کند. دکمه و فرم باید در دید اول و در طول صفحه تکرار شود.",
                  },
                  {
                    t: "صفحه‌های خدمات/بخش‌ها مطابق نیازهای واقعی",
                    d: "برای هر خدمت یا بخش اصلی، صفحه‌ای داشته باشید که توضیح روشن، روند مراجعه و پاسخ سوالات پرتکرار را بدهد.",
                  },
                  {
                    t: "اعتمادسازی در همان صفحه (نه فقط صفحه درباره ما)",
                    d: "اطلاعات تخصص، قوانین مراجعه و مسیر ارتباط باید در صفحه خدمات هم دیده شود تا کاربر تصمیم بگیرد.",
                  },
                  {
                    t: "چت‌بات یا دستیار پاسخگو برای سوال‌های پرتکرار",
                    d: "چت‌بات باید کاربر را به رزرو/تماس هدایت کند، نه اینکه فقط پیام‌های عمومی بدهد.",
                  },
                  {
                    t: "سرعت و تجربه موبایل",
                    d: "بخش رزرو نباید با اسکریپت‌های سنگین یا تصاویر حجیم کند شود. موبایل اولین صفحه‌ی کاربر است.",
                  },
                  {
                    t: "داده‌های ساختاریافته و FAQ (در صورت داشتن FAQ واقعی)",
                    d: "اگر پرسش‌های پرتکرار دارید، ساختار داده‌ها و FAQ می‌تواند به فهم بهتر صفحه توسط موتورهای جستجو کمک کند.",
                  },
                  {
                    t: "اندازه‌گیری تبدیل و پیگیری لید",
                    d: "رویدادهای شروع رزرو، ارسال فرم و کلیک تماس را اندازه بگیرید تا بفهمید کجا از دست می‌دهید.",
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
              <h2 className="text-lg font-extrabold text-navy-900">چک‌لیست کاربردی</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "رزرو/تماس با یک کلیک قابل دسترس است.",
                  "فرم‌ها در موبایل راحت ارسال می‌شوند.",
                  "اطلاعات تماس، آدرس و ساعات کاری دقیق هستند.",
                  "برای سوالات پرتکرار پاسخ واضح دارید.",
                  "سرعت صفحه به‌خصوص در موبایل قابل قبول است.",
                  "CTAها با هدف صفحه هماهنگ هستند (نه CTA کلی).",
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
                  "عدم تکرار CTA در طول صفحه‌های خدمات.",
                  "طراحی زیبا ولی مسیر تصمیم مبهم.",
                  "کندی در موبایل و سخت بودن ارسال فرم.",
                  "اعتمادسازی پراکنده (فقط در صفحه درباره ما).",
                  "چت‌بات بدون مسیر هدایت به رزرو.",
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
                <h2 className="text-lg font-extrabold text-navy-900">برای قدم بعدی</h2>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">
                  اگر نمی‌دانید کدام بخش سایت شما تبدیل را خراب می‌کند، یک بررسی اولیه رایگان انجام دهید تا
                  روی نقاط تصمیم‌ساز تمرکز کنیم: سرعت، اعتمادسازی، مسیر رزرو و CTA.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="/free-seo-audit" className="btn-primary inline-flex items-center px-5 py-2.5">
                    درخواست تحلیل رایگان
                  </a>
                  <a
                    href="/website/clinic"
                    className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    طراحی سایت کلینیک
                  </a>
                  <a
                    href="/seo/clinic"
                    className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    سئو کلینیک
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

