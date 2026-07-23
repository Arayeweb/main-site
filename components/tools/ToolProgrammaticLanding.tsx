import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolHubLinks from "@/components/tools/ToolHubLinks";
import ToolEditorialHeader from "@/components/tools/ToolEditorialHeader";
import ShortenerTool from "@/components/shortener/ShortenerTool";
import QrTool from "@/components/qr/QrTool";
import type { ToolProgrammaticPage } from "@/lib/tools/toolPageContent";
import { getHubLabel, getHubPath } from "@/lib/tools/toolRegistry";
import GrowthToolEmbed from "@/components/tools/GrowthToolEmbed";

export default function ToolProgrammaticLanding({
  page,
}: {
  page: ToolProgrammaticPage;
}) {
  const hubPath = getHubPath(page.hub);
  const hubLabel = getHubLabel(page.hub);
  const isGrowthTool = ["review-link", "local-seo-check", "seo-roi-calculator"].includes(
    page.hub,
  );

  return (
    <>
      <Navbar />
      <main className="tool-page">
        <section className="border-b border-navy-300 pb-20 pt-10 sm:pb-24 sm:pt-14">
          <div className="container-mx container-px">
            <nav aria-label="Breadcrumb" className="mb-6 text-xs text-navy-500">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-brand-600">
                    آرایه
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={hubPath} className="hover:text-brand-600">
                    {hubLabel}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="font-bold text-navy-800">{page.label}</li>
              </ol>
            </nav>

            <div className="tool-reveal grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
              <div>
                <p className="tool-kicker">{hubLabel} / راهنمای کاربردی</p>
                <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.2] text-navy-950 sm:text-6xl">
                  {page.hero.h1}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-navy-600">
                  {page.hero.lead}
                </p>
              </div>
              <aside className="border-r-2 border-brand-600 pr-5 text-sm leading-7 text-navy-600">
                <p className="font-extrabold text-navy-900">
                  {page.hub === "googlesabt"
                    ? "ثبت حرفه‌ای روی نقشه‌ها"
                    : "۰ تومان · بدون ثبت‌نام · نتیجه فوری"}
                </p>
                <p className="mt-2">
                  ابتدا ابزار را استفاده کنید؛ راهنمای کامل پایین صفحه است.
                </p>
                <a
                  href="#tool-cta"
                  className="mt-5 inline-flex font-extrabold text-brand-700 hover:underline"
                >
                  {page.toolCta.label} ←
                </a>
              </aside>
            </div>
          </div>
        </section>

        <section id="tool-cta" className="-mt-12 scroll-mt-24 pb-12 sm:-mt-14 sm:pb-16">
          <div className="container-mx container-px">
            {isGrowthTool ? (
              <GrowthToolEmbed hub={page.hub} industry={page.slug} />
            ) : page.hub === "qr" ? (
              <QrTool prefillText={page.toolCta.prefillText} />
            ) : page.hub === "shortener" ? (
              <ShortenerTool />
            ) : (
              <div className="tool-panel mx-auto max-w-3xl p-7 sm:p-9">
                <p className="tool-index">شروع ابزار</p>
                <h2 className="mt-3 text-2xl font-extrabold text-navy-950">{page.toolCta.label}</h2>
                <p className="mt-3 text-sm leading-7 text-navy-600">
                  {page.hub === "googlesabt"
                    ? "پکیج مناسب را انتخاب کنید و جزئیات را شفاف ببینید."
                    : "فرم ساخت کارت در صفحه اصلی باز می‌شود؛ نتیجه رایگان و فوری است."}
                </p>
                <a
                  href={page.toolCta.href}
                  className="mt-6 inline-flex bg-navy-950 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-brand-700"
                >
                  {page.toolCta.label}
                </a>
              </div>
            )}
          </div>
        </section>

        <section className="tool-section">
          <div className="container-mx container-px">
            <ToolEditorialHeader
              index="۰۱"
              kicker="راهنمای تصمیم"
              title={page.problem.title}
              subtitle={page.problem.body}
            />
            <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <ul className="border-y border-navy-300">
                {page.problem.bullets.map((bullet, index) => (
                  <li
                    key={bullet}
                    className="grid grid-cols-[48px_1fr] border-b border-navy-200 py-4 last:border-b-0"
                  >
                    <span className="tool-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-sm leading-7 text-navy-700">{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-4 text-[14px] leading-8 text-navy-600">
                {page.bodyParagraphs.slice(1).map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="tool-section scroll-mt-24">
          <div className="container-mx container-px">
            <ToolEditorialHeader
              index="۰۲"
              kicker="مراحل اجرا"
              title={page.steps.title}
            />
            <ol className="mt-2">
              {page.steps.items.map((item, index) => (
                <li
                  key={item}
                  className="tool-rule-row gap-3 sm:grid-cols-[72px_1fr] sm:items-baseline"
                >
                  <span className="tool-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-7 text-navy-700">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="tool-section">
          <div className="container-mx container-px">
            <ToolEditorialHeader
              index="۰۳"
              kicker="جمع‌بندی"
              title="چرا این مسیر برای شما مناسب است؟"
            />
            <dl className="mt-2">
              {page.benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="tool-rule-row gap-3 sm:grid-cols-[72px_220px_1fr] sm:items-baseline"
                >
                  <span className="tool-index">{String(index + 1).padStart(2, "0")}</span>
                  <dt className="text-sm font-extrabold text-navy-900">{benefit.title}</dt>
                  <dd className="text-[13px] leading-7 text-navy-500">{benefit.desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="tool-section">
          <div className="container-mx container-px">
            <ToolEditorialHeader
              index="۰۴"
              kicker="پرسش‌های پرتکرار"
              title="پاسخ کوتاه و روشن"
            />
            <div className="mt-2">
              {page.faqs.map((item, index) => (
                <details key={item.q} className="group border-t border-navy-200 first:border-t-0">
                  <summary className="grid cursor-pointer list-none gap-3 py-5 marker:content-none sm:grid-cols-[72px_1fr_24px]">
                    <span className="tool-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-extrabold text-navy-900">{item.q}</span>
                    <span className="text-brand-700 group-open:hidden">+</span>
                    <span className="hidden text-brand-700 group-open:block">−</span>
                  </summary>
                  <p className="max-w-3xl pb-5 text-[13px] leading-7 text-navy-600 sm:mr-[72px]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="tool-section">
          <div className="container-mx container-px">
            <ToolEditorialHeader
              index="۰۵"
              kicker="ادامه مسیر"
              title="صفحات مرتبط"
            />
            <div className="mt-7 grid border-y border-navy-300 sm:grid-cols-2 lg:grid-cols-3">
              {page.related.map((related, index) => (
                <Link
                  key={related.href}
                  href={related.href}
                  className="grid min-h-28 grid-cols-[48px_1fr] border-b border-navy-300 p-5 transition hover:bg-white sm:border-l"
                >
                  <span className="tool-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-sm font-extrabold text-navy-900">{related.keyword}</p>
                    <p className="mt-2 text-xs text-navy-500">{related.label}</p>
                  </div>
                </Link>
              ))}
            </div>

            {(page.crossToolLinks.length > 0 || page.industryLinks.length > 0) ? (
              <div className="mt-8 border-t border-navy-300 pt-5">
                <h3 className="text-sm font-extrabold text-navy-900">
                  ابزارها و خدمات مرتبط
                </h3>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {page.crossToolLinks.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-flex border-b border-navy-300 py-2 text-xs font-bold text-navy-700 transition hover:border-brand-600 hover:text-brand-700"
                      >
                        {l.anchor}
                      </Link>
                    </li>
                  ))}
                  {page.industryLinks.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-flex border-b border-navy-300 py-2 text-xs font-bold text-navy-700 transition hover:border-brand-600 hover:text-brand-700"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-8 text-[13px] text-navy-500">
              <Link href={hubPath} className="font-bold text-brand-700 hover:text-brand-800">
                بازگشت به {hubLabel}
              </Link>
            </p>
          </div>
        </section>

        <ToolHubLinks
          current={hubPath}
          title="سایر ابزارهای رایگان"
        />
      </main>
      <Footer />
    </>
  );
}
