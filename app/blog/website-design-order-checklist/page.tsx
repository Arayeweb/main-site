import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconCheck } from "@/components/icons";

export const metadata: Metadata = {
  title: { absolute: "چک‌لیست سفارش طراحی سایت؛ قبل از قرارداد چه چیزهایی بدانیم؟" },
  description:
    "چک‌لیست عملی قبل از قرارداد طراحی سایت: تعیین هدف، صفحات، محتوا، دامنه، زمان‌بندی و سوالات مهم برای برآورد دقیق.",
  alternates: {
    canonical: "https://araaye.com/blog/website-design-order-checklist",
  },
  openGraph: {
    title: "چک‌لیست سفارش طراحی سایت؛ قبل از قرارداد چه چیزهایی بدانیم؟",
    description:
      "چک‌لیست عملی قبل از قرارداد طراحی سایت: تعیین هدف، صفحات، محتوا و سوالات مهم برای برآورد دقیق.",
    url: "https://araaye.com/blog/website-design-order-checklist",
    type: "article",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "چک‌لیست سفارش طراحی سایت",
    description: "قبل از قرارداد طراحی سایت چه چیزهایی را مشخص کنیم؟",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const faq = [
  {
    q: "آیا باید قبل از تماس با آژانس، لیست صفحات را کامل بدانیم؟",
    a: "نه لزوماً. کافی است هدف اصلی (معرفی، جذب لید، فروش) و خدمات/محصولات اصلی را بدانید. لیست دقیق صفحات در جلسه اولیه یا فرم درخواست تکمیل می‌شود.",
  },
  {
    q: "محتوا را خودمان آماده کنیم یا آژانس؟",
    a: "هر دو مدل ممکن است. اگر متن و تصویر آماده دارید هزینه کمتر می‌شود. تولید محتوا معمولاً جداگانه برآورد می‌شود — قبل از قرارداد مشخص کنید.",
  },
  {
    q: "چطور بفهمیم به سایت فوری نیاز داریم یا طراحی اختصاصی؟",
    a: "اگر فقط حضور رسمی سریع می‌خواهید و صفحات محدود است، مسیر فوری منطقی‌تر است. اگر چند خدمت، برند اختصاصی یا فروشگاه دارید، طراحی اختصاصی مناسب‌تر است.",
  },
  {
    q: "چه چیزهایی باید در قرارداد شفاف باشد؟",
    a: "صفحات و امکانات داخل Scope، تعداد دور اصلاح، زمان تحویل، پشتیبانی پس از راه‌اندازی، و مواردی که هزینه جدا دارند (دامنه، هاست، محتوا، سئو مستمر).",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: "چک‌لیست سفارش طراحی سایت؛ قبل از قرارداد چه چیزهایی بدانیم؟",
      description:
        "چک‌لیست عملی قبل از قرارداد طراحی سایت: تعیین هدف، صفحات، محتوا و سوالات مهم برای برآورد دقیق.",
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
        "@id": "https://araaye.com/blog/website-design-order-checklist",
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
          name: "چک‌لیست سفارش طراحی سایت",
          item: "https://araaye.com/blog/website-design-order-checklist",
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

const checklistItems = [
  {
    t: "هدف اصلی سایت را بنویسید",
    d: "تماس بگیرید؟ فرم پر شود؟ محصول فروخته شود؟ یک هدف اصلی کافی است؛ بقیه اهداف فرعی هستند.",
  },
  {
    t: "مخاطب و پیام اصلی را مشخص کنید",
    d: "کاربر وقتی وارد سایت می‌شود باید در چند ثانیه بفهمد شما چه کاری انجام می‌دهید و چرا باید اقدام کند.",
  },
  {
    t: "صفحات ضروری را فهرست کنید",
    d: "حداقل: خانه، خدمات/محصولات، درباره ما، تماس. برای هر خدمت مهم، صفحه جدا در نظر بگیرید.",
  },
  {
    t: "وضعیت محتوا را روشن کنید",
    d: "متن، عکس و لوگو آماده دارید یا نیاز به تولید دارید؟ این موضوع مستقیم روی زمان و هزینه اثر دارد.",
  },
  {
    t: "دامنه و هاست را بررسی کنید",
    d: "دامنه ثبت شده دارید؟ اگر نه، نام دامنه و پسوند (.ir یا بین‌المللی) را زودتر تصمیم بگیرید.",
  },
  {
    t: "امکانات خاص را لیست کنید",
    d: "فرم پیشرفته، چندزبانه، فروشگاه، درگاه، اتصال CRM یا نوبت‌دهی — هر کدام Scope و قیمت را تغییر می‌دهد.",
  },
  {
    t: "زمان‌بندی واقع‌بینانه تعیین کنید",
    d: "سایت فوری برای حضور سریع است؛ پروژه اختصاصی به هفته‌ها زمان نیاز دارد. تاریخ‌های مهم (رویداد، کمپین) را بگویید.",
  },
  {
    t: "بودجه و محدوده را شفاف کنید",
    d: "بودجه تقریبی کمک می‌کند مسیر درست (فوری یا اختصاصی) پیشنهاد شود. جدول تعرفه را ببینید و سوال بپرسید.",
  },
];

export default function WebsiteDesignOrderChecklistPage() {
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
              <span>چک‌لیست سفارش طراحی سایت</span>
            </nav>

            <div className="mt-4">
              <h1 className="text-balance text-2xl font-extrabold text-navy-900 sm:text-3xl">
                چک‌لیست سفارش طراحی سایت؛ قبل از قرارداد چه چیزهایی بدانیم؟
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-navy-600 sm:text-base">
                قبل از امضای قرارداد طراحی سایت، چند تصمیم ساده زمان و هزینه را شفاف می‌کند. این چک‌لیست
                آموزشی است — برای برآورد دقیق، Scope پروژه باید مشخص شود.
              </p>
            </div>

            <section className="mt-8">
              <h2 className="text-lg font-extrabold text-navy-900">چک‌لیست قبل از قرارداد</h2>
              <div className="mt-4 grid gap-4">
                {checklistItems.map((item) => (
                  <div key={item.t} className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                    <h3 className="font-extrabold text-navy-900">{item.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-navy-600">{item.d}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-extrabold text-navy-900">سوالات مهم برای آژانس یا تیم فنی</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "چه صفحات و امکاناتی داخل Scope پایه است؟",
                  "چند دور اصلاح شامل می‌شود؟",
                  "دامنه، هاست و SSL چطور محاسبه می‌شود؟",
                  "پشتیبانی پس از تحویل چقدر است؟",
                  "تولید محتوا و سئو مستمر جداگانه است؟",
                  "مالکیت کد و دسترسی‌ها بعد از تحویل با کیست؟",
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
              <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                <h2 className="text-lg font-extrabold text-navy-900">قدم بعدی</h2>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">
                  اگر چک‌لیست را مرور کردید، می‌توانید تعرفه‌ها را مقایسه کنید یا برای پروژه‌ای با زمان
                  محدود، مسیر سایت فوری را ببینید.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="/website-design" className="btn-primary inline-flex items-center px-5 py-2.5">
                    صفحه طراحی سایت
                  </a>
                  <a
                    href="/website-design/cost"
                    className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    قیمت طراحی سایت
                  </a>
                  <a
                    href="/fastweb"
                    className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    سایت فوری FastWeb
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
