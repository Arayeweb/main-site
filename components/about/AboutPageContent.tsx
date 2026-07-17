import Link from "next/link";
import ChatOpenButton from "@/components/home/ChatOpenButton";
import SectionHeader from "@/components/home/SectionHeader";
import { ShowcaseHomePreview } from "@/components/home/ShowcaseHomePreview";
import { ShowcasePreview } from "@/components/showcase/ShowcasePreview";
import AboutHeroFlow from "./AboutHeroFlow";
import AboutOriginGraphic from "./AboutOriginGraphic";
import AboutProductCollage from "./AboutProductCollage";
import {
  COMPANY_ACTIVITY,
  COMPANY_ADDRESS_FULL,
  COMPANY_DISPLAY_NAME,
  COMPANY_EMAIL,
  COMPANY_LEGAL_NAME,
  COMPANY_MAPS_URL,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL,
  COMPANY_SAME_AS,
  COMPANY_TRADE_NAME,
  COMPANY_VALUE_PROP,
} from "@/lib/companyIdentity";
import {
  designOutputSamples,
  googleOutputSamples,
  type OutputSample,
} from "@/lib/outputSamples";

const CAPABILITIES = [
  {
    key: "visibility",
    title: "دیده‌شدن",
    description: "کمک می‌کنیم مشتریان در گوگل راحت‌تر کسب‌وکار را پیدا کنند.",
    product: "SEO آرایه",
    href: "/seo",
  },
  {
    key: "conversion",
    title: "تبدیل بازدید به درخواست",
    description: "صفحه‌ای می‌سازیم که خدمات را روشن معرفی کند و مسیر تماس را ساده کند.",
    product: "AdReady",
    href: "/adready",
  },
  {
    key: "followup",
    title: "پیگیری مشتری",
    description: "درخواست‌ها در یک مسیر مشخص ثبت می‌شوند تا فراموش نشوند.",
    product: "طراحی سایت آرایه",
    href: "/website-design",
  },
  {
    key: "ai",
    title: "استفاده بهتر از هوش مصنوعی",
    description: "ابزارهایی می‌سازیم که انجام کارهای روزمره را سریع‌تر و ساده‌تر کنند.",
    product: "هوش مصنوعی آرایه",
    href: "/ai",
  },
] as const;

const PRODUCT_MAP = [
  { name: "SEO آرایه", role: "دیده‌شدن", href: "/seo" },
  { name: "AdReady", role: "ساخت صفحه کمپین و دریافت لید", href: "/adready" },
  { name: "طراحی سایت", role: "ساخت پایگاه اصلی کسب‌وکار", href: "/website-design" },
  { name: "هوش مصنوعی آرایه", role: "دسترسی ساده‌تر به چند هوش مصنوعی", href: "/ai" },
] as const;

const PRINCIPLES = [
  {
    title: "نتیجه قبل از ابزار",
    description: "اول مشخص می‌کنیم قرار است چه چیزی بهتر شود.",
  },
  {
    title: "زبان ساده",
    description: "مشتری نباید برای استفاده از فناوری متخصص باشد.",
  },
  {
    title: "خروجی قابل مشاهده",
    description: "کار باید در صفحه، گزارش یا درخواست‌های واقعی دیده شود.",
  },
  {
    title: "رشد مرحله‌به‌مرحله",
    description: "از مسئله مهم‌تر شروع می‌کنیم و بعد توسعه می‌دهیم.",
  },
] as const;

const FOUNDERS = [
  {
    name: "آبتین",
    role: "بنیان‌گذار",
    bio: "از نزدیک دیده که کسب‌وکارهای محلی سایت دارند اما مسیر تماس و پیگیری مشتری برایشان پراکنده است. آرایه را برای پر کردن همین فاصله شروع کرد.",
    initial: "آ",
    tone: "bg-brand-50 text-brand-700",
  },
  {
    name: "مهدی",
    role: "بنیان‌گذار",
    bio: "به ساخت ابزارهایی علاقه دارد که در عمل استفاده شوند، نه فقط در ارائه خوب به نظر برسند. تمرکزش روی ساده نگه داشتن محصول و خروجی قابل لمس است.",
    initial: "م",
    tone: "bg-navy-100 text-navy-700",
  },
] as const;

const TRUST_SAMPLES: OutputSample[] = [
  designOutputSamples[0],
  designOutputSamples[1],
  googleOutputSamples[0],
].filter(Boolean);

function CapabilityConnector() {
  return (
    <div
      className="hidden items-center justify-center lg:flex"
      aria-hidden="true"
    >
      <div className="h-px w-6 bg-navy-200" />
      <div className="h-2 w-2 rounded-full border-2 border-brand-400 bg-white" />
      <div className="h-px w-6 bg-navy-200" />
    </div>
  );
}

export default function AboutPageContent() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36">
        <div className="container-mx container-px">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge mb-5 bg-navy-50 text-navy-600">{COMPANY_DISPLAY_NAME}</span>
            <h1 className="text-balance text-[1.75rem] font-extrabold leading-[1.3] tracking-tight text-navy-900 sm:text-4xl lg:text-[2.65rem]">
              درباره شرکت آرایه
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-navy-500 sm:text-lg">
              {COMPANY_VALUE_PROP}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/" className="btn-primary">
                صفحه اصلی شرکت آرایه
              </Link>
              <a href="/#real-portfolio" className="btn-secondary">
                نمونه خروجی‌ها
              </a>
            </div>
          </div>
          <AboutHeroFlow />
        </div>
      </section>

      {/* Legal identity */}
      <section className="border-y border-navy-100 bg-navy-50/40 py-14 sm:py-16">
        <div className="container-mx container-px">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-extrabold text-navy-900 sm:text-3xl">
              هویت شرکت
            </h2>
            <dl className="mt-8 space-y-4 rounded-[20px] border border-navy-100 bg-white p-6 text-right sm:p-8">
              <div className="flex flex-col gap-1 border-b border-navy-50 pb-4 sm:flex-row sm:justify-between sm:gap-6">
                <dt className="text-sm font-bold text-navy-400">نام تجاری</dt>
                <dd className="text-base font-extrabold text-navy-900">{COMPANY_TRADE_NAME}</dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-navy-50 pb-4 sm:flex-row sm:justify-between sm:gap-6">
                <dt className="text-sm font-bold text-navy-400">نام حقوقی</dt>
                <dd className="text-base font-extrabold text-navy-900">{COMPANY_LEGAL_NAME}</dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-navy-50 pb-4 sm:flex-row sm:justify-between sm:gap-6">
                <dt className="text-sm font-bold text-navy-400">حوزه فعالیت</dt>
                <dd className="max-w-md text-sm font-semibold leading-relaxed text-navy-800 sm:text-left">
                  {COMPANY_ACTIVITY}
                </dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-navy-50 pb-4 sm:flex-row sm:justify-between sm:gap-6">
                <dt className="text-sm font-bold text-navy-400">آدرس</dt>
                <dd className="max-w-md text-sm font-semibold leading-relaxed text-navy-800">
                  <a
                    href={COMPANY_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-800"
                  >
                    {COMPANY_ADDRESS_FULL}
                  </a>
                </dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-navy-50 pb-4 sm:flex-row sm:justify-between sm:gap-6">
                <dt className="text-sm font-bold text-navy-400">شماره تماس</dt>
                <dd className="text-base font-extrabold text-navy-900" dir="ltr">
                  <a href={COMPANY_PHONE_TEL} className="hover:text-teal-800">
                    {COMPANY_PHONE_DISPLAY}
                  </a>
                </dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-navy-50 pb-4 sm:flex-row sm:justify-between sm:gap-6">
                <dt className="text-sm font-bold text-navy-400">ایمیل رسمی</dt>
                <dd className="text-base font-extrabold text-navy-900" dir="ltr">
                  <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-teal-800">
                    {COMPANY_EMAIL}
                  </a>
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
                <dt className="text-sm font-bold text-navy-400">شبکه‌های اجتماعی</dt>
                <dd className="flex gap-4 text-sm font-bold text-teal-800">
                  <a href={COMPANY_SAME_AS[0]} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                  <a href={COMPANY_SAME_AS[1]} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-center text-sm leading-relaxed text-navy-500">
              ارزش پیشنهادی ما: {COMPANY_VALUE_PROP}{" "}
              <Link href="/#services" className="font-bold text-teal-800 hover:text-teal-950">
                خدمات آرایه
              </Link>{" "}
              و{" "}
              <Link href="/#real-portfolio" className="font-bold text-teal-800 hover:text-teal-950">
                نمونه‌کارها
              </Link>{" "}
              را ببینید.
            </p>
          </div>
        </div>
      </section>

      {/* Why Araaye */}
      <section className="border-t border-navy-50 bg-navy-50/40 py-16 sm:py-20 lg:py-24">
        <div className="container-mx container-px">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 text-right lg:order-1">
              <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl">
                ساختن سایت آسان‌تر شده؛ ساختن یک مسیر مؤثر برای جذب مشتری نه.
              </h2>
              <p className="mt-5 text-[15px] leading-[1.85] text-navy-500 sm:text-base">
                امروز تقریباً هرکسی می‌تواند یک سایت بسازد، اما بسیاری از کسب‌وکارها هنوز
                نمی‌دانند چگونه در گوگل دیده شوند، خدماتشان را واضح معرفی کنند و درخواست‌های
                مشتری را از دست ندهند. آرایه برای حل همین فاصله شکل گرفته است.
              </p>
              <p className="mt-4 text-[15px] leading-[1.85] text-navy-500 sm:text-base">
                با انواع کسب‌وکارها کار می‌کنیم — از فروشگاه و شرکت خدماتی تا پزشک و کلینیک.
                هر سایت یا نرم‌افزاری که نیاز دارید را شخصی‌سازی‌شده می‌سازیم.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <AboutOriginGraphic />
            </div>
          </div>
        </div>
      </section>

      {/* What Araaye does */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-mx container-px">
          <SectionHeader
            badge="کار آرایه"
            title="آرایه دقیقاً چه کاری انجام می‌دهد؟"
            badgeClassName="bg-navy-50 text-navy-600"
          />

          <div className="mx-auto max-w-5xl">
            <div className="hidden gap-0 lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
              {CAPABILITIES.map((item, index) => (
                <div key={item.key} className="contents">
                  <article className="flex flex-col rounded-[18px] border border-navy-100 bg-white p-5 transition-colors hover:border-brand-200 sm:p-6">
                    <h3 className="text-lg font-extrabold text-navy-900">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">
                      {item.description}
                    </p>
                    <a
                      href={item.href}
                      className="mt-4 inline-flex w-fit items-center text-xs font-semibold text-navy-400 transition-colors hover:text-brand-600"
                    >
                      {item.product}
                      <span aria-hidden="true" className="mr-1">
                        ←
                      </span>
                    </a>
                  </article>
                  {index < CAPABILITIES.length - 1 ? <CapabilityConnector /> : null}
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
              {CAPABILITIES.map((item) => (
                <article
                  key={item.key}
                  className="flex flex-col rounded-[18px] border border-navy-100 bg-white p-5"
                >
                  <h3 className="text-lg font-extrabold text-navy-900">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">
                    {item.description}
                  </p>
                  <a
                    href={item.href}
                    className="mt-4 inline-flex w-fit items-center text-xs font-semibold text-navy-400"
                  >
                    {item.product}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="border-y border-navy-100 bg-navy-50/30 py-16 sm:py-20">
        <div className="container-mx container-px">
          <SectionHeader
            badge="بنیان‌گذاران"
            title="آرایه را چه کسانی ساخته‌اند؟"
            subtitle="دو نفر که از نزدیک مشکل کسب‌وکارهای محلی را دیده‌اند و تصمیم گرفته‌اند راهکارهای عملی بسازند، نه ارائه‌های پرزرق‌وبرق."
            badgeClassName="bg-white text-navy-600"
          />

          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2 sm:gap-8">
            {FOUNDERS.map((founder) => (
              <article
                key={founder.name}
                className="rounded-[20px] border border-navy-100 bg-white p-6 sm:p-7"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold ${founder.tone}`}
                    aria-hidden="true"
                  >
                    {founder.initial}
                  </span>
                  <div className="text-right">
                    <h3 className="text-lg font-extrabold text-navy-900">{founder.name}</h3>
                    <p className="text-sm text-navy-400">{founder.role}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-navy-500">{founder.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Product map */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-mx container-px">
          <SectionHeader
            badge="نگاه کلی"
            title="هر راهکار، بخشی از یک مسیر بزرگ‌تر است."
            subtitle="محصولات متفاوت، یک نگاه مشترک"
            badgeClassName="bg-brand-50 text-brand-600"
          />

          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-[20px] border border-navy-100 bg-navy-50/30 p-6 sm:p-8">
              <div className="mx-auto mb-8 flex max-w-xs flex-col items-center rounded-2xl border border-brand-200 bg-white px-5 py-4 text-center">
                <p className="text-[11px] font-bold text-brand-600">هدف مشترک</p>
                <p className="mt-1 text-sm font-extrabold text-navy-900">
                  دیده شدن، دریافت درخواست و پیگیری مشتری
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {PRODUCT_MAP.map((product) => (
                  <a
                    key={product.name}
                    href={product.href}
                    className="group rounded-[18px] border border-navy-100 bg-white p-4 transition-all hover:border-brand-200 hover:shadow-soft sm:p-5"
                  >
                    <p className="text-sm font-extrabold text-navy-900 group-hover:text-brand-700">
                      {product.name}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-navy-500">
                      <span aria-hidden="true" className="ml-1 text-brand-500">
                        ←
                      </span>
                      {product.role}
                    </p>
                  </a>
                ))}
              </div>

              <div
                className="pointer-events-none absolute inset-x-1/2 top-[4.5rem] hidden h-px w-[calc(100%-4rem)] -translate-x-1/2 bg-gradient-to-l from-transparent via-brand-200 to-transparent sm:block"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-navy-50 bg-navy-50/40 py-16 sm:py-20">
        <div className="container-mx container-px">
          <SectionHeader
            badge="اصول کار"
            title="اصولی که با آن‌ها کار می‌کنیم"
            badgeClassName="bg-white text-navy-600"
          />

          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-5">
            {PRINCIPLES.map((principle) => (
              <article
                key={principle.title}
                className="rounded-[18px] border border-navy-100 bg-white p-5 sm:p-6"
              >
                <h3 className="text-base font-extrabold text-navy-900">{principle.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-mx container-px">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="text-right">
              <span className="badge mb-4 bg-navy-50 text-navy-600">مسیر آرایه</span>
              <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl">
                آرایه هنوز در حال ساخته‌شدن است.
              </h2>
              <p className="mt-5 text-[15px] leading-[1.85] text-navy-500 sm:text-base">
                ما آرایه را یک محصول تمام‌شده نمی‌بینیم. با مشاهده رفتار کاربران، اجرای پروژه‌های
                واقعی و یادگرفتن از بازار، راهکارها را ساده‌تر و مؤثرتر می‌کنیم.
              </p>
            </div>
            <AboutProductCollage />
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-navy-100 bg-navy-50/30 py-16 sm:py-20">
        <div className="container-mx container-px">
          <SectionHeader
            badge="خروجی واقعی"
            title="به‌جای ادعا، خروجی کار را ببینید."
            badgeClassName="bg-white text-navy-600"
          />

          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST_SAMPLES.map((sample) => (
              <article key={sample.key} className="group">
                <Link
                  href={sample.showcasePath}
                  className="block overflow-hidden rounded-[18px] border border-navy-100 bg-white transition-transform duration-200 hover:-translate-y-0.5"
                >
                  {sample.key.startsWith("google-") ? (
                    <ShowcasePreview
                      sampleKey={sample.key as "google-shoope" | "google-emdad-ahan"}
                    />
                  ) : (
                    <ShowcaseHomePreview sampleKey={sample.key} />
                  )}
                </Link>
                <div className="mt-3 text-right">
                  <h3 className="text-sm font-extrabold text-navy-900">{sample.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-navy-500">{sample.goal}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href="/#real-portfolio" className="btn-secondary">
              مشاهده نمونه خروجی‌ها
            </a>
          </div>
        </div>
      </section>

      {/* Brand FAQ */}
      <section className="border-t border-navy-100 bg-white py-16 sm:py-20">
        <div className="container-mx container-px">
          <SectionHeader
            badge="برند"
            title="آرایه یا ارایه؟"
            subtitle="نام رسمی برند ما «آرایه» است؛ بعضی کاربران آن را «ارایه» هم می‌نویسند."
          />
          <div className="mx-auto max-w-2xl space-y-6 text-right">
            <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5 sm:p-6">
              <h3 className="text-base font-extrabold text-navy-900">آرایه یا ارایه؟</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                نام برند ما «آرایه» است، اما بعضی کاربران آن را به‌صورت «ارایه» هم جست‌وجو
                می‌کنند. هر دو به همین شرکت و به{" "}
                <Link href="/ai" className="font-bold text-teal-800 hover:text-teal-950">
                  هوش مصنوعی آرایه
                </Link>{" "}
                اشاره دارند. برای مقایسه مدل‌ها هم می‌توانید صفحه{" "}
                <Link
                  href="/ai/compare"
                  className="font-bold text-teal-800 hover:text-teal-950"
                >
                  مقایسه هوش مصنوعی
                </Link>{" "}
                را ببینید.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-navy-900 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <img
            src="/assets/logo-icon.svg"
            alt=""
            width={280}
            height={280}
            className="absolute left-1/2 top-1/2 h-[min(50vw,280px)] w-[min(50vw,280px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
          />
        </div>

        <div className="container-mx container-px relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl">
              مسئله کسب‌وکارتان را بگویید؛ با هم مسیر مناسب را پیدا می‌کنیم.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/70 sm:text-base">
              لازم نیست از قبل بدانید به سئو، صفحه فروش یا سایت جدید نیاز دارید.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ChatOpenButton
                location="about_final_cta"
                className="inline-flex items-center justify-center rounded-[18px] bg-brand-400 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-300 active:scale-[0.98]"
              >
                شروع گفت‌وگو
              </ChatOpenButton>
              <a
                href="/#solutions"
                className="inline-flex items-center justify-center rounded-[18px] border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                دیدن راهکارها
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
