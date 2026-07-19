import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconCheck } from "@/components/icons";

export const metadata: Metadata = {
  title: { absolute: "چطور پیج اینستاگرام را به سایت تبدیل کنیم؟" },
  description:
    "راهنمای عملی تبدیل پیج اینستاگرام به سایت: چه محتوایی منتقل شود، چه چیزی در اینستاگرام بماند و از کجا شروع کنیم.",
  alternates: {
    canonical: "https://araaye.com/blog/instagram-page-to-website",
  },
  openGraph: {
    title: "چطور پیج اینستاگرام را به سایت تبدیل کنیم؟",
    description:
      "راهنمای عملی تبدیل پیج اینستاگرام به سایت: چه محتوایی منتقل شود و از کجا شروع کنیم.",
    url: "https://araaye.com/blog/instagram-page-to-website",
    type: "article",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "تبدیل پیج اینستاگرام به سایت",
    description: "راهنمای گام‌به‌گام برای کسب‌وکارهای اینستاگرامی.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: "چطور پیج اینستاگرام را به سایت تبدیل کنیم؟",
      description:
        "راهنمای عملی تبدیل پیج اینستاگرام به سایت: چه محتوایی منتقل شود و از کجا شروع کنیم.",
      inLanguage: "fa-IR",
      datePublished: "2026-07-19",
      dateModified: "2026-07-19",
      author: { "@type": "Organization", name: "آرایه" },
      publisher: {
        "@type": "Organization",
        name: "آرایه",
        logo: { "@type": "ImageObject", url: "https://araaye.com/assets/og-cover.svg" },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://araaye.com/blog/instagram-page-to-website",
      },
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
          name: "تبدیل پیج اینستاگرام به سایت",
          item: "https://araaye.com/blog/instagram-page-to-website",
        },
      ],
    },
  ],
};

const steps = [
  {
    t: "۱. هدف سایت را جدا از اینستاگرام تعریف کنید",
    d: "اینستاگرام برای تعامل و محتوای کوتاه است. سایت برای توضیح کامل خدمات، تماس رسمی، فرم درخواست و دیده‌شدن در گوگل. هر کدام نقش خود را دارد.",
  },
  {
    t: "۲. ساختار صفحات را از محتوای موجود استخراج کنید",
    d: "هایلایت‌ها، پست‌های پرتکرار و سوالات DM را به صفحات تبدیل کنید: خانه، خدمات، درباره ما، تماس، و در صورت نیاز FAQ.",
  },
  {
    t: "۳. محتوای ثابت را به سایت منتقل کنید",
    d: "قیمت پایه، آدرس، ساعات کاری، نمونه‌کار و قوانین — چیزهایی که در اینستاگرام مدام تکرار می‌کنید باید در سایت یک‌جا و به‌روز باشند.",
  },
  {
    t: "۴. مسیر تماس را ساده کنید",
    d: "دکمه تماس، واتساپ یا فرم کوتاه در دید اول. لینک سایت را در بیو و استوری‌های مهم قرار دهید.",
  },
  {
    t: "۵. برند بصری را هماهنگ نگه دارید",
    d: "رنگ، فونت و لحن متن در سایت با پیج هماهنگ باشد تا کاربر حس نکند وارد جای ناآشنا شده است.",
  },
  {
    t: "۶. با نسخه ساده شروع کنید",
    d: "اگر عجله دارید، یک صفحه معرفی کافی است. بعداً صفحات خدمت و وبلاگ اضافه کنید — لازم نیست روز اول همه‌چیز کامل باشد.",
  },
];

export default function InstagramPageToWebsitePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Navbar ctaHref="/website-design" ctaLabel="طراحی سایت" />

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
              <span>تبدیل پیج اینستاگرام به سایت</span>
            </nav>

            <div className="mt-4">
              <h1 className="text-balance text-2xl font-extrabold text-navy-900 sm:text-3xl">
                چطور پیج اینستاگرام را به سایت تبدیل کنیم؟
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-navy-600 sm:text-base">
                بسیاری از کسب‌وکارها با اینستاگرام شروع می‌کنند. وقتی مشتری جدی‌تر می‌شود یا می‌خواهید در
                گوگل دیده شوید، سایت مکمل طبیعی پیج است — نه جایگزین یک‌شبه آن.
              </p>
            </div>

            <section className="mt-8">
              <h2 className="text-lg font-extrabold text-navy-900">چرا سایت در کنار اینستاگرام لازم است؟</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "جست‌وجو در گوگل به پیج اینستاگرام محدود نیست",
                  "توضیح کامل خدمات بدون محدودیت استوری",
                  "فرم تماس و ردیابی تبدیل دقیق‌تر",
                  "حضور رسمی برای قرارداد و اعتماد B2B",
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
              <h2 className="text-lg font-extrabold text-navy-900">گام‌های عملی</h2>
              <div className="mt-4 grid gap-4">
                {steps.map((item) => (
                  <div key={item.t} className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                    <h3 className="font-extrabold text-navy-900">{item.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-navy-600">{item.d}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-extrabold text-navy-900">چه چیزی در اینستاگرام بماند؟</h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">
                محتوای روزانه، استوری، تعامل و تبلیغات هدفمند همچنان در اینستاگرام می‌ماند. سایت جایی است
                که کاربر وقتی تصمیم گرفت، جزئیات را بخواند و اقدام کند. لینک سایت را در بیو، هایلایت
                «خدمات» و کپشن پست‌های مهم تکرار کنید.
              </p>
            </section>

            <section className="mt-10">
              <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                <h2 className="text-lg font-extrabold text-navy-900">از کجا شروع کنیم؟</h2>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">
                  اگر محتوای پیج آماده است و فقط به حضور رسمی سریع نیاز دارید، مسیر سایت فوری منطقی است.
                  برای برند اختصاصی یا چند صفحه خدمت، طراحی اختصاصی را ببینید. کسب‌وکارهای اینستاگرامی
                  هم می‌توانند از راهنمای تخصصی طراحی سایت اینستاگرامی استفاده کنند.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="/website/instagram-business" className="btn-primary inline-flex items-center px-5 py-2.5">
                    طراحی سایت اینستاگرامی
                  </a>
                  <a
                    href="/fastweb"
                    className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    سایت فوری
                  </a>
                  <a
                    href="/website-design"
                    className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    طراحی سایت اختصاصی
                  </a>
                </div>
              </div>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
