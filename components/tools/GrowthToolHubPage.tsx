import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolHubLinks from "@/components/tools/ToolHubLinks";
import GrowthToolEmbed from "@/components/tools/GrowthToolEmbed";
import { getHubLabel, getPublishedToolPages, type ToolHub } from "@/lib/tools/toolRegistry";

const HUB_COPY: Record<
  "review-link" | "local-seo-check" | "seo-roi-calculator",
  { title: string; lead: string; toolTitle: string; faq: { q: string; a: string }[] }
> = {
  "review-link": {
    title: "ساخت لینک نظر گوگل و QR رایگان",
    lead: "لینک مستقیم فرم ثبت نظر، QR قابل چاپ و متن آماده درخواست بازخورد را بدون ثبت‌نام بسازید.",
    toolTitle: "لینک و QR نظر گوگل را بسازید",
    faq: [
      { q: "برای استفاده چه چیزی لازم است؟", a: "لینک Ask for reviews پروفایل گوگل یا Place ID کسب‌وکار کافی است." },
      { q: "آیا ابزار رایگان است؟", a: "بله؛ ساخت لینک، QR و متن درخواست نظر رایگان و بدون ثبت‌نام است." },
      { q: "آیا نظر مشتری خودکار ثبت می‌شود؟", a: "خیر. مشتری فرم گوگل را باز می‌کند و نظر واقعی خود را شخصاً می‌نویسد." },
    ],
  },
  "local-seo-check": {
    title: "تست رایگان سئو محلی و آمادگی گوگل مپ",
    lead: "در چند دقیقه وضعیت پروفایل، اطلاعات تماس، نظرها، سایت و اندازه‌گیری را بسنجید و سه اقدام فوری بگیرید.",
    toolTitle: "امتیاز آمادگی سئو محلی را بگیرید",
    faq: [
      { q: "این ابزار رتبه گوگل را بررسی می‌کند؟", a: "خیر؛ آمادگی اجرایی را ارزیابی می‌کند و ادعای رتبه زنده یا geogrid ندارد." },
      { q: "نتیجه اولیه رایگان است؟", a: "بله؛ امتیاز و سه اقدام اولویت‌دار بدون اطلاعات تماس نمایش داده می‌شود." },
      { q: "برای چه کسب‌وکارهایی مناسب است؟", a: "برای کسب‌وکارهای محلی مانند پزشک، کلینیک، دندانپزشک، وکیل و رستوران." },
    ],
  },
  "seo-roi-calculator": {
    title: "محاسبه‌گر رایگان ROI سئو",
    lead: "ارزش مشتری و هزینه سئو را وارد کنید تا سود خالص، نقطه سربه‌سر و سه سناریوی بازگشت سرمایه را ببینید.",
    toolTitle: "بازگشت سرمایه سئو را با عددهای خودتان محاسبه کنید",
    faq: [
      { q: "ROI سئو چگونه محاسبه می‌شود؟", a: "سود حاصل از مشتریان سئو منهای هزینه، تقسیم بر هزینه و ضربدر ۱۰۰." },
      { q: "آیا نتیجه تضمینی است؟", a: "خیر؛ این یک مدل تصمیم‌گیری بر اساس ورودی‌های شماست و فروش را تضمین نمی‌کند." },
      { q: "چه بازه‌ای برای سئو مناسب است؟", a: "برای بیشتر کسب‌وکارها ارزیابی ۳ تا ۶ ماهه از ارزیابی یک ماهه معنادارتر است." },
    ],
  },
};

export function getGrowthToolHubCopy(hub: ToolHub) {
  if (hub !== "review-link" && hub !== "local-seo-check" && hub !== "seo-roi-calculator") {
    throw new Error(`Unsupported growth tool hub: ${hub}`);
  }
  return HUB_COPY[hub];
}

export default function GrowthToolHubPage({
  hub,
}: {
  hub: "review-link" | "local-seo-check" | "seo-roi-calculator";
}) {
  const copy = HUB_COPY[hub];
  const industries = getPublishedToolPages(hub);

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gradient-to-b from-brand-50/50 via-white to-white pb-12 pt-24 sm:pb-16 sm:pt-28">
          <div className="container-mx container-px text-center">
            <span className="rounded-full bg-brand-50 px-4 py-2 text-xs font-bold text-brand-700">
              ابزار رایگان آرایه
            </span>
            <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-navy-900 sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-navy-500">{copy.lead}</p>
            <a href="#tool" className="mt-7 inline-flex rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white">
              شروع رایگان
            </a>
          </div>
        </section>

        <section id="tool" className="scroll-mt-20 bg-white pb-16">
          <div className="container-mx container-px">
            <h2 className="mb-7 text-center text-2xl font-extrabold text-navy-900">{copy.toolTitle}</h2>
            <GrowthToolEmbed hub={hub} industry="general" />
          </div>
        </section>

        <section className="section-py bg-navy-50/40">
          <div className="container-mx container-px">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-extrabold text-brand-700">راهنمای تخصصی هر صنف</p>
              <h2 className="mt-2 text-2xl font-extrabold text-navy-900">
                {getHubLabel(hub)} برای کسب‌وکار شما
              </h2>
            </div>
            <div className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {industries.map((industry) => (
                <Link
                  key={industry.slug}
                  href={`/${hub}/${industry.slug}`}
                  className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition hover:border-brand-300"
                >
                  <p className="text-sm font-extrabold text-navy-900">{industry.primaryKeyword}</p>
                  <p className="mt-2 text-xs leading-6 text-navy-500">
                    ابزار و راهنمای اختصاصی {industry.label}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <h2 className="text-center text-2xl font-extrabold text-navy-900">سوالات متداول</h2>
            <div className="mx-auto mt-7 max-w-2xl divide-y divide-navy-100 rounded-2xl border border-navy-100">
              {copy.faq.map((item) => (
                <details key={item.q} className="p-5">
                  <summary className="cursor-pointer text-sm font-bold text-navy-900">{item.q}</summary>
                  <p className="mt-3 text-sm leading-7 text-navy-500">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <ToolHubLinks current={`/${hub}`} />
      </main>
      <Footer />
    </>
  );
}
