import type { Metadata } from "next";
import Link from "next/link";
import WebsiteDesignNavbar from "@/components/website-design/WebsiteDesignNavbar";
import Footer from "@/components/Footer";
import WebsitePricingViewAnalytics from "@/components/website-design/WebsitePricingViewAnalytics";
import { IconCheck } from "@/components/icons";
import { canonicalUrl } from "@/lib/siteUrl";
import { organizationProviderRef } from "@/lib/seo/siteIdentity";
import {
  FASTWEB_START_PRICE_TOMAN,
  formatWebsiteDesignPrice,
  WEBSITE_PRICING_OFFERS,
  WEBSITE_PRICING_UPDATED_AT,
  websiteDesignPricingExtras,
} from "@/lib/websitePricing";
import { LEAD_FORM_ID } from "@/data/website-design";

const PAGE_PATH = "/website-design/cost";

export const metadata: Metadata = {
  title: { absolute: "قیمت طراحی سایت | تعرفه سایت فوری و اختصاصی | آرایه" },
  description:
    "قیمت طراحی سایت آرایه را شفاف مقایسه کنید؛ سایت فوری، سایت معرفی کسب‌وکار، سایت حرفه‌ای محتوایی و فروشگاه آنلاین همراه با زمان و امکانات هر پکیج.",
  alternates: {
    canonical: PAGE_PATH,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: "قیمت طراحی سایت | تعرفه سایت فوری و اختصاصی | آرایه",
    description:
      "قیمت طراحی سایت آرایه را شفاف مقایسه کنید؛ سایت فوری، سایت معرفی کسب‌وکار، سایت حرفه‌ای محتوایی و فروشگاه آنلاین همراه با زمان و امکانات هر پکیج.",
    url: PAGE_PATH,
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "قیمت طراحی سایت | تعرفه سایت فوری و اختصاصی | آرایه",
    description:
      "قیمت طراحی سایت آرایه را شفاف مقایسه کنید؛ سایت فوری، سایت معرفی کسب‌وکار، سایت حرفه‌ای محتوایی و فروشگاه آنلاین.",
  },
};

const faq = [
  {
    q: "قیمت نهایی طراحی سایت چه زمانی مشخص می‌شود؟",
    a: "بعد از تعیین دقیق صفحات، امکانات، محتوا و زمان‌بندی. مبلغ «شروع از» فقط نقطه شروع برآورد است و قیمت قطعی در پیش‌فاکتور اعلام می‌شود.",
  },
  {
    q: "آیا دامنه و هاست در قیمت پکیج‌ها هست؟",
    a: "دامنه و هاست سالانه جداگانه محاسبه می‌شود. در صورت نیاز، انتخاب و راه‌اندازی اولیه می‌تواند در محدوده پروژه قرار گیرد.",
  },
  {
    q: "تفاوت سایت فوری (FastWeb) با طراحی اختصاصی چیست؟",
    a: "FastWeb برای حضور رسمی سریع با ساختار ازپیش‌تعریف‌شده است؛ طراحی اختصاصی برای صفحات، برند و امکانات سفارشی با زمان و هزینه بالاتر مناسب‌تر است.",
  },
  {
    q: "سئو در قیمت پکیج‌ها شامل چه می‌شود؟",
    a: "پکیج‌های اختصاصی شامل ساختار و تنظیمات پایه سئو هستند. سئو و تولید محتوای مستمر ماهانه به‌صورت جداگانه برآورد می‌شود.",
  },
  {
    q: "برای فروشگاه آنلاین چه هزینه‌های اضافی باید در نظر بگیریم؟",
    a: "علاوه بر هزینه ساخت، کارمزد درگاه پرداخت، تمدید سالانه دامنه/هاست و در صورت نیاز تولید محتوا و نگهداری پس از پشتیبانی اولیه جداگانه است.",
  },
];

const priceFactors = [
  "تعداد صفحات و سطح سفارشی‌سازی طراحی",
  "اتصال به سیستم‌های خارجی (CRM، نوبت‌دهی، انبار)",
  "تولید محتوا، عکاسی و ورود اطلاعات محصول",
  "چندزبانه‌سازی و پنل مدیریت پیشرفته",
  "فروشگاه، درگاه پرداخت و مدیریت سفارش",
  "سئو و تولید محتوای مستمر پس از راه‌اندازی",
];

const scenarios = [
  {
    title: "مشاور یا کلینیک کوچک با نیاز به حضور رسمی",
    desc: "یک صفحه معرفی خدمات، تماس و درباره ما کافی است؛ زمان تحویل مهم‌تر از طراحی کاملاً یونیک.",
    path: "FastWeb یا سایت معرفی کسب‌وکار",
    range: `${formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN)} تا ${formatWebsiteDesignPrice(25_000_000)} تومان`,
  },
  {
    title: "شرکت خدماتی با چند بخش و مقاله",
    desc: "چند صفحه خدمت، وبلاگ، فرم‌های تماس جدا و ساختار آماده گسترش سئو.",
    path: "سایت حرفه‌ای و محتوایی",
    range: `شروع از ${formatWebsiteDesignPrice(45_000_000)} تومان`,
  },
  {
    title: "فروشگاه با کاتالوگ محصول و درگاه",
    desc: "دسته‌بندی، سبد خرید، درگاه پرداخت و پنل مدیریت سفارش؛ زمان تحویل طولانی‌تر.",
    path: "فروشگاه آنلاین",
    range: `شروع از ${formatWebsiteDesignPrice(80_000_000)} تومان`,
  },
];

const internalLinks = [
  { href: "/website-design", label: "طراحی سایت حرفه‌ای" },
  { href: "/fastweb", label: "سایت فوری FastWeb" },
  { href: "/doctors", label: "طراحی سایت پزشکان" },
  { href: "/website/clinic", label: "طراحی سایت کلینیک" },
  { href: "/blog/website-design-order-checklist", label: "چک‌لیست سفارش طراحی سایت" },
  { href: "/blog/instagram-page-to-website", label: "تبدیل پیج اینستاگرام به سایت" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "قیمت طراحی سایت",
      serviceType: "Website design pricing, FastWeb, custom business sites, e-commerce",
      provider: organizationProviderRef(),
      areaServed: { "@type": "Country", name: "Iran" },
      url: canonicalUrl(PAGE_PATH),
      description:
        "مقایسه شفاف تعرفه طراحی سایت فوری و اختصاصی؛ از سایت معرفی تا فروشگاه آنلاین.",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "آرایه", item: canonicalUrl("/") },
        { "@type": "ListItem", position: 2, name: "طراحی سایت", item: canonicalUrl("/website-design") },
        { "@type": "ListItem", position: 3, name: "قیمت طراحی سایت", item: canonicalUrl(PAGE_PATH) },
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

function SectionCard({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft sm:p-6">
      <h2 className="text-lg font-extrabold text-navy-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <IconCheck size={12} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function WebsiteDesignCostPage() {
  const shopOffer = WEBSITE_PRICING_OFFERS.find((o) => o.id === "shop");
  const fastwebFormatted = formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN);
  const shopFormatted = shopOffer ? formatWebsiteDesignPrice(shopOffer.priceFromToman) : "۸۰ میلیون";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <WebsitePricingViewAnalytics />
      <WebsiteDesignNavbar />

      <main className="pb-16">
        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <nav className="text-sm text-navy-500" aria-label="مسیر صفحه">
              <Link href="/" className="hover:text-navy-900">
                آرایه
              </Link>
              <span className="px-2">/</span>
              <Link href="/website-design" className="hover:text-navy-900">
                طراحی سایت
              </Link>
              <span className="px-2">/</span>
              <span>قیمت</span>
            </nav>

            <div className="mx-auto mt-8 max-w-3xl text-center">
              <span className="inline-flex items-center rounded-full bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-700">
                تعرفه شفاف
              </span>
              <h1 className="mt-4 text-balance text-2xl font-extrabold text-navy-900 sm:text-3xl lg:text-4xl">
                قیمت طراحی سایت؛ مقایسه سایت فوری، اختصاصی و فروشگاهی
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-navy-600 sm:text-base">
                هزینه از FastWeb ({fastwebFormatted}) تا فروشگاه ({shopFormatted}) — قیمت قطعی بعد از
                Scope. مبلغ «شروع از» نقطه شروع برآورد است؛ پیش‌فاکتور دقیق پس از مشخص‌شدن صفحات و
                امکانات ارسال می‌شود.
              </p>
              <p className="mt-2 text-xs text-navy-400">
                آخرین به‌روزرسانی تعرفه: {WEBSITE_PRICING_UPDATED_AT}
              </p>
            </div>
          </div>
        </section>

        <section className="section-py bg-navy-50/40" aria-labelledby="pricing-offers-title">
          <div className="container-mx container-px">
            <h2 id="pricing-offers-title" className="text-center text-xl font-extrabold text-navy-900 sm:text-2xl">
              جدول مقایسه پکیج‌ها
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-navy-500">
              هر پکیج برای مخاطب، محدوده کار و زمان‌بندی مشخص طراحی شده است.
            </p>

            <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-2">
              {WEBSITE_PRICING_OFFERS.map((offer) => (
                <article
                  key={offer.id}
                  className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-soft"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-lg font-extrabold text-navy-900">{offer.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        offer.path === "fastweb"
                          ? "bg-teal-50 text-teal-700"
                          : "bg-navy-50 text-navy-600"
                      }`}
                    >
                      {offer.path === "fastweb" ? "سایت فوری" : "طراحی اختصاصی"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-navy-500">{offer.audience}</p>

                  <p className="mt-4 text-2xl font-extrabold text-navy-900">
                    شروع از{" "}
                    <span className="text-teal-700">{formatWebsiteDesignPrice(offer.priceFromToman)}</span>{" "}
                    <span className="text-sm font-bold text-navy-500">تومان</span>
                  </p>

                  <p className="mt-3 text-sm font-semibold text-navy-700">محدوده کار: {offer.scope}</p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold text-navy-400">شامل</p>
                      <ul className="mt-2 space-y-1.5">
                        {offer.includes.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-navy-400">شامل نیست</p>
                      <ul className="mt-2 space-y-1.5">
                        {offer.excludes.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-navy-500">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-300" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-navy-100 bg-navy-50/30 p-4 text-sm">
                    <div>
                      <dt className="text-[11px] font-bold text-navy-400">زمان تقریبی</dt>
                      <dd className="mt-1 font-semibold text-navy-800">{offer.timeline}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold text-navy-400">اصلاحات</dt>
                      <dd className="mt-1 font-semibold text-navy-800">{offer.revisions}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-[11px] font-bold text-navy-400">پشتیبانی</dt>
                      <dd className="mt-1 font-semibold text-navy-800">{offer.support}</dd>
                    </div>
                  </dl>

                  {offer.separateCosts.length > 0 ? (
                    <p className="mt-3 text-xs leading-relaxed text-navy-500">
                      هزینه جدا: {offer.separateCosts.join("؛ ")}
                    </p>
                  ) : null}

                  <Link href={offer.ctaHref} className="btn-primary mt-6 inline-flex w-full justify-center">
                    {offer.ctaLabel}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <div className="mx-auto grid max-w-5xl gap-5">
              <SectionCard title="تفاوت FastWeb با طراحی اختصاصی">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-teal-100 bg-teal-50/30 p-4">
                    <h3 className="font-extrabold text-navy-900">سایت فوری (FastWeb)</h3>
                    <ul className="mt-3 space-y-2 text-sm text-navy-600">
                      <li>ساختار ازپیش‌تعریف‌شده برای معرفی سریع</li>
                      <li>نسخه اول در ۲۴ ساعت کاری پس از تکمیل اطلاعات</li>
                      <li>مناسب وقتی زمان مهم‌تر از سفارشی‌سازی عمیق است</li>
                      <li>شروع از {fastwebFormatted} تومان</li>
                    </ul>
                    <Link href="/fastweb" className="mt-4 inline-flex text-sm font-bold text-teal-700 hover:opacity-80">
                      مشاهده سایت فوری ←
                    </Link>
                  </div>
                  <div className="rounded-xl border border-navy-100 bg-navy-50/30 p-4">
                    <h3 className="font-extrabold text-navy-900">طراحی اختصاصی</h3>
                    <ul className="mt-3 space-y-2 text-sm text-navy-600">
                      <li>صفحات، برند و امکانات بر اساس نیاز پروژه</li>
                      <li>زمان تحویل ۳ تا ۱۲ هفته بسته به پیچیدگی</li>
                      <li>مناسب چند خدمت، محتوا، فروشگاه یا اتصال سیستم</li>
                      <li>شروع از {formatWebsiteDesignPrice(25_000_000)} تومان</li>
                    </ul>
                    <Link
                      href="/website-design"
                      className="mt-4 inline-flex text-sm font-bold text-navy-700 hover:opacity-80"
                    >
                      صفحه طراحی سایت ←
                    </Link>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="عواملی که هزینه را بالا می‌برند">
                <BulletList items={priceFactors} />
              </SectionCard>

              <SectionCard title="دامنه و هاست">
                <p className="text-sm leading-relaxed text-navy-600">
                  {websiteDesignPricingExtras.domainHosting}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-navy-500">
                  هزینه سالانه دامنه و هاست بسته به نوع دامنه (.ir یا بین‌المللی) و منابع سرور متفاوت است و
                  در پیش‌فاکتور جداگانه اعلام می‌شود.
                </p>
              </SectionCard>

              <SectionCard title="تولید محتوا و ورود اطلاعات">
                <p className="text-sm leading-relaxed text-navy-600">
                  {websiteDesignPricingExtras.contentProduction}
                </p>
              </SectionCard>

              <SectionCard title="سئو پایه در مقابل سئو مستمر">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-navy-900">سئو پایه (در پکیج اختصاصی)</h3>
                    <p className="mt-2 text-sm leading-relaxed text-navy-600">
                      ساختار صفحات، عنوان و توضیحات، سرعت اولیه، نقشه سایت و تنظیمات پایه گوگل — بدون
                      تعهد تولید محتوای ماهانه.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-navy-900">سئو و محتوای مستمر</h3>
                    <p className="mt-2 text-sm leading-relaxed text-navy-600">
                      تولید مقاله، بهینه‌سازی صفحات جدید و گزارش ماهانه — به‌صورت قرارداد جداگانه برآورد
                      می‌شود.
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="فروشگاه و درگاه پرداخت">
                <p className="text-sm leading-relaxed text-navy-600">
                  پکیج فروشگاه آنلاین شامل کاتالوگ، سبد خرید، درگاه و پنل مدیریت سفارش است. کارمزد درگاه
                  پرداخت و هزینه سالانه دامنه/هاست جدا از هزینه ساخت محاسبه می‌شود. مارکت‌پلیس چندفروشنده
                  و اپلیکیشن موبایل بومی در محدوده پکیج پایه نیست.
                </p>
              </SectionCard>

              <SectionCard title="چندزبانه‌سازی">
                <p className="text-sm leading-relaxed text-navy-600">
                  افزودن زبان دوم یا سوم (مثلاً فارسی + انگلیسی) ساختار URL، ترجمه رابط و مدیریت محتوا را
                  پیچیده‌تر می‌کند و به‌صورت جداگانه برآورد می‌شود.
                </p>
              </SectionCard>

              <SectionCard title="پنل مدیریت">
                <p className="text-sm leading-relaxed text-navy-600">
                  پنل ساده مدیریت محتوا در پکیج حرفه‌ای در صورت نیاز قرار می‌گیرد. پنل مدیریت پیشرفته با
                  نقش‌های کاربری، گزارش‌گیری و اتوماسیون — هزینه جدا دارد.
                </p>
              </SectionCard>

              <SectionCard title="پشتیبانی پس از تحویل">
                <p className="text-sm leading-relaxed text-navy-600">
                  هر پکیج اختصاصی شامل پشتیبانی فنی محدود پس از راه‌اندازی است (۱ تا ۲ ماه). نگهداری،
                  به‌روزرسانی امنیتی و توسعه پس از آن به‌صورت قرارداد نگهداری جداگانه برآورد می‌شود.
                </p>
              </SectionCard>

              <SectionCard title="هزینه‌های سالانه">
                <ul className="space-y-2 text-sm text-navy-600">
                  <li>تمدید دامنه (سالانه)</li>
                  <li>تمدید هاست یا میزبانی</li>
                  <li>SSL و پشتیبان‌گیری (در صورت نیاز سرویس جدا)</li>
                  <li>کارمزد درگاه پرداخت (برای فروشگاه)</li>
                  <li>نگهداری فنی و به‌روزرسانی (اختیاری)</li>
                </ul>
              </SectionCard>
            </div>
          </div>
        </section>

        <section className="section-py bg-navy-50/40">
          <div className="container-mx container-px">
            <h2 className="text-center text-xl font-extrabold text-navy-900">سناریوهای واقعی</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-navy-500">
              سه نمونه رایج — بدون وعده عدد ثابت؛ محدوده بر اساس تعرفه فعلی و Scope پروژه.
            </p>
            <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
              {scenarios.map((s) => (
                <article key={s.title} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                  <h3 className="font-extrabold text-navy-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">{s.desc}</p>
                  <p className="mt-3 text-xs font-bold text-navy-400">مسیر پیشنهادی</p>
                  <p className="text-sm font-semibold text-navy-800">{s.path}</p>
                  <p className="mt-2 text-sm font-extrabold text-teal-700">{s.range}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-xl font-extrabold text-navy-900">سوالات متداول</h2>
              <div className="mt-5 grid gap-3">
                {faq.map((item) => (
                  <details key={item.q} className="rounded-2xl border border-navy-100 bg-white p-4 text-sm">
                    <summary className="cursor-pointer font-bold text-navy-900">{item.q}</summary>
                    <p className="mt-2 leading-relaxed text-navy-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-py bg-navy-50/40" id={LEAD_FORM_ID}>
          <div className="container-mx container-px">
            <div className="mx-auto max-w-2xl rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-soft sm:p-8">
              <h2 className="text-xl font-extrabold text-navy-900">برآورد دقیق برای پروژه شما</h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">
                اگر هنوز بین پکیج‌ها مردد هستید، فرم درخواست برآورد را پر کنید تا بر اساس صفحات و امکانات
                واقعی، پیش‌فاکتور دریافت کنید.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href={`/website-design#${LEAD_FORM_ID}`} className="btn-primary inline-flex px-6 py-2.5">
                  فرم درخواست برآورد
                </Link>
                <Link
                  href="/fastweb"
                  className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-6 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                >
                  شروع سایت فوری
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <h2 className="text-center text-lg font-extrabold text-navy-900">صفحات مرتبط</h2>
            <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-3">
              {internalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
