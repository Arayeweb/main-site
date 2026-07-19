import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/home/SectionHeader";
import ToolHubLinks from "@/components/tools/ToolHubLinks";
import ShortenerTool from "@/components/shortener/ShortenerTool";
import QrTool from "@/components/qr/QrTool";
import type { ToolProgrammaticPage } from "@/lib/tools/toolPageContent";
import { getHubLabel, getHubPath } from "@/lib/tools/toolRegistry";
import { IconCheck } from "@/components/icons";

export default function ToolProgrammaticLanding({
  page,
}: {
  page: ToolProgrammaticPage;
}) {
  const hubPath = getHubPath(page.hub);
  const hubLabel = getHubLabel(page.hub);

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-brand-50/30 to-slate-50 pb-10 pt-14 sm:pb-12 sm:pt-20">
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

            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-600">
                {page.hub === "googlesabt" ? "ثبت گوگل مپ — از ۵۹۰ هزار تومان" : `${hubLabel} — رایگان`}
              </span>
              <h1 className="text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl">
                {page.hero.h1}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-navy-500 sm:text-base">
                {page.hero.lead}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#tool-cta"
                  className="inline-flex rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700"
                >
                  {page.toolCta.label}
                </a>
                <a
                  href="#how"
                  className="rounded-xl border border-navy-200 bg-white px-7 py-3.5 text-sm font-bold text-navy-700 transition hover:border-brand-200 hover:text-brand-600"
                >
                  مراحل کار
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-xl font-extrabold text-navy-900 sm:text-2xl">
                {page.problem.title}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy-600">{page.problem.body}</p>
              <ul className="mt-6 space-y-3">
                {page.problem.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-navy-700">
                    <span className="mt-0.5 text-brand-600">
                      <IconCheck size={16} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-navy-600">
                {page.bodyParagraphs.slice(1).map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="section-py bg-slate-50/60">
          <div className="container-mx container-px">
            <SectionHeader
              badge="مراحل"
              badgeClassName="bg-brand-50 text-brand-600"
              title={page.steps.title}
            />
            <ol className="mx-auto mt-8 grid max-w-3xl gap-4">
              {page.steps.items.map((item, i) => (
                <li
                  key={item}
                  className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-soft"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-extrabold text-brand-700">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-navy-700">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <SectionHeader
              badge="مزایا"
              badgeClassName="bg-brand-50 text-brand-600"
              title="چرا این مسیر برای شما مناسب است؟"
            />
            <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
              {page.benefits.map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft"
                >
                  <h3 className="text-sm font-extrabold text-navy-900">{b.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="tool-cta" className="section-py bg-gradient-to-b from-brand-50/40 to-white">
          <div className="container-mx container-px">
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <h2 className="text-xl font-extrabold text-navy-900 sm:text-2xl">
                {page.toolCta.label}
              </h2>
              <p className="mt-2 text-sm text-navy-500">
                ابزار رایگان آرایه — بدون ثبت‌نام
              </p>
            </div>
            {page.hub === "qr" ? (
              <QrTool prefillText={page.toolCta.prefillText} />
            ) : page.hub === "shortener" ? (
              <ShortenerTool />
            ) : (
              <div className="mx-auto max-w-xl text-center">
                <a
                  href={page.toolCta.href}
                  className="inline-flex rounded-xl bg-brand-600 px-8 py-4 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700"
                >
                  {page.toolCta.label}
                </a>
                <p className="mt-3 text-xs text-navy-500">
                  {page.hub === "googlesabt"
                    ? "به صفحه پکیج‌ها و ثبت سفارش منتقل می‌شوید"
                    : "به صفحه ساخت کارت ویزیت دیجیتال منتقل می‌شوید"}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="section-py bg-slate-50/50">
          <div className="container-mx container-px">
            <SectionHeader
              badge="FAQ"
              badgeClassName="bg-brand-50 text-brand-600"
              title="سوالات متداول"
            />
            <div className="mx-auto mt-8 max-w-2xl divide-y divide-navy-100 rounded-2xl border border-navy-100 bg-white">
              {page.faqs.map((item) => (
                <details key={item.q} className="group px-5 py-4">
                  <summary className="cursor-pointer list-none text-sm font-bold text-navy-800 marker:content-none">
                    <span className="flex items-center justify-between gap-4">
                      {item.q}
                      <span className="text-brand-600 group-open:hidden">+</span>
                      <span className="hidden text-brand-600 group-open:inline">−</span>
                    </span>
                  </summary>
                  <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <SectionHeader
              badge="مرتبط"
              badgeClassName="bg-brand-50 text-brand-600"
              title="صفحات مرتبط"
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {page.related.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="rounded-2xl border border-navy-100 p-5 transition hover:border-brand-200 hover:shadow-card"
                >
                  <p className="text-sm font-extrabold text-navy-900">{r.keyword}</p>
                  <p className="mt-1 text-xs text-navy-500">{r.label}</p>
                </Link>
              ))}
            </div>

            {(page.crossToolLinks.length > 0 || page.industryLinks.length > 0) ? (
              <div className="mx-auto mt-10 max-w-2xl">
                <h3 className="text-center text-sm font-extrabold text-navy-900">
                  ابزارها و خدمات مرتبط
                </h3>
                <ul className="mt-4 flex flex-wrap justify-center gap-2">
                  {page.crossToolLinks.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-flex rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-bold text-navy-700 transition hover:border-brand-300 hover:text-brand-700"
                      >
                        {l.anchor}
                      </Link>
                    </li>
                  ))}
                  {page.industryLinks.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-flex rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-bold text-navy-700 transition hover:border-brand-300 hover:text-brand-700"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-8 text-center text-[13px] text-navy-500">
              <Link href={hubPath} className="font-bold text-brand-700 hover:text-brand-800">
                بازگشت به {hubLabel}
              </Link>
            </p>
          </div>
        </section>

        <ToolHubLinks
          current={hubPath as "/bizcard" | "/shortener" | "/qr"}
          title="سایر ابزارهای رایگان"
        />
      </main>
      <Footer />
    </>
  );
}
