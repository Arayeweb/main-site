import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconCheck } from "@/components/icons";

export const metadata: Metadata = {
  title: {
    absolute: "۷ اشتباه رایج سئو سایت پزشکان که باعث از دست رفتن بیمار می‌شود",
  },
  description:
    "۷ اشتباه رایج در سئو و ساختار سایت پزشکان که باعث می‌شود بیمار از مسیر گوگل خارج شود. با چک‌لیست عملی و قدم بعدی به شما کمک می‌کنیم.",
  alternates: {
    canonical: "https://araaye.com/blog/doctor-website-seo-mistakes",
  },
  openGraph: {
    title: "۷ اشتباه رایج سئو سایت پزشکان که باعث از دست رفتن بیمار می‌شود",
    description:
      "۷ اشتباه رایج در سئو و ساختار سایت پزشکان که باعث می‌شود بیمار از مسیر گوگل خارج شود. با چک‌لیست عملی و قدم بعدی به شما کمک می‌کنیم.",
    url: "https://araaye.com/blog/doctor-website-seo-mistakes",
    type: "article",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "۷ اشتباه رایج سئو سایت پزشکان که باعث از دست رفتن بیمار می‌شود",
    description:
      "۷ اشتباه رایج در سئو و ساختار سایت پزشکان که باعث می‌شود بیمار از مسیر گوگل خارج شود.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const faq = [
  {
    q: "برای سئو سایت پزشک، اول محتوای بلاگ بهتر است یا صفحه‌های تخصصی؟",
    a: "اگر هدف شما تبدیل مراجعه‌کننده به تماس/نوبت است، اول باید مسیر رزرو و صفحات تخصصیِ مطابق نیت جستجو را درست کنید. بلاگ بعد از آن، نقش پشتیبان را دارد.",
  },
  {
    q: "چطور بفهمم مشکل از سئو است یا از CTA و مسیر تماس؟",
    a: "در ۲ هفته اول، به رفتار کاربر نگاه کنید: اگر ورودی دارید ولی تماس/نوبت ندارید، معمولاً مشکل CTA، فرم‌ها یا سرعت/موبایل است. اگر ورودی ندارید، باید روی ایندکس و سیگنال‌های مرتبط تمرکز کنید.",
  },
  {
    q: "آیا لازم است برای هر تخصص یک صفحه جدا بسازم؟",
    a: "به‌صورت کلی، وقتی تخصص شما نیت جستجوی مشخص و نیازهای متفاوت دارد، صفحه تخصصی جدا (با محتوای واقعی و مسیر رزرو روشن) مفیدتر است. اما از کپی‌های نزدیک و بی‌محتوا پرهیز کنید.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: "۷ اشتباه رایج سئو سایت پزشکان که باعث از دست رفتن بیمار می‌شود",
      description:
        "۷ اشتباه رایج در سئو و ساختار سایت پزشکان که باعث می‌شود بیمار از مسیر گوگل خارج شود.",
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
        "@id": "https://araaye.com/blog/doctor-website-seo-mistakes",
      },
      image: "https://araaye.com/assets/og-cover.svg",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "آرایه", item: "https://araaye.com/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "بلاگ",
          item: "https://araaye.com/blog",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "اشتباهات سئو سایت پزشکان",
          item: "https://araaye.com/blog/doctor-website-seo-mistakes",
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

export default function DoctorWebsiteSeoMistakesPage() {
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
              <span>۷ اشتباه رایج سئو سایت پزشکان</span>
            </nav>

            <div className="mt-4">
              <h1 className="text-balance text-2xl font-extrabold text-navy-900 sm:text-3xl">
                ۷ اشتباه رایج سئو سایت پزشکان که باعث از دست رفتن بیمار می‌شود
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-navy-600 sm:text-base">
                وقتی بیمار در گوگل دنبال علائم یا تخصص می‌گردد، انتظار دارد در همان صفحه بتواند تصمیم بگیرد و
                نوبت بگیرد. اگر سایت فقط «معرفی» باشد یا مسیر تماس/رزرو مبهم شود، کاربر قبل از اقدام خارج می‌شود،
                حتی اگر رتبه هم داشته باشید.
              </p>
            </div>

            <section className="mt-8">
              <h2 className="text-lg font-extrabold text-navy-900">۷ اشتباه رایج (و جایگزین درست)</h2>
              <div className="mt-4 grid gap-4">
                <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                  <h3 className="font-extrabold text-navy-900">۱) صفحه تخصصی ضعیف یا غیرمرتبط</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">
                    اگر متن صفحه با چیزی که کاربر در گوگل سرچ می‌کند هم‌خوان نباشد، حتی ترافیک هم به تماس تبدیل نمی‌شود.
                    محتوای واقعیِ مربوط به تخصص (روش مراجعه، روند بررسی، سوالات پرتکرار) لازم است.
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                  <h3 className="font-extrabold text-navy-900">۲) CTA و مسیر رزرو پنهان یا دیرهنگام</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">
                    دکمه نوبت یا فرم تماس باید در جای مشخص باشد؛ نه فقط در انتهای صفحه. همچنین فرم‌ها باید کوتاه و موبایل‌پسند باشند.
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                  <h3 className="font-extrabold text-navy-900">۳) سرعت پایین در موبایل</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">
                    کاربر موبایل صبر نمی‌کند. از تصویرهای سنگین، اسکریپت‌های اضافی و فونت‌های بی‌مورد دوری کنید تا مسیر رزرو کند نشود.
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                  <h3 className="font-extrabold text-navy-900">۴) سیگنال اعتماد ضعیف</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">
                    درباره تخصص، رزومه/مدارک، روش ارتباط و قوانین مراجعه توضیح روشن دهید. «ابهام» باعث عقب‌رفتن کاربر می‌شود.
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                  <h3 className="font-extrabold text-navy-900">۵) سئو محلی بدون آماده‌سازی</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">
                    اگر مخاطب محلی دنبال شماست، باید اطلاعات موقعیت (NAP)، مسیر دسترسی و سیگنال‌های محلی در سایت و کانال‌های مربوط آماده باشد.
                    از تولید صفحه‌های بی‌محتوا برای شهرهای زیاد پرهیز کنید.
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                  <h3 className="font-extrabold text-navy-900">۶) نبود FAQ یا پاسخ‌های غیرعملی</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">
                    FAQ اگر «کوتاه و دقیق» نباشد، فقط ظاهر سئو را پر می‌کند. سوالات واقعی مثل «چطور نوبت می‌گیرم؟»، «برای اولین مراجعه چه کنم؟» را پاسخ دهید.
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                  <h3 className="font-extrabold text-navy-900">۷) نادیده گرفتن اندازه‌گیری تبدیل</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">
                    اگر فقط رتبه و بازدید را ببینید، نمی‌فهمید کجا کاربر را از دست می‌دهید. رویدادهای تماس، ارسال فرم و کلیک CTA را رصد کنید.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-extrabold text-navy-900">چک‌لیست سریع برای امروز</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "در صفحه تخصصی، دکمه نوبت/تماس در دید اول هست؟",
                  "فرم‌ها در موبایل بدون دردسر ارسال می‌شوند؟",
                  "سرعت صفحه تخصصی قابل قبول است و تصویرها بهینه‌اند؟",
                  "اطلاعات اعتماد (اعتبار تخصص، قوانین مراجعه، مسیر ارتباط) روشن است؟",
                  "توضیحی درباره روند اولین مراجعه وجود دارد؟",
                  "اطلاعات محلی (آدرس، راه دسترسی، تلفن/ساعت کاری) یکدست است؟",
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
              <h2 className="text-lg font-extrabold text-navy-900">مهم‌ترین کار بعدی</h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">
                یک بازبینی واقعی از صفحه‌ای که بیشترین ورودی را از گوگل می‌گیرد انجام دهید و سپس «مسیر تبدیل» را
                اصلاح کنید: از CTA و فرم تا اعتمادسازی و بخش‌های محتوایی مرتبط با نیت جستجو.
              </p>
              <div className="mt-4 rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                <p className="text-sm font-bold text-navy-900">برای بررسی اولیه رایگان، همینجا اقدام کنید:</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a href="/free-seo-audit" className="btn-primary inline-flex items-center px-5 py-2.5">
                    درخواست تحلیل رایگان
                  </a>
                  <a
                    href="/seo/doctor"
                    className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    سئو سایت پزشکان
                  </a>
                  <a
                    href="/website/doctor"
                    className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    طراحی سایت پزشک
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

