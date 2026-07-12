import Link from "next/link";
import {
  Check,
  Clock3,
  LayoutTemplate,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import FastWebSiteView from "@/components/fastweb/FastWebSiteView";
import { FASTWEB_PACKAGES, type FastWebBrief } from "@/lib/fastweb";
import { buildDraftPreview } from "@/lib/fastwebContent";
import { formatPriceToman } from "@/lib/aiPricingConfig";

const templateExamples: { label: string; brief: FastWebBrief }[] = [
  {
    label: "کسب‌وکار محلی",
    brief: {
      goal: "leads",
      businessName: "کافه رسپینا",
      industry: "کافه و صبحانه",
      city: "تهران",
      shortDescription:
        "کافه‌ای دنج در قلب شهر با قهوه تخصصی، صبحانه گرم و فضایی آرام برای کار و دورهمی.",
      offerings: "قهوه تخصصی\nصبحانه و برانچ\nدسر خانگی",
      mainAdvantage: "دانه‌های تازه رست‌شده و فضای دنج",
      audience: "دانشجوها و کارمندهای اطراف",
      style: "warm",
      brandColor: "#B45309",
    },
  },
  {
    label: "کلینیک و خدمات",
    brief: {
      goal: "leads",
      businessName: "کلینیک پوست آریا",
      industry: "کلینیک پوست و زیبایی",
      city: "اصفهان",
      shortDescription:
        "کلینیک تخصصی پوست، مو و زیبایی با کادر مجرب و تجهیزات روز برای درمان‌های مطمئن.",
      offerings: "درمان پوست\nلیزر موهای زائد\nمشاوره زیبایی",
      mainAdvantage: "کادر پزشکی مجرب و نتیجه تضمین‌شده",
      audience: "افرادی که به خدمات پوست و زیبایی نیاز دارند",
      style: "formal",
      brandColor: "#0F4C5C",
    },
  },
  {
    label: "نمونه‌کار و خدمات",
    brief: {
      goal: "portfolio",
      businessName: "استودیو طراحی نقش",
      industry: "طراحی گرافیک و برندینگ",
      city: "شیراز",
      shortDescription:
        "استودیو طراحی برند و هویت بصری؛ از لوگو تا بسته‌بندی، با نگاهی مدرن و مینیمال.",
      offerings: "طراحی لوگو\nهویت بصری برند\nطراحی بسته‌بندی",
      mainAdvantage: "طراحی اختصاصی با تحویل سریع",
      audience: "برندها و کسب‌وکارهای نوپا",
      style: "modern",
      brandColor: "#4F46E5",
    },
  },
];

const steps = [
  {
    n: "۱",
    title: "اطلاعات کسب‌وکار",
    text: "چند سؤال کوتاه درباره هدف، خدمات و مخاطب.",
  },
  {
    n: "۲",
    title: "پیش‌نمایش قالب",
    text: "ساختار، رنگ برند و نسخه موبایل سایتتان را قبل از پرداخت ببینید.",
  },
  {
    n: "۳",
    title: "پرداخت و تحویل",
    text: "نسخه اول قابل انتشار تا ۲۴ ساعت کاری پس از تکمیل اطلاعات و پرداخت.",
  },
] as const;

const included = [
  "طراحی موبایل و دسکتاپ",
  "حداکثر ۷ بخش معرفی",
  "فرم درخواست و راه‌های تماس",
  "سئوی پایه",
  "میزبانی یک‌ساله",
  "یک مرحله اصلاح",
] as const;

const notIncluded = [
  "فروشگاه و سبد خرید",
  "درگاه پرداخت",
  "پنل کاربری",
  "نوبت‌دهی اختصاصی",
  "چندزبانه",
  "طراحی کاملاً اختصاصی",
] as const;

const productSplit = [
  {
    title: "AdReady",
    href: "/adready",
    text: "صفحه موقت برای کمپین تبلیغاتی و جذب لید سریع.",
  },
  {
    title: "سایت فوری",
    href: "/fastweb",
    text: "سایت رسمی و دائمی کسب‌وکار با قالب کنترل‌شده.",
    current: true,
  },
  {
    title: "طراحی اختصاصی",
    href: "/website-design",
    text: "طراحی و امکانات کاملاً متناسب با پروژه از ۲۵ میلیون تومان.",
  },
] as const;

export default function FastWebLanding() {
  return (
    <div className="min-h-screen bg-[#F4F7F8] text-slate-900" dir="rtl">
      <header className="border-b border-slate-200/80 bg-[#F4F7F8]/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/website-design"
              className="hidden sm:inline-flex rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-white"
            >
              طراحی اختصاصی
            </Link>
            <Link
              href="/fastweb/new"
              className="rounded-xl bg-[#0F4C5C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c3d4a]"
            >
              ساخت سایت من
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — one composition */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 70% 20%, #c5dde3 0%, transparent 55%), linear-gradient(165deg, #0F4C5C 0%, #163A45 42%, #1B2B34 100%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
            <p className="mb-4 text-sm font-medium tracking-wide text-teal-100/90">
              سایت فوری آرایه
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.15] text-white sm:text-5xl lg:text-[3.4rem]">
              سایت کسب‌وکارت را تا فردا آماده کن
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-teal-50/90 sm:text-lg">
              چند سؤال درباره کسب‌وکارت جواب بده؛ آرایه متن، ساختار و طراحی اولیه
              سایت را آماده می‌کند.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/fastweb/new"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0F4C5C] shadow-sm hover:bg-teal-50"
              >
                ساخت سایت من
              </Link>
              <p className="text-sm text-teal-100/80">
                نسخه اول قابل انتشار تا ۲۴ ساعت کاری
              </p>
            </div>
          </div>
        </section>

        {/* Promise */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Clock3,
                title: "۲۴ ساعت کاری",
                text: "نسخه اول قابل انتشار پس از تکمیل اطلاعات و پرداخت — نه وعده مبهم تحویل نهایی.",
              },
              {
                icon: LayoutTemplate,
                title: "قالب کنترل‌شده",
                text: "سایت یک‌صفحه‌ای معرفی کسب‌وکار با بخش‌های مشخص، نه طراحی از صفر هر بار.",
              },
              {
                icon: ShieldCheck,
                title: "کنترل انسانی",
                text: "متن و طراحی نهایی را تیم آرایه می‌نویسد و قبل از انتشار کنترل می‌کند.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                <item.icon className="mb-4 h-6 w-6 text-[#0F4C5C]" />
                <h2 className="text-lg font-bold">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="border-y border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold sm:text-3xl">مسیر ساخت</h2>
            <p className="mt-2 max-w-xl text-slate-600">
              اطلاعات کسب‌وکارت را بده؛ نسخه آماده انتشار سایتت را تا ۲۴ ساعت کاری
              تحویل بگیر.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F4C5C] text-sm font-bold text-white">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-bold">{s.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-slate-600">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Template examples */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">نمونه قالب‌ها</h2>
          <p className="mt-2 max-w-xl text-slate-600">
            سایت شما روی یکی از این قالب‌های واقعی، با رنگ برند و اطلاعات خودتان
            ساخته می‌شود.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {templateExamples.map((ex) => (
              <div
                key={ex.label}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70"
              >
                <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="mr-auto text-xs font-medium text-slate-500">
                    {ex.label}
                  </span>
                </div>
                <div className="relative h-[380px] overflow-hidden bg-white">
                  <div className="pointer-events-none absolute inset-0 origin-top-right scale-[0.5] [width:200%]">
                    <FastWebSiteView
                      content={buildDraftPreview(ex.brief)}
                      brief={ex.brief}
                      mode="preview"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/fastweb/new"
              className="inline-flex rounded-xl bg-[#0F4C5C] px-6 py-3 text-sm font-bold text-white hover:bg-[#0c3d4a]"
            >
              ساخت سایت من
            </Link>
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" id="pricing">
          <h2 className="text-2xl font-bold sm:text-3xl">بسته‌ها</h2>
          <p className="mt-2 text-slate-600">
            دو انتخاب ساده برای لانچ — بدون پلن ماهانه و بدون پیچیدگی اضافه.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {(Object.values(FASTWEB_PACKAGES) as Array<(typeof FASTWEB_PACKAGES)[keyof typeof FASTWEB_PACKAGES]>).map(
              (pkg) => (
                <div
                  key={pkg.key}
                  className={`rounded-2xl p-7 ring-1 ${
                    pkg.key === "plus"
                      ? "bg-[#0F4C5C] text-white ring-[#0F4C5C]"
                      : "bg-white text-slate-900 ring-slate-200"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-xl font-bold">{pkg.name}</h3>
                    {pkg.key === "plus" ? (
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs">
                        پیشنهادی
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={`mt-4 text-3xl font-bold ${
                      pkg.key === "plus" ? "text-white" : "text-[#0F4C5C]"
                    }`}
                  >
                    {formatPriceToman(pkg.priceToman)}
                    <span
                      className={`mr-1 text-sm font-medium ${
                        pkg.key === "plus" ? "text-teal-100" : "text-slate-500"
                      }`}
                    >
                      تومان
                    </span>
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            pkg.key === "plus" ? "text-teal-200" : "text-[#0F4C5C]"
                          }`}
                        />
                        <span
                          className={
                            pkg.key === "plus" ? "text-teal-50" : "text-slate-700"
                          }
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/fastweb/new?package=${pkg.key}`}
                    className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold ${
                      pkg.key === "plus"
                        ? "bg-white text-[#0F4C5C]"
                        : "bg-[#0F4C5C] text-white"
                    }`}
                  >
                    شروع با {pkg.name}
                  </Link>
                </div>
              )
            )}
          </div>
        </section>

        {/* Scope */}
        <section className="border-y border-slate-200 bg-white py-14">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-bold">چه چیزی شامل می‌شود</h2>
              <ul className="mt-5 space-y-2">
                {included.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 text-teal-700" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold">فعلاً نمی‌پذیریم</h2>
              <p className="mt-2 text-sm text-slate-600">
                این درخواست‌ها به{" "}
                <Link href="/website-design" className="font-medium text-[#0F4C5C] underline">
                  طراحی سایت اختصاصی آرایه
                </Link>{" "}
                هدایت می‌شوند.
              </p>
              <ul className="mt-5 space-y-2">
                {notIncluded.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-slate-600">
                    <span className="mt-0.5 text-slate-400">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Product split */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-[#0F4C5C]" />
            <h2 className="text-2xl font-bold">کدام محصول آرایه؟</h2>
          </div>
          <p className="mb-8 max-w-2xl text-slate-600">
            سه محصول جدا — تا با هم رقابت نکنند.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {productSplit.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className={`rounded-2xl p-5 ring-1 transition hover:shadow-md ${
                  "current" in p && p.current
                    ? "bg-[#0F4C5C] text-white ring-[#0F4C5C]"
                    : "bg-white ring-slate-200"
                }`}
              >
                <h3 className="font-bold">{p.title}</h3>
                <p
                  className={`mt-2 text-sm leading-7 ${
                    "current" in p && p.current ? "text-teal-50" : "text-slate-600"
                  }`}
                >
                  {p.text}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div
            className="rounded-3xl px-6 py-12 text-center text-white sm:px-10"
            style={{
              background:
                "linear-gradient(135deg, #0F4C5C 0%, #1B3A44 55%, #243B4A 100%)",
            }}
          >
            <h2 className="text-2xl font-bold sm:text-3xl">
              نسخه اول قابل انتشار تا ۲۴ ساعت کاری
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-teal-50/90">
              سایت واقعی و آماده انتشار، با کنترل انسانی — پس از تکمیل اطلاعات و
              پرداخت.
            </p>
            <Link
              href="/fastweb/new"
              className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0F4C5C]"
            >
              ساخت سایت من
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
