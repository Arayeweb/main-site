"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties, type FormEvent } from "react";
import type { FastWebDemoContent } from "@/lib/fastwebDemoData";

const ORDER_HREF = "/fastweb/new";

export default function FastWebDemoSite({ content }: { content: FastWebDemoContent }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSent(true);
  }

  return (
    <div
      className="fastweb-demo min-h-screen bg-[var(--zd-surface)] text-[var(--zd-ink)]"
      dir="rtl"
      style={
        {
          ["--zd-ink" as string]: "#1A1C1E",
          ["--zd-muted" as string]: "#5E656C",
          ["--zd-surface" as string]: "#ECEEF0",
          ["--zd-surface-2" as string]: "#E2E5E8",
          ["--zd-brand" as string]: "#1F3D3A",
          ["--zd-brand-deep" as string]: "#142826",
          ["--zd-accent" as string]: "#C9A86C",
          ["--zd-white" as string]: "#F7F8F9",
        } as CSSProperties
      }
    >
      <style>{`
        @keyframes zd-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .zd-reveal {
          animation: zd-fade-up 0.7s ease-out both;
        }
        .zd-reveal-delay-1 { animation-delay: 0.12s; }
        .zd-reveal-delay-2 { animation-delay: 0.24s; }
        .zd-reveal-delay-3 { animation-delay: 0.36s; }
        @media (prefers-reduced-motion: reduce) {
          .zd-reveal { animation: none; }
        }
      `}</style>

      {/* Demo ribbon */}
      <div className="border-b border-[var(--zd-brand)]/15 bg-[var(--zd-brand-deep)] px-4 py-2.5 text-center">
        <p className="text-[11px] font-medium tracking-wide text-[var(--zd-accent)] sm:text-xs">
          نمونه دموی سایت فوری آرایه — این کسب‌وکار واقعی نیست
        </p>
      </div>

      <header className="sticky top-0 z-30 border-b border-[var(--zd-ink)]/8 bg-[var(--zd-surface)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="text-right">
            <p className="text-sm font-bold tracking-tight sm:text-base">{content.businessName}</p>
            <p className="text-[10px] font-medium text-[var(--zd-muted)] sm:text-[11px]">
              {content.tagline}
            </p>
          </div>
          <nav className="hidden items-center gap-5 text-[12px] font-semibold text-[var(--zd-muted)] md:flex">
            {content.nav.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-[var(--zd-ink)]">
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="#contact"
            className="shrink-0 rounded-sm bg-[var(--zd-brand)] px-3.5 py-2 text-[11px] font-bold text-white transition hover:bg-[var(--zd-brand-deep)] sm:text-xs"
          >
            {content.hero.primaryCta}
          </a>
        </div>
      </header>

      <main>
        {/* Hero — full-bleed image plane */}
        <section className="relative min-h-[78vh] overflow-hidden sm:min-h-[85vh]">
          <Image
            src={content.hero.image}
            alt={content.hero.imageAlt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[var(--zd-ink)] via-[var(--zd-ink)]/55 to-[var(--zd-ink)]/20"
            aria-hidden="true"
          />
          <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-5 pb-14 pt-28 sm:min-h-[85vh] sm:px-8 sm:pb-20">
            <p className="zd-reveal text-[11px] font-semibold tracking-[0.14em] text-[var(--zd-accent)] sm:text-xs">
              {content.hero.eyebrow}
            </p>
            <h1 className="zd-reveal zd-reveal-delay-1 mt-4 max-w-2xl text-balance text-3xl font-bold leading-[1.2] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              {content.hero.title}{" "}
              <span className="text-[var(--zd-accent)]">{content.hero.titleAccent}</span>
            </h1>
            <p className="zd-reveal zd-reveal-delay-2 mt-5 max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-base">
              {content.hero.subtitle}
            </p>
            <div className="zd-reveal zd-reveal-delay-3 mt-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-sm bg-white px-5 py-2.5 text-sm font-bold text-[var(--zd-ink)] transition hover:bg-[var(--zd-accent)]"
              >
                {content.hero.primaryCta}
              </a>
              <a
                href="#projects"
                className="inline-flex items-center justify-center rounded-sm border border-white/35 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {content.hero.secondaryCta}
              </a>
            </div>
            <ul className="zd-reveal zd-reveal-delay-3 mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {content.hero.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-white/75 sm:text-[13px]">
                  <span className="h-1 w-1 rounded-full bg-[var(--zd-accent)]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--zd-brand)]">خدمات</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">چه کاری انجام می‌دهیم</h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--zd-muted)]">
              از ایده اولیه تا جزئیات اجرایی — مسیر مشخص برای هر نوع پروژه.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {content.services.map((service, i) => (
                <article
                  key={service.title}
                  className="group border border-[var(--zd-ink)]/8 bg-[var(--zd-white)] p-6 transition hover:border-[var(--zd-brand)]/25 hover:shadow-[0_20px_50px_-28px_rgba(28,25,22,0.35)] sm:p-7"
                >
                  <span className="text-[11px] font-bold text-[var(--zd-accent)]">
                    {["۰۱", "۰۲", "۰۳", "۰۴"][i] ?? String(i + 1)}
                  </span>
                  <h3 className="mt-3 text-lg font-bold">{service.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--zd-muted)]">{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Projects */}
        <section
          id="projects"
          className="scroll-mt-24 bg-[var(--zd-surface-2)] px-5 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--zd-brand)]">نمونه‌کار</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">پروژه‌های منتخب</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {content.projects.map((project) => (
                <article key={project.title} className="group overflow-hidden bg-[var(--zd-white)]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.alt}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  <div className="flex items-end justify-between gap-3 p-5">
                    <div>
                      <p className="text-[10px] font-semibold tracking-wide text-[var(--zd-brand)]">
                        {project.category} · {project.location}
                      </p>
                      <h3 className="mt-1 text-base font-bold sm:text-lg">{project.title}</h3>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/6]">
              <Image
                src={content.about.image}
                alt={content.about.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--zd-brand)]">درباره ما</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{content.about.title}</h2>
              <p className="mt-5 text-[15px] leading-8 text-[var(--zd-muted)]">{content.about.body}</p>
              <p className="mt-6 inline-block border-r-2 border-[var(--zd-brand)] bg-[var(--zd-surface-2)] px-4 py-3 text-sm font-semibold leading-7 text-[var(--zd-brand-deep)]">
                {content.about.advantage}
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-[var(--zd-ink)] px-5 py-16 text-[var(--zd-white)] sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--zd-accent)]">نظرات</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">از زبان کارفرماها</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {content.testimonials.map((t) => (
                <blockquote
                  key={t.name}
                  className="border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <p className="text-sm leading-7 text-white/85">«{t.text}»</p>
                  <footer className="mt-5">
                    <p className="text-sm font-bold text-[var(--zd-accent)]">{t.name}</p>
                    <p className="mt-0.5 text-[11px] text-white/50">{t.role}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--zd-brand)]">سؤالات متداول</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">پاسخ‌های کوتاه</h2>
            <div className="mt-8 space-y-3">
              {content.faq.map((item) => (
                <details
                  key={item.question}
                  className="group border border-[var(--zd-ink)]/8 bg-[var(--zd-white)] p-4 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span className="text-lg font-light text-[var(--zd-muted)] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-[var(--zd-muted)]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="scroll-mt-24 bg-[var(--zd-brand-deep)] px-5 py-16 text-white sm:px-8 sm:py-24"
        >
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{content.contact.title}</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/75">{content.contact.subtitle}</p>
              <ul className="mt-8 space-y-3 text-sm text-white/90">
                <li>
                  تلفن:{" "}
                  <a href={content.contact.phoneTel} className="underline decoration-white/30">
                    {content.contact.phone}
                  </a>
                </li>
                <li>واتساپ: {content.contact.whatsapp}</li>
                <li>اینستاگرام: {content.contact.instagram}</li>
                <li>آدرس: {content.contact.address}</li>
                <li>ساعات کاری: {content.contact.hours}</li>
              </ul>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-3 border border-white/10 bg-white/8 p-5 backdrop-blur-sm sm:p-6"
            >
              {sent ? (
                <p className="py-10 text-center text-sm text-white/90">
                  درخواست شما ثبت شد. در نسخه واقعی، این فرم به واتساپ یا ایمیل شما وصل می‌شود.
                </p>
              ) : (
                <>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="نام"
                    required
                    className="w-full rounded-sm bg-white px-3 py-2.5 text-sm text-[var(--zd-ink)] outline-none"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="شماره موبایل"
                    required
                    className="w-full rounded-sm bg-white px-3 py-2.5 text-sm text-[var(--zd-ink)] outline-none"
                  />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="توضیح کوتاه پروژه (اختیاری)"
                    rows={3}
                    className="w-full resize-none rounded-sm bg-white px-3 py-2.5 text-sm text-[var(--zd-ink)] outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-sm bg-[var(--zd-accent)] py-2.5 text-sm font-bold text-[var(--zd-ink)] transition hover:bg-white"
                  >
                    {content.contact.cta}
                  </button>
                </>
              )}
            </form>
          </div>
        </section>

        {/* Araaye CTA */}
        <section className="border-t border-[var(--zd-ink)]/10 bg-[var(--zd-surface)] px-5 py-12 sm:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--zd-brand)]">سایت فوری آرایه</p>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              سایتی شبیه این، برای کسب‌وکار خودتان؟
            </h2>
            <p className="max-w-lg text-sm leading-7 text-[var(--zd-muted)]">
              «{content.businessName}» یک نمونه دمو است. با سایت فوری آرایه، نسخه اول قابل انتشار خودتان را در ۲۴
              ساعت کاری آماده کنید.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={ORDER_HREF}
                className="inline-flex items-center justify-center rounded-sm bg-[var(--zd-brand)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--zd-brand-deep)]"
              >
                شروع سفارش سایت فوری
              </Link>
              <Link
                href="/fastweb"
                className="inline-flex items-center justify-center rounded-sm border border-[var(--zd-ink)]/15 bg-[var(--zd-white)] px-6 py-3 text-sm font-bold text-[var(--zd-ink)] transition hover:bg-white"
              >
                بازگشت به سایت فوری
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--zd-ink)]/8 px-5 py-5 text-center text-[11px] text-[var(--zd-muted)]">
        ساخته‌شده به‌عنوان دموی سایت فوری آرایه · {content.businessName}
      </footer>
    </div>
  );
}
