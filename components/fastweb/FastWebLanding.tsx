import type { ReactNode } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/home/SectionHeader";
import ShivaClinicHomePreview from "@/components/home/previews/ShivaClinicHomePreview";
import { FASTWEB_PACKAGES } from "@/lib/fastweb";
import {
  FASTWEB_START_PRICE_TOMAN,
  formatWebsiteDesignPrice,
} from "@/lib/websitePricing";
import { getAllFastWebIndustries, getFastWebIndustryPath } from "@/lib/fastweb/industries";

export const FASTWEB_ORDER_HREF = "/fastweb/new";

export const fastwebFaq = [
  {
    q: "قیمت طراحی سایت ارزان از چقدر شروع می‌شود؟",
    a: `بسته سایت فوری از ${formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN)} تومان شروع می‌شود و شامل نسخه اول قابل انتشار، مسیر تماس و میزبانی یک‌ساله است. پلاس برای چند صفحه و پشتیبانی بیشتر مناسب است.`,
  },
  {
    q: "واقعاً در ۲۴ ساعت چه چیزی تحویل می‌گیرم؟",
    a: "نسخه اول قابل انتشار سایت را تحویل می‌گیرید: ساختار صفحه، متن اولیه، طراحی بصری، نسخه موبایل و مسیر ارتباط توافق‌شده. این یک پروژه نامحدود و کاملاً سفارشی در یک روز نیست؛ نسخه اولی است که بعد از تکمیل اطلاعات اولیه کسب‌وکارتان آماده می‌شود.",
  },
  {
    q: "مالکیت سایت بعد از تحویل با کیست؟",
    a: "پس از تکمیل سفارش و انتشار، سایت برای کسب‌وکار شما راه‌اندازی می‌شود. دامنه .ir در صورت آزاد بودن و میزبانی یک‌ساله طبق بسته شامل می‌شود؛ جزئیات دسترسی در زمان تحویل اعلام می‌شود.",
  },
  {
    q: "آیا دامنه و هاست هم شامل می‌شود؟",
    a: "بله. در بسته‌های سایت فوری، میزبانی یک‌ساله و دامنه .ir در صورت آزاد بودن شامل می‌شود. اگر دامنه مدنظر آزاد نباشد یا دامنه دیگری بخواهید، تیم آرایه برای راه‌اندازی دامنه کمکتان می‌کند.",
  },
  {
    q: "آیا بعداً می‌توانم سایت را توسعه بدهم؟",
    a: "بله. سایت فوری نقطه شروع حضور آنلاین است. اگر بعداً به فروشگاه، پنل کاربری، رزرو یا امکانات پیچیده‌تر نیاز داشتید، می‌توانید از طریق طراحی سایت اختصاصی آرایه آن را توسعه دهید.",
  },
  {
    q: "اگر طراحی را نپسندم چه می‌شود؟",
    a: "قبل از انتشار، نسخه اول را می‌بینید و می‌توانید اصلاح‌های ضروری را در محدوده توافق‌شده درخواست کنید. انتشار فقط پس از تأیید شما انجام می‌شود.",
  },
  {
    q: "FastWeb چه تفاوتی با طراحی سایت اختصاصی آرایه دارد؟",
    a: "سایت فوری برای تحویل سریع و اقتصادی نسخه اول قابل انتشار است. طراحی اختصاصی برای برند گسترده‌تر، صفحات بیشتر و سیستم فروش کامل‌تر مناسب است.",
  },
] as const;

const deliverables = [
  {
    title: "سایت آماده انتشار",
    text: "نسخه اول شامل صفحه اصلی واضح، بخش‌های خدمات یا محتوا، و چیدمان آماده موبایل است تا کسب‌وکارتان همان ابتدا آنلاین دیده شود.",
  },
  {
    title: "مسیر ارتباط با مشتری",
    text: "بر اساس نیاز کسب‌وکارتان، مسیر تماس مثل تلفن، واتساپ، فرم تماس یا درخواست مشاوره به‌صورت مشخص و در دسترس قرار می‌گیرد.",
  },
  {
    title: "پیش‌نمایش قبل از انتشار",
    text: "نسخه اول را قبل از انتشار می‌بینید و اصلاح‌های لازم یا تأیید نهایی را اعلام می‌کنید تا سایت با اطمینان منتشر شود.",
  },
] as const;

const steps = [
  {
    n: "۱",
    title: "کسب‌وکارت را معرفی می‌کنی",
    text: "چند سؤال کوتاه درباره خدمات، مشتری‌ها و راه ارتباطی جواب می‌دهی.",
  },
  {
    n: "۲",
    title: "ساختار و طراحی اولیه آماده می‌شود",
    text: "تیم آرایه متن اولیه، ساختار صفحه و طراحی مناسب کسب‌وکارت را آماده می‌کند.",
  },
  {
    n: "۳",
    title: "بررسی می‌کنی و برای انتشار تأیید می‌دهی",
    text: "نسخه اول را می‌بینی، اصلاح‌های ضروری را می‌گویی و برای انتشار تأیید می‌دهی.",
  },
] as const;

const fitFor = [
  "طراحی سایت ارزان برای شروع رسمی کسب‌وکار",
  "معرفی خدمات و نمونه‌کارها با بودجه محدود",
  "دریافت تماس، واتساپ یا درخواست مشاوره",
  "نسخه اولیه سریع در ۲۴ ساعت کاری",
] as const;

const notFitFor = [
  "فروشگاه پیچیده و درگاه چندمرحله‌ای",
  "پنل کاربری اختصاصی",
  "رزرو یا اتوماسیون سفارشی",
  "اتصال‌های فنی پیچیده و برندینگ کامل",
] as const;

const packageIncludes = FASTWEB_PACKAGES.fast.features;
const packageExcludes = [
  "فروشگاه و مدیریت سفارش",
  "طراحی کاملاً یونیک برند",
  "سئوی مستمر ماهانه",
  "اتوماسیون و رزرو سفارشی",
] as const;

const comparisonRows = [
  { label: "قیمت", fast: "اقتصادی", custom: "بالاتر" },
  { label: "تحویل", fast: "سریع (۲۴ ساعت کاری)", custom: "چند هفته" },
  { label: "طراحی", fast: "ساختار استاندارد و شخصی‌سازی محدود", custom: "اختصاصی" },
  { label: "تعداد صفحات", fast: "محدود", custom: "متناسب با پروژه" },
  { label: "امکانات سفارشی", fast: "محدود", custom: "قابل توسعه" },
  { label: "مناسب", fast: "حضور سریع و رسمی", custom: "برند و سیستم فروش کامل" },
] as const;

const trustItems = [
  `شروع از ${formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN)} تومان`,
  "پیش‌نمایش قبل از انتشار",
  "فرم و واتساپ",
  "نسخه اول در ۲۴ ساعت کاری",
] as const;

function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-navy-100 bg-navy-50/70 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-navy-200" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-navy-200" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-navy-200" aria-hidden="true" />
        <span className="mr-auto truncate rounded-md bg-white px-3 py-1 text-[11px] font-medium text-navy-400 ring-1 ring-navy-100">
          araaye.com/s/shiva-hearing
        </span>
      </div>
      <div className="pointer-events-none select-none overflow-hidden [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!shadow-none">
        {children}
      </div>
    </div>
  );
}

export default function FastWebLanding() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-navy-900" dir="rtl">
      <Navbar solid ctaHref={FASTWEB_ORDER_HREF} ctaLabel="شروع سفارش" />

      <main>
        <section className="border-b border-navy-100/80 bg-[#F7F8FA] pt-14">
          <div className="container-mx container-px py-14 sm:py-20 lg:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div className="text-right">
                <p className="text-sm font-bold text-teal-700">طراحی سایت ارزان و فوری</p>
                <h1 className="mt-4 max-w-xl text-balance text-3xl font-extrabold leading-[1.25] tracking-tight text-navy-900 sm:text-4xl lg:text-[2.65rem]">
                  طراحی سایت ارزان و حرفه‌ای؛ نسخه اول در ۲۴ ساعت
                </h1>
                <p className="mt-5 max-w-xl text-[15px] leading-[1.9] text-navy-500 sm:text-base">
                  کسب‌وکارتان را توضیح دهید؛ آرایه نسخه اول قابل انتشار را در ۲۴ ساعت کاری —
                  از لحظه تکمیل اطلاعات اولیه — آماده می‌کند. شروع قیمت از{" "}
                  {formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN)} تومان؛ قبل از انتشار،
                  خروجی را می‌بینید و تأیید می‌کنید.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href={FASTWEB_ORDER_HREF}
                    className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 active:scale-[0.98]"
                  >
                    شروع سفارش سایت فوری
                  </Link>
                  <Link
                    href="/website-design/cost"
                    className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-6 py-3 text-sm font-bold text-navy-700 transition-all hover:bg-navy-50"
                  >
                    مقایسه قیمت طراحی سایت
                  </Link>
                </div>

                <ul className="mt-8 flex flex-wrap gap-2">
                  {trustItems.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-navy-100 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 shadow-soft"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:ps-2">
                <BrowserFrame>
                  <ShivaClinicHomePreview />
                </BrowserFrame>
                <p className="mt-3 text-center text-xs font-medium text-navy-400">
                  نمونه واقعی — کلینیک شنوایی شیوا
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <SectionHeader
              badge="محدوده بسته"
              title="چه چیزی داخل بسته است و چه چیزی نیست؟"
              subtitle={`شروع از ${formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN)} تومان — بدون وعده کیفیت پایین.`}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft">
                <h3 className="text-lg font-extrabold text-navy-900">داخل بسته</h3>
                <ul className="mt-5 space-y-3">
                  {packageIncludes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-navy-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft">
                <h3 className="text-lg font-extrabold text-navy-900">خارج از بسته</h3>
                <ul className="mt-5 space-y-3">
                  {packageExcludes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-navy-600">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm leading-7 text-navy-500">
                  برای امکانات گسترده‌تر به{" "}
                  <Link
                    href="/website-design"
                    className="font-bold text-teal-700 underline decoration-teal-200 underline-offset-4 hover:text-teal-800"
                  >
                    طراحی سایت حرفه‌ای
                  </Link>{" "}
                  یا{" "}
                  <Link
                    href="/website-design/cost"
                    className="font-bold text-teal-700 underline decoration-teal-200 underline-offset-4 hover:text-teal-800"
                  >
                    جدول قیمت طراحی سایت
                  </Link>{" "}
                  سر بزنید.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <SectionHeader
              badge="صنف‌های FastWeb"
              title="سایت فوری برای چه کسب‌وکارهایی مناسب است؟"
              subtitle="هر صنف صفحه اختصاصی با محتوا، ساختار و FAQ مخصوص خودش دارد."
            />
            <div className="flex flex-wrap justify-center gap-3">
              {getAllFastWebIndustries().map((industry) => (
                <Link
                  key={industry.slug}
                  href={getFastWebIndustryPath(industry.slug)}
                  className="rounded-xl border border-navy-100 bg-white px-4 py-2.5 text-sm font-semibold text-navy-700 shadow-soft transition hover:border-teal-200 hover:text-teal-700"
                >
                  {industry.hubAnchor}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-py bg-navy-50/40">
          <div className="container-mx container-px">
            <SectionHeader badge="خروجی سرویس" title="چه چیزی تحویل می‌گیری؟" />
            <div className="grid gap-6 md:grid-cols-3">
              {deliverables.map((item, index) => (
                <article key={item.title} className="card">
                  <span
                    className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-sm font-extrabold text-teal-700"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-extrabold text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-navy-500">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <SectionHeader
              badge="مقایسه"
              title="FastWeb در برابر طراحی اختصاصی"
              subtitle="انتخاب اقتصادی برای شروع؛ مسیر اختصاصی وقتی Scope بزرگ‌تر است."
            />
            <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-soft">
              <table className="min-w-full text-right text-sm">
                <thead className="bg-navy-50/80 text-navy-700">
                  <tr>
                    <th className="px-4 py-3 font-extrabold">معیار</th>
                    <th className="px-4 py-3 font-extrabold">FastWeb</th>
                    <th className="px-4 py-3 font-extrabold">طراحی اختصاصی</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="border-t border-navy-100">
                      <td className="px-4 py-3 font-bold text-navy-800">{row.label}</td>
                      <td className="px-4 py-3 text-navy-600">{row.fast}</td>
                      <td className="px-4 py-3 text-navy-600">{row.custom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="section-py bg-navy-50/40">
          <div className="container-mx container-px">
            <SectionHeader
              badge="مسیر همکاری"
              title="از توضیح کسب‌وکارت تا نسخه اول، در ۳ مرحله"
              subtitle="زمان آماده‌سازی نسخه اول قابل انتشار در ۲۴ ساعت کاری، پس از تکمیل اطلاعات اولیه کسب‌وکار محاسبه می‌شود."
            />
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <article
                  key={step.n}
                  className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                    {step.n}
                  </span>
                  <h3 className="mt-4 text-base font-extrabold text-navy-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-navy-500">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <SectionHeader badge="محدوده سرویس" title="برای چه کسانی مناسب است؟" />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
                <h3 className="text-lg font-extrabold text-navy-900">مناسب است برای</h3>
                <ul className="mt-5 space-y-3">
                  {fitFor.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-navy-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
                <h3 className="text-lg font-extrabold text-navy-900">برای این موارد مناسب نیست</h3>
                <ul className="mt-5 space-y-3">
                  {notFitFor.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-navy-600">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm leading-7 text-navy-500">
                  این موارد را می‌توانید از طریق{" "}
                  <Link
                    href="/website-design"
                    className="font-bold text-teal-700 underline decoration-teal-200 underline-offset-4 hover:text-teal-800"
                  >
                    طراحی سایت حرفه‌ای آرایه
                  </Link>{" "}
                  پیش ببرید.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="section-py scroll-mt-24 bg-navy-50/40">
          <div className="container-mx container-px">
            <SectionHeader badge="سوالات متداول" title="پرسش‌های رایج درباره قیمت و مالکیت" />
            <div className="mx-auto max-w-2xl border-t border-navy-100">
              {fastwebFaq.map((item) => (
                <details key={item.q} className="group border-b border-navy-100">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-right text-sm font-bold leading-relaxed text-navy-900 sm:py-5 sm:text-[15px] [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <span
                      className="shrink-0 text-xl font-light text-navy-300 transition-transform duration-200 motion-reduce:transition-none group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-4 text-sm leading-relaxed text-navy-500 sm:pb-5 sm:text-[15px]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section-py bg-teal-50">
          <div className="container-mx container-px text-center">
            <h2 className="mx-auto max-w-2xl text-2xl font-extrabold leading-snug text-navy-900 sm:text-3xl">
              برای شروع، فقط چند دقیقه زمان لازم داری.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-navy-500 sm:text-base">
              کسب‌وکارت را توضیح بده تا نسخه اول قابل انتشار سایتت در ۲۴ ساعت کاری آماده شود.
            </p>
            <Link
              href={FASTWEB_ORDER_HREF}
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              شروع سفارش
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
