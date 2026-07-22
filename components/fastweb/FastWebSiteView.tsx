"use client";

import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  Award,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  Dumbbell,
  MapPin,
  Play,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import type { FastWebBrief, FastWebPreviewContent } from "@/lib/fastweb";
import { getFastWebCategory } from "@/lib/fastwebCategories";
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

const CATEGORY_ART: Record<
  string,
  {
    kicker: string;
    label: string;
    icon: ReactNode;
    tone: string;
    orb: string;
    images: [string, string, string, string];
    proof: [string, string, string];
  }
> = {
  "service-business": {
    kicker: "اعزام سریع • خدمات تضمینی",
    label: "راه‌حل حرفه‌ای برای هر نیاز",
    icon: <ShieldCheck className="h-10 w-10" />,
    tone: "linear-gradient(135deg, #0b3540 0%, #17677a 50%, #74b3c0 100%)",
    orb: "#b8f0ee",
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&w=1000&q=82",
    ],
    proof: ["ضمانت خدمات", "اعزام سریع", "قیمت‌گذاری شفاف"],
  },
  professional: {
    kicker: "تخصص • تجربه • اعتماد",
    label: "در کنار شما، با یک تصمیم آگاهانه",
    icon: <Award className="h-10 w-10" />,
    tone: "linear-gradient(135deg, #10283f 0%, #315a7e 52%, #b4cfdb 100%)",
    orb: "#e9d9b0",
    images: [
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=82",
    ],
    proof: ["مشاوره تخصصی", "حفظ محرمانگی", "رزرو آسان"],
  },
  "online-store": {
    kicker: "ارسال به سراسر ایران",
    label: "جزئیاتی که تفاوت می‌سازند",
    icon: <ShoppingBag className="h-10 w-10" />,
    tone: "linear-gradient(135deg, #552318 0%, #a7462a 48%, #edae76 100%)",
    orb: "#ffe0b5",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=1000&q=82",
    ],
    proof: ["ضمانت اصالت", "ارسال سریع", "۷ روز امکان تعویض"],
  },
  "restaurant-cafe": {
    kicker: "هر روز، تازه و با عشق",
    label: "طعم‌هایی برای ماندن",
    icon: <UtensilsCrossed className="h-10 w-10" />,
    tone: "linear-gradient(135deg, #371412 0%, #883635 48%, #d69065 100%)",
    orb: "#f8cf9b",
    images: [
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=82",
    ],
    proof: ["مواد اولیه تازه", "فضای دلنشین", "رزرو سریع میز"],
  },
  "company-b2b": {
    kicker: "مهندسی‌شده برای مقیاس",
    label: "دقت در ساخت، اعتماد در همکاری",
    icon: <Award className="h-10 w-10" />,
    tone: "linear-gradient(135deg, #102633 0%, #294f62 50%, #9eb7bd 100%)",
    orb: "#dae7d7",
    images: [
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1000&q=82",
    ],
    proof: ["کنترل کیفیت", "تحویل پایدار", "همکاری بلندمدت"],
  },
  "beauty-salon": {
    kicker: "زیبایی، امضای شخصی شما",
    label: "درخشش از جزئیات آغاز می‌شود",
    icon: <Sparkles className="h-10 w-10" />,
    tone: "linear-gradient(135deg, #4a102b 0%, #a42e61 47%, #efa3bd 100%)",
    orb: "#ffe3ed",
    images: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1000&q=82",
    ],
    proof: ["مواد اورجینال", "محیط استریل", "مشاوره رایگان"],
  },
  "gym-fitness": {
    kicker: "حرکت کن • قوی‌تر شو",
    label: "نسخهٔ قدرتمندتر خودت را بساز",
    icon: <Dumbbell className="h-10 w-10" />,
    tone: "linear-gradient(135deg, #092719 0%, #17643f 48%, #86c379 100%)",
    orb: "#d7f1b6",
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=82",
    ],
    proof: ["مربیان حرفه‌ای", "برنامه اختصاصی", "تجهیزات مدرن"],
  },
  "law-firm": {
    kicker: "شفافیت در مسیر حقوقی شما",
    label: "تصمیم درست، پشتوانه‌ای مطمئن",
    icon: <Scale className="h-10 w-10" />,
    tone: "linear-gradient(135deg, #151f2a 0%, #344c62 50%, #b7a477 100%)",
    orb: "#f4e1b3",
    images: [
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=82",
    ],
    proof: ["حفظ محرمانگی", "تحلیل دقیق", "پیگیری مستمر"],
  },
  "real-estate": {
    kicker: "انتخاب خانه، انتخاب آینده",
    label: "فراتر از یک ملک؛ نزدیک به خانه",
    icon: <MapPin className="h-10 w-10" />,
    tone: "linear-gradient(135deg, #2d2418 0%, #604c2d 48%, #c7a36a 100%)",
    orb: "#f3dfb0",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1000&q=82",
    ],
    proof: ["فایل‌های واقعی", "کارشناسی قیمت", "همراهی تا قرارداد"],
  },
  education: {
    kicker: "یادگیری برای فردای بزرگ‌تر",
    label: "هر مهارت، یک شروع تازه",
    icon: <Play className="h-10 w-10" />,
    tone: "linear-gradient(135deg, #123747 0%, #28667b 48%, #96c6cf 100%)",
    orb: "#d9edc9",
    images: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=82",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=82",
    ],
    proof: ["اساتید منتخب", "کلاس‌های کم‌جمعیت", "پشتیبانی آموزشی"],
  },
};

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-[11px] font-bold tracking-[0.14em]" style={{ color: "var(--fw-brand)" }}>
          {eyebrow}
        </p>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {children}
    </div>
  );
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
  const category = getFastWebCategory(content.categoryKey || brief?.categoryKey);
  const categoryKey = category?.key || "service-business";
  const art = CATEGORY_ART[categoryKey] || CATEGORY_ART["service-business"];
  const uploadedVisual =
    brief?.attachmentUrl &&
    brief.attachmentKind !== "logo" &&
    /\.(avif|gif|jpe?g|png|webp)(?:\?.*)?$/i.test(
      brief.attachmentName || brief.attachmentUrl
    )
      ? brief.attachmentUrl
      : null;
  const effectiveLogoUrl =
    brief?.logoUrl ||
    (brief?.attachmentKind === "logo" ? brief.attachmentUrl : undefined);
  const visualImages = uploadedVisual
    ? ([uploadedVisual, art.images[1], art.images[2], art.images[3]] as const)
    : art.images;

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
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-5 sm:px-8"
        style={{ background: theme.surface }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {effectiveLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={effectiveLogoUrl}
              alt={`لوگوی ${brief?.businessName || content.headline}`}
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
        <div className="hidden items-center gap-6 text-xs font-medium sm:flex" style={{ color: theme.muted }}>
          <a href="#services">خدمات</a>
          <a href="#about">درباره ما</a>
          <a href="#contact">تماس</a>
        </div>
        <a
          href={contacts.phone ? `tel:${contacts.phone}` : "#contact"}
          className="inline-flex shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          style={{ background: theme.brand, borderRadius: theme.radius }}
        >
          تماس و مشاوره <ArrowLeft className="h-3.5 w-3.5" />
        </a>
      </header>

      {/* Hero */}
      {sections.includes("hero") ? (
        <section className="relative overflow-hidden px-5 pb-14 pt-7 sm:px-8 sm:pb-20 sm:pt-10" style={{ background: theme.surface }}>
          <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[1.08fr_.92fr] lg:items-stretch">
            <div className="relative z-10 flex flex-col justify-center py-5 sm:py-10">
              <p className="mb-5 flex items-center gap-2 text-xs font-bold tracking-wide" style={{ color: theme.brand }}>
                <span className="h-2 w-2 rounded-full" style={{ background: theme.brand }} />
                {art.kicker}
              </p>
              <h1
                className="max-w-2xl text-4xl font-black leading-[1.18] tracking-tight sm:text-5xl lg:text-6xl"
                style={{ fontFamily: theme.fontDisplay }}
              >
                {content.headline}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 sm:text-lg" style={{ color: theme.muted }}>
                {content.subheadline}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={sections.includes("booking") ? "#booking" : "#contact"}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                style={{
                  background: theme.brand,
                  borderRadius: theme.radius,
                }}
              >
                {content.ctaText} <ArrowLeft className="h-4 w-4" />
              </a>
              {contacts.whatsapp ? (
                <a
                  href={`https://wa.me/98${contacts.whatsapp.replace(/^0/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-5 py-3 text-sm font-bold ring-1"
                  style={{ borderRadius: theme.radius, color: theme.brandInk, boxShadow: `inset 0 0 0 1px ${theme.brand}30` }}
                >
                  واتساپ
                </a>
              ) : null}
              </div>
              <div className="mt-10 flex flex-wrap gap-5 text-xs" style={{ color: theme.muted }}>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" style={{ color: theme.brand }} /> پاسخ‌گویی سریع</span>
                <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-current" style={{ color: theme.brand }} /> رضایت مشتریان</span>
              </div>
            </div>
            <div
              className="relative min-h-[390px] overflow-hidden p-7 text-white shadow-2xl sm:min-h-[520px] sm:p-10"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(8,12,16,.05) 20%, rgba(8,12,16,.78) 100%), url("${visualImages[0]}")`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                borderRadius: "calc(var(--fw-radius) * 1.8)",
              }}
            >
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">
                    {art.icon}
                  </span>
                  <span className="rounded-full border border-white/25 bg-black/10 px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm">
                    {brief?.city || "ایران"}
                  </span>
                </div>
                <div>
                  <p className="max-w-sm text-2xl font-bold leading-relaxed sm:text-3xl">{art.label}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/25 pt-4 text-xs text-white/75">
                    <span>{category?.label || "سایت حرفه‌ای"}</span>
                    <ArrowUpLeft className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y" style={{ borderColor: `${theme.brand}18`, background: theme.surfaceAlt }}>
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y px-5 sm:grid-cols-3 sm:divide-x sm:divide-x-reverse sm:divide-y-0 sm:px-8" style={{ borderColor: `${theme.brand}18` }}>
          {art.proof.map((item, index) => (
            <div key={item} className="flex items-center justify-center gap-3 py-5 text-xs font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: theme.brandSoft, color: theme.brand }}>
                {index === 0 ? <ShieldCheck className="h-3.5 w-3.5" /> : index === 1 ? <Star className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              </span>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Offerings (services / products) */}
      {(sections.includes("services") || sections.includes("products")) &&
      content.offerings?.length ? (
        <section id="services" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <SectionHeading
            eyebrow={sections.includes("products") ? "PRODUCT EDIT" : "آنچه ارائه می‌دهیم"}
            title={sections.includes("products") ? "انتخاب‌هایی که دوست‌شان خواهید داشت" : "خدمات، با استانداردی بالاتر"}
          >
            <a href="#contact" className="hidden items-center gap-1 text-sm font-bold sm:flex" style={{ color: theme.brand }}>
              دریافت مشاوره <ArrowLeft className="h-4 w-4" />
            </a>
          </SectionHeading>
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
                className="group relative overflow-hidden border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
                style={{
                  background: theme.surfaceAlt,
                  borderRadius: theme.radius,
                  borderColor: `${theme.brand}16`,
                }}
              >
                <span className="mb-7 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition-transform group-hover:rotate-12" style={{ background: theme.brandSoft, color: theme.brand }}>
                  ۰{content.offerings.indexOf(item) + 1}
                </span>
                <h3 className="mb-3 text-lg font-bold">{item.title}</h3>
                <p className="text-sm leading-7" style={{ color: theme.muted }}>
                  {item.description}
                </p>
                <span className="mt-6 flex items-center gap-1 text-xs font-bold" style={{ color: theme.brand }}>
                  اطلاعات بیشتر <ChevronLeft className="h-3.5 w-3.5" />
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Menu (restaurant/cafe) */}
      {sections.includes("menu") && content.offerings?.length ? (
        <section
          className="px-5 py-16 sm:px-8 sm:py-24"
          style={{ background: theme.surfaceAlt }}
        >
          <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="CAFE MENU"
            title={`منوی محبوب ${brief?.businessName || "مجموعه"}`}
          />
          <div className="grid gap-x-12 gap-y-3 sm:grid-cols-2">
            {content.offerings.map((item) => (
              <div
                key={item.title}
                className="flex items-start justify-between gap-4 border-b py-4"
                style={{ borderColor: `${theme.muted}30` }}
              >
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-xs mt-1" style={{ color: theme.muted }}>
                    {item.description}
                  </p>
                </div>
                <span className="mt-1 text-xs font-bold" style={{ color: theme.brand }}>●</span>
              </div>
            ))}
          </div>
          </div>
        </section>
      ) : null}

      {/* Pricing / membership plans */}
      {sections.includes("pricing") && content.pricingPlans?.length ? (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <SectionHeading eyebrow="MEMBERSHIP / PRICE" title="شفاف، ساده، برای انتخاب بهتر" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.pricingPlans.map((plan, index) => (
              <div
                key={plan.name}
                className="relative overflow-hidden border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: index === 1 ? theme.brandInk : theme.surfaceAlt,
                  borderRadius: theme.radius,
                  border: `1px solid ${index === 1 ? theme.brandInk : theme.brandSoft}`,
                  color: index === 1 ? "#fff" : theme.text,
                }}
              >
                {index === 1 ? <span className="absolute left-5 top-5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold">پیشنهاد ویژه</span> : null}
                <h3 className="font-bold">{plan.name}</h3>
                <p
                  className="mt-1 text-lg font-extrabold"
                  style={{ color: index === 1 ? "#fff" : theme.brand }}
                >
                  {plan.price}
                </p>
                <p className="mt-3 text-xs leading-6" style={{ color: index === 1 ? "rgba(255,255,255,.7)" : theme.muted }}>
                  {plan.description}
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: index === 1 ? "#fff" : theme.brand }} />{f}</li>
                  ))}
                </ul>
                <a href="#contact" className="mt-7 flex items-center justify-between border-t pt-4 text-xs font-bold" style={{ borderColor: index === 1 ? "rgba(255,255,255,.2)" : `${theme.brand}20` }}>
                  انتخاب این پلن <ArrowLeft className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {sections.includes("gallery") ? (
        <section
          className="px-5 py-16 sm:px-8 sm:py-24"
          style={{ background: theme.surfaceAlt }}
        >
          <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="LOOKBOOK" title="لحظه‌هایی که به یاد می‌مانند" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(content.galleryNotes?.length
              ? content.galleryNotes
              : ["فضای مجموعه", "جزئیات تجربه", "کیفیت در اجرا", "انتخاب مشتریان"]
            ).map((note, i) => (
              <div
                key={`${note}-${i}`}
                className={`group relative flex min-h-40 items-end overflow-hidden p-4 text-right text-xs font-bold text-white sm:min-h-56 ${
                  i === 0 ? "col-span-2 row-span-2 min-h-64 sm:min-h-[29.5rem]" : ""
                }`}
                style={{
                  backgroundImage: `linear-gradient(180deg, transparent 40%, rgba(7,10,13,.8) 100%), url("${visualImages[i % visualImages.length]}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  borderRadius: theme.radius,
                }}
              >
                <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/15" />
                <span className="relative z-10 max-w-[13rem] leading-6">{note}</span>
                <span className="absolute left-4 top-4 z-10 rounded-full border border-white/30 bg-black/10 p-2 opacity-0 backdrop-blur-sm transition group-hover:opacity-100"><ArrowUpLeft className="h-4 w-4" /></span>
              </div>
            ))}
          </div>
          </div>
        </section>
      ) : null}

      {/* Listings (real estate) */}
      {sections.includes("listings") && content.listings?.length ? (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <SectionHeading eyebrow="FEATURED PROPERTIES" title="فایل‌های منتخب این هفته" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.listings.map((item, index) => (
              <div
                key={item.title}
                className="group overflow-hidden border transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: theme.surfaceAlt,
                  borderRadius: theme.radius,
                  borderColor: `${theme.brand}18`,
                }}
              >
                <div
                  className="relative h-52 overflow-hidden"
                  style={{
                    backgroundImage: `linear-gradient(180deg, transparent 55%, rgba(0,0,0,.35)), url("${visualImages[(index + 1) % visualImages.length]}")`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                >
                  <span className="absolute right-4 top-4 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold" style={{ color: theme.brandInk }}>فایل ویژه</span>
                </div>
                <div className="p-5">
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-2 text-sm font-extrabold" style={{ color: theme.brand }}>
                  {item.price}
                </p>
                <p className="mt-3 text-xs leading-6" style={{ color: theme.muted }}>
                  {item.meta}
                </p>
                <a href="#contact" className="mt-5 flex items-center justify-between border-t pt-3 text-xs font-bold" style={{ borderColor: `${theme.brand}18`, color: theme.brand }}>
                  مشاهده جزئیات <ArrowLeft className="h-4 w-4" />
                </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Portfolio */}
      {sections.includes("portfolio") && content.portfolioNotes?.length ? (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <SectionHeading eyebrow="SELECTED WORK" title="نتیجه، بهتر از هر توضیحی" />
          <div className="grid gap-3 sm:grid-cols-2">
            {content.portfolioNotes.map((note, index) => (
              <div
                key={note}
                className="group relative flex min-h-72 items-end overflow-hidden p-6 text-white sm:min-h-96"
                style={{
                  backgroundImage: `linear-gradient(180deg, transparent 35%, rgba(5,8,10,.84) 100%), url("${visualImages[(index + 2) % visualImages.length]}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  borderRadius: theme.radius,
                }}
              >
                <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/15" />
                <div className="relative z-10 flex w-full items-end justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-white/60">۰{index + 1}</span>
                    <p className="mt-2 max-w-sm text-base font-bold leading-7">{note}</p>
                  </div>
                  <ArrowUpLeft className="h-5 w-5 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Case studies (law firm) */}
      {sections.includes("caseStudies") && content.portfolioNotes?.length ? (
        <section
          className="px-5 py-16 sm:px-8 sm:py-24"
          style={{ background: theme.surfaceAlt }}
        >
          <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="SELECTED CASES" title="تجربه در پرونده‌های واقعی" />
          <div className="grid gap-4 sm:grid-cols-2">
            {content.portfolioNotes.map((note, index) => (
              <div
                key={note}
                className="border p-6 sm:p-8"
                style={{ background: theme.surface, borderRadius: theme.radius, borderColor: `${theme.brand}18` }}
              >
                <div className="mb-8 flex items-start justify-between gap-4">
                  <span className="text-4xl font-black opacity-15">۰{index + 1}</span>
                  <span className="rounded-full px-3 py-1 text-[10px] font-bold" style={{ background: theme.brandSoft, color: theme.brandInk }}>نتیجه موفق</span>
                </div>
                <p className="text-sm font-medium leading-8">{note}</p>
                <p className="mt-5 border-t pt-4 text-xs" style={{ borderColor: `${theme.brand}16`, color: theme.muted }}>جزئیات پرونده‌ها برای حفظ محرمانگی خلاصه شده‌اند.</p>
              </div>
            ))}
          </div>
          </div>
        </section>
      ) : null}

      {/* About */}
      {sections.includes("about") ? (
        <section
          id="about"
          className="px-5 py-16 sm:px-8 sm:py-24"
          style={{ background: theme.surfaceAlt }}
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div
              className="relative min-h-72 overflow-hidden sm:min-h-96"
              style={{
                backgroundImage: `linear-gradient(180deg, transparent 50%, rgba(0,0,0,.48)), url("${visualImages[1]}")`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                borderRadius: "calc(var(--fw-radius) * 1.3)",
              }}
            >
              <span className="absolute bottom-5 right-5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm" style={{ color: theme.brandInk }}>
                تجربه‌ای که می‌توانید به آن اعتماد کنید
              </span>
            </div>
            <div>
              <p className="mb-3 text-[11px] font-bold tracking-[.14em]" style={{ color: theme.brand }}>داستان ما</p>
              <h2 className="max-w-xl text-3xl font-black leading-[1.45] sm:text-4xl">
                کیفیت اتفاقی نیست؛ نتیجهٔ توجه به هر جزئیات است.
              </h2>
              <p className="mt-6 max-w-2xl leading-8" style={{ color: theme.muted }}>
                {content.aboutText}
              </p>
              {brief?.mainAdvantage ? (
                <p className="mt-6 flex items-center gap-2 text-sm font-bold" style={{ color: theme.brandInk }}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: theme.brandSoft }}><Check className="h-4 w-4" /></span>
                  {brief.mainAdvantage}
                </p>
              ) : null}
              <a href="#contact" className="mt-8 inline-flex items-center gap-2 text-sm font-bold" style={{ color: theme.brand }}>
                بیشتر با ما آشنا شوید <ArrowLeft className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {/* Credentials (professional/law) */}
      {sections.includes("credentials") ? (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <SectionHeading eyebrow="EXPERTISE" title="پشتوانه‌ای از دانش و تجربه" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "دانش تخصصی", text: "به‌روز با استانداردها و روش‌های حرفه‌ای حوزه فعالیت." },
              { title: "تجربه عملی", text: "تصمیم‌گیری دقیق بر پایه مواجهه با موقعیت‌های واقعی." },
              { title: "تعهد حرفه‌ای", text: "شفافیت، محرمانگی و مسئولیت‌پذیری در تمام مسیر." },
            ].map((item, index) => (
              <div key={item.title} className="border p-6" style={{ borderColor: `${theme.brand}18`, borderRadius: theme.radius }}>
                <span className="mb-8 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: theme.brandSoft, color: theme.brand }}>
                  {index === 0 ? <Award className="h-5 w-5" /> : index === 1 ? <Star className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </span>
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7" style={{ color: theme.muted }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Team */}
      {sections.includes("team") && content.teamMembers?.length ? (
        <section
          className="px-5 py-16 sm:px-8 sm:py-24"
          style={{ background: theme.surfaceAlt }}
        >
          <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="OUR PEOPLE" title="آدم‌هایی که تفاوت را می‌سازند" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.teamMembers.map((member, index) => (
              <div
                key={member.name}
                className="group overflow-hidden"
                style={{ background: theme.surface, borderRadius: theme.radius }}
              >
                <div
                  className="h-64 bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
                  style={{ backgroundImage: `linear-gradient(180deg, transparent, ${theme.brandInk}35), url("${visualImages[(index + 1) % visualImages.length]}")` }}
                />
                <div className="p-5">
                <h3 className="font-bold">{member.name}</h3>
                <p className="mt-1 text-xs" style={{ color: theme.brand }}>
                  {member.role}
                </p>
                <p className="mt-2 text-xs leading-6" style={{ color: theme.muted }}>
                  {member.bio}
                </p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>
      ) : null}

      {/* Stats (company) */}
      {sections.includes("stats") && content.stats?.length ? (
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
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <SectionHeading eyebrow="WEEKLY SCHEDULE" title="زمان‌بندی این هفته" />
          <div className="max-w-2xl space-y-2">
            {content.schedule.map((item) => (
              <div
                key={`${item.day}-${item.title}`}
                className="flex items-center justify-between gap-4 p-4"
                style={{ background: theme.surfaceAlt, borderRadius: theme.radius }}
              >
                <span className="flex items-center gap-3 text-sm font-bold"><CalendarDays className="h-4 w-4" style={{ color: theme.brand }} />{item.title}</span>
                <span className="flex items-center gap-1 text-xs" style={{ color: theme.muted }}>
                  <Clock3 className="h-3.5 w-3.5" />
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
          className="px-5 py-16 sm:px-8 sm:py-24"
          style={{ background: theme.surfaceAlt }}
        >
          <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="REAL STORIES" title="اعتمادی که ساخته‌ایم" />
          <div className="grid gap-4 sm:grid-cols-2">
            {content.testimonials.map((t) => (
              <blockquote
                key={`${t.name}-${t.text.slice(0, 12)}`}
                className="relative overflow-hidden p-6 sm:p-8"
                style={{
                  background: theme.surface,
                  borderRadius: theme.radius,
                }}
              >
                <div className="mb-6 flex gap-1" style={{ color: theme.brand }}>
                  {[0, 1, 2, 3, 4].map((star) => <Star key={star} className="h-3.5 w-3.5 fill-current" />)}
                </div>
                <p className="text-base font-medium leading-8 sm:text-lg">«{t.text}»</p>
                <footer className="mt-6 flex items-center gap-3 text-xs font-bold" style={{ color: theme.brand }}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ background: theme.brand }}>{t.name.slice(0, 1)}</span>
                  {t.name}
                </footer>
              </blockquote>
            ))}
          </div>
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {sections.includes("faq") && content.faq?.length ? (
        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
          <SectionHeading eyebrow="GOOD TO KNOW" title="قبل از شروع، شاید بپرسید" />
          <div className="space-y-3">
            {content.faq.map((item) => (
              <details
                key={item.question}
                className="group border p-5"
                style={{
                  background: theme.surfaceAlt,
                  borderRadius: theme.radius,
                  borderColor: `${theme.brand}16`,
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
          className="px-5 py-10 sm:px-8 sm:py-16"
          style={{ background: theme.surface }}
        >
          <div
            className="relative mx-auto max-w-7xl overflow-hidden px-6 py-14 text-center text-white sm:px-12 sm:py-20"
            style={{ background: art.tone, borderRadius: "calc(var(--fw-radius) * 1.5)" }}
          >
            <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl" style={{ background: art.orb }} />
            <div className="relative">
              <p className="mb-3 text-[11px] font-bold tracking-[.15em] text-white/65">شروع یک تجربهٔ بهتر</p>
              <h2 className="text-3xl font-black sm:text-4xl">برای رزرو یا مشاوره آماده‌ایم</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/75">
                درخواستتان را ثبت کنید؛ برای پاسخ دقیق و هماهنگی قدم بعدی با شما تماس می‌گیریم.
              </p>
              <a
                href="#contact"
                className="mt-7 inline-flex items-center justify-center gap-2 bg-white px-6 py-3 text-sm font-bold"
                style={{ color: theme.brandInk, borderRadius: theme.radius }}
              >
                {content.ctaText} <ArrowLeft className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {/* Contact */}
      {sections.includes("contact") ? (
        <section
          id="contact"
          className="px-5 py-16 sm:px-8 sm:py-24"
          style={{ background: theme.brandInk, color: "#fff" }}
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
            <div className="py-3">
              <p className="mb-3 text-[11px] font-bold tracking-[.15em] text-white/45">LET&apos;S TALK</p>
              <h2 className="max-w-lg text-3xl font-black leading-[1.4] sm:text-4xl">{content.formTitle}</h2>
              <p className="mb-8 mt-4 max-w-lg text-sm leading-7 text-white/65">
                چند خط درباره نیازتان بنویسید؛ برای یک گفت‌وگوی کوتاه و پاسخ دقیق با شما تماس می‌گیریم.
              </p>
              <ul className="grid gap-3 text-sm text-white/85 sm:grid-cols-2">
                {contacts.phone ? <li className="rounded-xl border border-white/10 bg-white/5 p-3">تلفن<br /><span className="mt-1 block text-xs text-white/60">{contacts.phone}</span></li> : null}
                {contacts.whatsapp ? <li className="rounded-xl border border-white/10 bg-white/5 p-3">واتساپ<br /><span className="mt-1 block text-xs text-white/60">{contacts.whatsapp}</span></li> : null}
                {contacts.instagram ? <li className="rounded-xl border border-white/10 bg-white/5 p-3">اینستاگرام<br /><span className="mt-1 block text-xs text-white/60">{contacts.instagram}</span></li> : null}
                {contacts.address ? <li className="rounded-xl border border-white/10 bg-white/5 p-3">آدرس<br /><span className="mt-1 block text-xs leading-5 text-white/60">{contacts.address}</span></li> : null}
                {contacts.hours ? <li className="rounded-xl border border-white/10 bg-white/5 p-3">ساعات کاری<br /><span className="mt-1 block text-xs text-white/60">{contacts.hours}</span></li> : null}
                {contacts.email ? <li className="rounded-xl border border-white/10 bg-white/5 p-3">ایمیل<br /><span className="mt-1 block text-xs text-white/60">{contacts.email}</span></li> : null}
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
              className="space-y-3 p-5 sm:p-7"
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
                    className="w-full bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-white/0 transition focus:ring-2"
                    style={{ borderRadius: theme.radius }}
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="شماره موبایل"
                    required
                    className="w-full bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-white/0 transition focus:ring-2"
                    style={{ borderRadius: theme.radius }}
                  />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="پیام (اختیاری)"
                    rows={3}
                    className="w-full resize-none bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-white/0 transition focus:ring-2"
                    style={{ borderRadius: theme.radius }}
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3 text-sm font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                    style={{
                      background: "#fff",
                      color: theme.brandInk,
                      borderRadius: theme.radius,
                    }}
                  >
                    {sending ? "در حال ارسال…" : content.ctaText}
                  </button>
                  {mode === "preview" ? (
                    <p className="pt-1 text-center text-[10px] text-white/45">
                      این فرم در پیش‌نمایش آزمایشی است و اطلاعاتی ارسال نمی‌شود.
                    </p>
                  ) : null}
                </>
              )}
            </form>
          </div>
        </section>
      ) : null}

      <footer
        className="px-5 py-7 text-center text-xs"
        style={{ color: theme.muted, background: theme.surface }}
      >
        ساخته‌شده با سایت فوری آرایه
      </footer>
    </div>
  );
}
