"use client";

import type { CSSProperties, FormEvent } from "react";
import { useState } from "react";
import type { FastWebBrief, FastWebPreviewContent } from "@/lib/fastweb";
import { buildThemeFromBrand } from "@/lib/fastwebTemplates";

interface FastWebSiteViewProps {
  content: FastWebPreviewContent;
  brief?: FastWebBrief;
  mode?: "preview" | "live";
  compact?: boolean;
  onLeadSubmit?: (payload: {
    name: string;
    phone: string;
    message: string;
  }) => Promise<void> | void;
}

/**
 * Renders any of the 10 FastWeb categories through one shared component.
 * `content.templateKey` (one of 5 Cores) picks the hero layout/tone;
 * `content.sections` toggles which optional blocks render below it.
 * See lib/fastwebCategories.ts for the category → core/blocks mapping.
 */
export default function FastWebSiteView({
  content,
  brief,
  mode = "preview",
  compact = false,
  onLeadSubmit,
}: FastWebSiteViewProps) {
  const theme = buildThemeFromBrand(
    content.brandColor || brief?.brandColor || "#0F4C5C",
    content.styleKey || brief?.style || "modern"
  );
  const contacts = brief?.contacts || {};
  const sections = content.sections?.length
    ? content.sections
    : ["hero", "services", "about", "faq", "contact"];
  const core = content.templateKey || "service";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const cssVars = {
    ["--fw-brand" as string]: theme.brand,
    ["--fw-brand-soft" as string]: theme.brandSoft,
    ["--fw-brand-ink" as string]: theme.brandInk,
    ["--fw-surface" as string]: theme.surface,
    ["--fw-surface-alt" as string]: theme.surfaceAlt,
    ["--fw-text" as string]: theme.text,
    ["--fw-muted" as string]: theme.muted,
    ["--fw-radius" as string]: theme.radius,
  } as CSSProperties;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSending(true);
    try {
      await onLeadSubmit?.({
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  const heroTitleClass =
    core === "professional"
      ? "text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight"
      : core === "commerce"
        ? "text-3xl sm:text-5xl font-extrabold leading-[1.15]"
        : core === "company"
          ? "text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight"
          : core === "local"
            ? "text-3xl sm:text-4xl font-semibold leading-[1.2]"
            : "text-3xl sm:text-4xl md:text-[2.75rem] font-bold leading-tight";

  return (
    <div
      dir="rtl"
      className={`fastweb-site overflow-hidden ${compact ? "text-[13px]" : ""}`}
      style={{
        ...cssVars,
        background: theme.surface,
        color: theme.text,
        fontFamily: theme.fontBody,
        borderRadius: compact ? theme.radius : undefined,
      }}
    >
      {/* Nav */}
      <header
        className="flex items-center justify-between gap-3 px-5 py-4 sm:px-8"
        style={{ background: theme.surface }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {brief?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brief.logoUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span
              className="inline-flex h-9 w-9 items-center justify-center text-sm font-bold text-white"
              style={{
                background: theme.brand,
                borderRadius: theme.radius,
              }}
            >
              {(brief?.businessName || content.headline || "آ").slice(0, 1)}
            </span>
          )}
          <span className="truncate font-semibold">
            {brief?.businessName || content.headline}
          </span>
        </div>
        {contacts.phone ? (
          <a
            href={`tel:${contacts.phone}`}
            className="shrink-0 px-3 py-1.5 text-sm font-medium text-white"
            style={{ background: theme.brand, borderRadius: theme.radius }}
          >
            تماس
          </a>
        ) : null}
      </header>

      {/* Hero */}
      {sections.includes("hero") ? (
        <section
          className="relative px-5 py-14 sm:px-8 sm:py-20 text-white"
          style={{ background: theme.heroOverlay }}
        >
          <div
            className={`relative z-10 ${core === "company" ? "max-w-4xl" : "max-w-3xl"}`}
          >
            {mode === "preview" ? (
              <p className="mb-3 text-xs font-medium tracking-wide text-white/70">
                پیش‌نمایش سایت فوری
              </p>
            ) : null}
            <h1 className={heroTitleClass}>{content.headline}</h1>
            <p className="mt-4 max-w-xl text-base sm:text-lg text-white/90 leading-relaxed">
              {content.subheadline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={sections.includes("booking") ? "#booking" : "#contact"}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                style={{
                  background: "#fff",
                  color: theme.brandInk,
                  borderRadius: theme.radius,
                }}
              >
                {content.ctaText}
              </a>
              {contacts.whatsapp ? (
                <a
                  href={`https://wa.me/98${contacts.whatsapp.replace(/^0/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium border border-white/40 text-white"
                  style={{ borderRadius: theme.radius }}
                >
                  واتساپ
                </a>
              ) : null}
            </div>
            {core === "company" && content.stats?.length ? (
              <div className="mt-10 flex flex-wrap gap-8">
                {content.stats.slice(0, 4).map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold">{s.value}</p>
                    <p className="mt-1 text-xs text-white/70">{s.label}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Offerings (services / products) */}
      {(sections.includes("services") || sections.includes("products")) &&
      content.offerings?.length ? (
        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="text-2xl font-bold mb-2">
            {sections.includes("products") ? "محصولات" : "خدمات"}
          </h2>
          <p className="text-sm mb-8" style={{ color: theme.muted }}>
            منتخب آنچه ارائه می‌دهیم
          </p>
          <div
            className={
              core === "commerce"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                : core === "professional"
                  ? "grid gap-4 sm:grid-cols-2"
                  : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {content.offerings.map((item) => (
              <div
                key={item.title}
                className="p-5"
                style={{
                  background: theme.surfaceAlt,
                  borderRadius: theme.radius,
                }}
              >
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Menu (restaurant/cafe) */}
      {sections.includes("menu") && content.offerings?.length ? (
        <section
          className="px-5 py-12 sm:px-8 sm:py-16"
          style={{ background: theme.surfaceAlt }}
        >
          <h2 className="text-2xl font-bold mb-8">منو</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {content.offerings.map((item) => (
              <div
                key={item.title}
                className="flex items-start justify-between gap-4 border-b pb-3"
                style={{ borderColor: `${theme.muted}30` }}
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs mt-1" style={{ color: theme.muted }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Pricing / membership plans */}
      {sections.includes("pricing") && content.pricingPlans?.length ? (
        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="text-2xl font-bold mb-8">قیمت‌ها و پلن‌ها</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className="p-5"
                style={{
                  background: theme.surfaceAlt,
                  borderRadius: theme.radius,
                  border: `1px solid ${theme.brandSoft}`,
                }}
              >
                <h3 className="font-bold">{plan.name}</h3>
                <p
                  className="mt-1 text-lg font-extrabold"
                  style={{ color: theme.brand }}
                >
                  {plan.price}
                </p>
                <p className="mt-2 text-xs" style={{ color: theme.muted }}>
                  {plan.description}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {sections.includes("gallery") ? (
        <section
          className="px-5 py-12 sm:px-8 sm:py-16"
          style={{ background: theme.surfaceAlt }}
        >
          <h2 className="text-2xl font-bold mb-8">گالری</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(content.galleryNotes?.length
              ? content.galleryNotes
              : ["تصویر نمونه ۱", "تصویر نمونه ۲", "تصویر نمونه ۳", "تصویر نمونه ۴"]
            ).map((note, i) => (
              <div
                key={`${note}-${i}`}
                className="aspect-square flex items-center justify-center text-center p-3 text-xs"
                style={{
                  background: `linear-gradient(160deg, ${theme.brandSoft}, ${theme.surface})`,
                  borderRadius: theme.radius,
                  color: theme.muted,
                }}
              >
                {note}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Listings (real estate) */}
      {sections.includes("listings") && content.listings?.length ? (
        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="text-2xl font-bold mb-8">فایل‌های منتخب</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.listings.map((item) => (
              <div
                key={item.title}
                className="p-5"
                style={{
                  background: theme.surfaceAlt,
                  borderRadius: theme.radius,
                }}
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm font-bold" style={{ color: theme.brand }}>
                  {item.price}
                </p>
                <p className="mt-2 text-xs" style={{ color: theme.muted }}>
                  {item.meta}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Portfolio */}
      {sections.includes("portfolio") && content.portfolioNotes?.length ? (
        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="text-2xl font-bold mb-8">نمونه‌کار</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {content.portfolioNotes.map((note) => (
              <div
                key={note}
                className="min-h-[120px] flex items-end p-5"
                style={{
                  background: `linear-gradient(160deg, ${theme.brandSoft}, ${theme.surfaceAlt})`,
                  borderRadius: theme.radius,
                }}
              >
                <p className="text-sm font-medium">{note}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Case studies (law firm) */}
      {sections.includes("caseStudies") && content.portfolioNotes?.length ? (
        <section
          className="px-5 py-12 sm:px-8 sm:py-16"
          style={{ background: theme.surfaceAlt }}
        >
          <h2 className="text-2xl font-bold mb-8">نمونه پرونده‌ها</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {content.portfolioNotes.map((note) => (
              <div
                key={note}
                className="p-5"
                style={{ background: theme.surface, borderRadius: theme.radius }}
              >
                <p className="text-sm leading-7">{note}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* About */}
      {sections.includes("about") ? (
        <section
          className="px-5 py-12 sm:px-8 sm:py-16"
          style={{ background: theme.surfaceAlt }}
        >
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">درباره ما</h2>
            <p className="leading-8" style={{ color: theme.muted }}>
              {content.aboutText}
            </p>
            {brief?.mainAdvantage ? (
              <p
                className="mt-4 text-sm font-medium px-3 py-2 inline-block"
                style={{
                  background: theme.brandSoft,
                  color: theme.brandInk,
                  borderRadius: theme.radius,
                }}
              >
                {brief.mainAdvantage}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Credentials (professional/law) */}
      {sections.includes("credentials") ? (
        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="text-2xl font-bold mb-6">رزومه و مدارک</h2>
          <ul className="max-w-2xl space-y-2 text-sm leading-7" style={{ color: theme.muted }}>
            <li>• تحصیلات و سوابق در نسخه نهایی تکمیل می‌شود.</li>
            <li>• عضویت‌های حرفه‌ای و مجوزها.</li>
          </ul>
        </section>
      ) : null}

      {/* Team */}
      {sections.includes("team") && content.teamMembers?.length ? (
        <section
          className="px-5 py-12 sm:px-8 sm:py-16"
          style={{ background: theme.surfaceAlt }}
        >
          <h2 className="text-2xl font-bold mb-8">تیم و متخصصان</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.teamMembers.map((member) => (
              <div
                key={member.name}
                className="p-5 text-center"
                style={{ background: theme.surface, borderRadius: theme.radius }}
              >
                <span
                  className="mx-auto mb-3 flex h-14 w-14 items-center justify-center text-lg font-bold text-white"
                  style={{ background: theme.brand, borderRadius: "50%" }}
                >
                  {member.name.slice(0, 1)}
                </span>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="mt-1 text-xs" style={{ color: theme.brand }}>
                  {member.role}
                </p>
                <p className="mt-2 text-xs leading-6" style={{ color: theme.muted }}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Stats (company) */}
      {sections.includes("stats") && content.stats?.length && core !== "company" ? (
        <section className="px-5 py-10 sm:px-8 sm:py-14">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {content.stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold" style={{ color: theme.brand }}>
                  {s.value}
                </p>
                <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Clients / partners */}
      {sections.includes("clients") && content.clients?.length ? (
        <section
          className="px-5 py-10 sm:px-8 sm:py-14"
          style={{ background: theme.surfaceAlt }}
        >
          <h2 className="text-lg font-bold mb-6">مشتریان و همکاران</h2>
          <div className="flex flex-wrap gap-3">
            {content.clients.map((c) => (
              <span
                key={c}
                className="px-3 py-1.5 text-xs font-medium"
                style={{
                  background: theme.surface,
                  borderRadius: theme.radius,
                  color: theme.muted,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Schedule */}
      {sections.includes("schedule") && content.schedule?.length ? (
        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="text-2xl font-bold mb-8">برنامه زمانی</h2>
          <div className="max-w-2xl space-y-2">
            {content.schedule.map((item) => (
              <div
                key={`${item.day}-${item.title}`}
                className="flex items-center justify-between gap-4 p-3"
                style={{ background: theme.surfaceAlt, borderRadius: theme.radius }}
              >
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-xs" style={{ color: theme.muted }}>
                  {item.day} · {item.time}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Testimonials */}
      {sections.includes("testimonials") && content.testimonials?.length ? (
        <section
          className="px-5 py-12 sm:px-8 sm:py-16"
          style={{ background: theme.surfaceAlt }}
        >
          <h2 className="text-2xl font-bold mb-8">نظرات مشتریان</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {content.testimonials.map((t) => (
              <blockquote
                key={`${t.name}-${t.text.slice(0, 12)}`}
                className="p-5"
                style={{
                  background: theme.surface,
                  borderRadius: theme.radius,
                }}
              >
                <p className="text-sm leading-7 mb-3">«{t.text}»</p>
                <footer className="text-xs font-semibold" style={{ color: theme.brand }}>
                  {t.name}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {sections.includes("faq") && content.faq?.length ? (
        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="text-2xl font-bold mb-8">سؤالات متداول</h2>
          <div className="max-w-2xl space-y-3">
            {content.faq.map((item) => (
              <details
                key={item.question}
                className="group p-4"
                style={{
                  background: theme.surfaceAlt,
                  borderRadius: theme.radius,
                }}
              >
                <summary className="cursor-pointer font-medium list-none flex justify-between gap-3">
                  {item.question}
                  <span className="text-lg leading-none opacity-50 group-open:rotate-45 transition">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-7" style={{ color: theme.muted }}>
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* Booking / consultation CTA */}
      {sections.includes("booking") ? (
        <section
          id="booking"
          className="px-5 py-12 sm:px-8 sm:py-16 text-center"
          style={{ background: theme.brandSoft }}
        >
          <h2 className="text-xl font-bold" style={{ color: theme.brandInk }}>
            برای رزرو یا مشاوره آماده‌ایم
          </h2>
          <p className="mt-2 text-sm" style={{ color: theme.brandInk }}>
            از طریق فرم تماس یا واتساپ درخواست بدهید؛ در اولین فرصت پاسخ می‌دهیم.
          </p>
          <a
            href="#contact"
            className="mt-6 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: theme.brand, borderRadius: theme.radius }}
          >
            درخواست رزرو
          </a>
        </section>
      ) : null}

      {/* Contact */}
      {sections.includes("contact") ? (
        <section
          id="contact"
          className="px-5 py-12 sm:px-8 sm:py-16"
          style={{ background: theme.brandInk, color: "#fff" }}
        >
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold mb-3">{content.formTitle}</h2>
              <p className="text-white/75 text-sm mb-6 leading-7">
                برای درخواست یا هماهنگی، فرم را پر کنید یا مستقیم تماس بگیرید.
              </p>
              <ul className="space-y-2 text-sm text-white/90">
                {contacts.phone ? <li>تلفن: {contacts.phone}</li> : null}
                {contacts.whatsapp ? <li>واتساپ: {contacts.whatsapp}</li> : null}
                {contacts.instagram ? <li>اینستاگرام: {contacts.instagram}</li> : null}
                {contacts.address ? <li>آدرس: {contacts.address}</li> : null}
                {contacts.hours ? <li>ساعات کاری: {contacts.hours}</li> : null}
                {contacts.email ? <li>ایمیل: {contacts.email}</li> : null}
              </ul>
              {contacts.locationUrl ? (
                <a
                  href={contacts.locationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 text-sm underline text-white/90"
                >
                  مشاهده روی نقشه
                </a>
              ) : null}
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-3"
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: theme.radius,
              }}
            >
              {sent ? (
                <p className="text-sm py-8 text-center">درخواست شما ثبت شد.</p>
              ) : (
                <>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="نام"
                    required
                    className="w-full px-3 py-2.5 text-sm text-slate-900 outline-none"
                    style={{ borderRadius: theme.radius }}
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="شماره موبایل"
                    required
                    className="w-full px-3 py-2.5 text-sm text-slate-900 outline-none"
                    style={{ borderRadius: theme.radius }}
                  />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="پیام (اختیاری)"
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm text-slate-900 outline-none resize-none"
                    style={{ borderRadius: theme.radius }}
                  />
                  <button
                    type="submit"
                    disabled={sending || !onLeadSubmit}
                    className="w-full py-2.5 text-sm font-semibold disabled:opacity-60"
                    style={{
                      background: "#fff",
                      color: theme.brandInk,
                      borderRadius: theme.radius,
                    }}
                  >
                    {onLeadSubmit
                      ? sending
                        ? "در حال ارسال…"
                        : content.ctaText
                      : "فرم پس از انتشار فعال می‌شود"}
                  </button>
                </>
              )}
            </form>
          </div>
        </section>
      ) : null}

      <footer
        className="px-5 py-4 text-center text-xs"
        style={{ color: theme.muted, background: theme.surface }}
      >
        ساخته‌شده با سایت فوری آرایه
      </footer>
    </div>
  );
}
