import type { FastWebIndustry } from "@/lib/fastweb/industrySchema";
import type { FastWebCategoryKey } from "@/lib/fastweb";

/**
 * Legacy FastWeb industry drafts kept routable for URL stability.
 * All fail the quality gate (reviewed: false) → noindex + excluded from sitemap.
 * Do not expand these in this phase; prove architecture on beauty-salon / gym / law-firm.
 */

type DraftInput = {
  slug: string;
  name: string;
  shortName: string;
  categoryKey: FastWebCategoryKey;
  primaryKeyword: string;
  title: string;
  description: string;
  h1: string;
  intent: string;
  cta: string;
  hubAnchor: string;
  related: string[];
};

function draft(input: DraftInput): FastWebIndustry {
  return {
    slug: input.slug,
    name: input.name,
    shortName: input.shortName,
    categoryKey: input.categoryKey,
    searchTerms: [input.primaryKeyword, `سایت ${input.name}`],
    searchIntent: input.intent,
    audience: [input.name],
    primaryGoal: `دریافت تماس از مشتری ${input.name}`,
    primaryCta: input.cta,
    secondaryCta: "بازگشت به سایت فوری",
    hero: {
      eyebrow: `سایت فوری ${input.name}`,
      title: input.h1,
      description: input.description,
    },
    problems: [
      {
        title: `اعتماد آنلاین برای ${input.name} ساخته نمی‌شود`,
        description: `بدون صفحه معرفی منظم، مشتری ${input.name} قبل از تماس اطلاعات کافی ندارد.`,
      },
      {
        title: "مسیر تماس مبهم است",
        description: "پیام‌ها بین شبکه‌های اجتماعی پخش می‌شود و پیگیری سخت می‌شود.",
      },
      {
        title: "خدمات به‌صورت شفاف فهرست نشده",
        description: "بازدیدکننده نمی‌فهمد دقیقاً چه چیزی ارائه می‌دهید و چه چیزی خارج از کار است.",
      },
    ],
    outcomes: [
      {
        title: "معرفی روشن خدمات",
        description: `خدمات اصلی ${input.name} در یک ساختار خوانا چیده می‌شود.`,
      },
      {
        title: "مسیر تماس مشخص",
        description: "فرم یا واتساپ برای اقدام سریع در دسترس است.",
      },
      {
        title: "نسخه موبایل آماده",
        description: "صفحه روی موبایل خوانا و قابل اقدام است.",
      },
    ],
    // Shared draft order — intentionally identical; only proof industries must differ.
    sectionOrder: [
      "hero",
      "problems",
      "outcomes",
      "blueprint",
      "requiredBlocks",
      "designDirections",
      "example",
      "deliverables",
      "exclusions",
      "process",
      "pricing",
      "faq",
      "related",
      "finalCta",
    ],
    blueprint: ["services", "about", "faq", "contact"],
    requiredBlocks: [
      { key: "services", title: "خدمات", description: `فهرست خدمات ${input.name}` },
      { key: "about", title: "درباره", description: "معرفی کوتاه کسب‌وکار" },
      { key: "faq", title: "سؤالات متداول", description: "پاسخ به نگرانی‌های پرتکرار" },
      { key: "contact", title: "تماس", description: "فرم و راه‌های ارتباطی" },
    ],
    optionalBlocks: ["testimonials"],
    designDirections: [
      {
        key: "modern",
        label: "مدرن",
        description: "چیدمان ساده و خوانا برای معرفی سریع.",
        bestFor: input.name,
      },
      {
        key: "formal",
        label: "رسمی",
        description: "حس حرفه‌ای برای اعتماد اولیه.",
        bestFor: input.name,
      },
    ],
    imageDirection: {
      photographyStyle: "تصاویر واقعی از محیط کار",
      lighting: "نور طبیعی یا یکنواخت",
      composition: "تصویر هیرو + جزئیات خدمات",
      colorPalette: "خنثی با یک رنگ تأکیدی",
      avoid: ["استوک بی‌ربط", "متن زیاد روی تصویر"],
    },
    deliverables: [
      "صفحه معرفی خدمات",
      "مسیر تماس",
      "نسخه موبایل",
      "سئوی پایه",
    ],
    exclusions: [
      "فروشگاه و درگاه پیچیده",
      "پنل کاربری اختصاصی",
      "اتوماسیون سفارشی",
    ],
    examples: [
      {
        slug: `${input.slug}-concept`,
        conceptName: `نمونه ${input.name}`,
        isConceptual: true,
        disclaimer: "نمونه طراحی فرضی است و کسب‌وکار واقعی نیست.",
        businessGoal: `معرفی ${input.name} و دریافت تماس`,
        visualStyle: "ساده و کاربردی",
        whyStructure: `برای ${input.name} ابتدا خدمات و سپس تماس اولویت دارد تا بازدیدکننده سریع اقدام کند.`,
        includedBlocks: ["services", "about", "contact", "faq"],
        desktopCaption: "نمای دسکتاپ — پیش‌نویس",
        mobileCaption: "نمای موبایل — پیش‌نویس",
      },
    ],
    faqs: [
      {
        question: `سایت FastWeb برای ${input.name} چه چیزی تحویل می‌دهد؟`,
        answer:
          "نسخه اول قابل انتشار با معرفی خدمات، مسیر تماس و طراحی مناسب موبایل. امکانات پیچیده خارج از بسته است.",
      },
      {
        question: "آیا قبل از انتشار پیش‌نمایش دارم؟",
        answer: "بله. پیش‌نمایش را می‌بینید و پس از تأیید منتشر می‌شود.",
      },
      {
        question: "اگر بعداً امکانات بیشتری خواستم؟",
        answer: "می‌توانید از مسیر طراحی سایت اختصاصی آرایه توسعه دهید.",
      },
    ],
    relatedIndustries: input.related,
    relatedGuides: [],
    metadata: {
      title: input.title,
      description: input.description.slice(0, 160),
      h1: input.h1,
    },
    pageTone: "formal",
    hubAnchor: input.hubAnchor,
    advancedProjectRoute: "/website-design",
    updatedAt: "2026-07-19",
    indexable: false,
    reviewed: false,
  };
}

export const legacyDraftIndustries: FastWebIndustry[] = [
  draft({
    slug: "psychologist",
    name: "روانشناس",
    shortName: "روانشناس",
    categoryKey: "professional",
    primaryKeyword: "طراحی سایت روانشناس",
    title: "طراحی سایت روانشناس فوری و اقتصادی | FastWeb آرایه",
    description:
      "طراحی سایت روانشناس با FastWeb؛ معرفی حوزه‌های مشاوره، رزومه و فرم درخواست جلسه. نسخه اول در ۲۴ ساعت کاری.",
    h1: "طراحی سایت روانشناس؛ معرفی خدمات و دریافت درخواست جلسه",
    intent: "روانشناس مستقل می‌خواهد حوزه‌های مشاوره و مسیر درخواست جلسه را نشان دهد — بدون پرونده درمانی.",
    cta: "پیش‌نمایش سایت روانشناس من",
    hubAnchor: "طراحی سایت روانشناس",
    related: ["beauty-salon", "gym"],
  }),
  draft({
    slug: "accounting",
    name: "حسابداری",
    shortName: "حسابداری",
    categoryKey: "professional",
    primaryKeyword: "طراحی سایت حسابداری",
    title: "طراحی سایت حسابداری فوری و حرفه‌ای | FastWeb آرایه",
    description:
      "طراحی سایت شرکت حسابداری با FastWeb؛ معرفی خدمات مالیاتی و دریافت درخواست مشاوره.",
    h1: "طراحی سایت حسابداری؛ معرفی خدمات و دریافت درخواست مشاوره",
    intent: "موسسه حسابداری می‌خواهد خدمات مالیاتی و مسیر درخواست مشاوره را رسمی نشان دهد.",
    cta: "پیش‌نمایش سایت حسابداری من",
    hubAnchor: "طراحی سایت شرکت حسابداری",
    related: ["law-firm", "beauty-salon"],
  }),
  draft({
    slug: "construction-company",
    name: "شرکت ساختمانی",
    shortName: "ساختمانی",
    categoryKey: "company-b2b",
    primaryKeyword: "طراحی سایت شرکت ساختمانی",
    title: "سایت اقتصادی شرکت ساختمانی | FastWeb آرایه",
    description:
      "سایت شرکت ساختمانی با معرفی پروژه‌ها و دریافت درخواست برآورد. نسخه اول در ۲۴ ساعت کاری.",
    h1: "سایت شرکت ساختمانی؛ پروژه‌ها و درخواست برآورد",
    intent: "شرکت ساختمانی می‌خواهد نمونه‌کار و مسیر درخواست برآورد را نشان دهد.",
    cta: "پیش‌نمایش سایت ساختمانی من",
    hubAnchor: "سایت اقتصادی شرکت ساختمانی",
    related: ["gym", "law-firm"],
  }),
  draft({
    slug: "fitness-coach",
    name: "مربی ورزشی",
    shortName: "مربی",
    categoryKey: "gym-fitness",
    primaryKeyword: "طراحی سایت مربی ورزشی",
    title: "طراحی سایت مربی ورزشی | FastWeb آرایه",
    description:
      "سایت مربی ورزشی با معرفی خدمات کوچینگ و درخواست جلسه. برای باشگاه کامل به صفحه باشگاه مراجعه کنید.",
    h1: "طراحی سایت مربی ورزشی؛ معرفی خدمات و درخواست جلسه",
    intent: "مربی مستقل می‌خواهد پکیج‌های کوچینگ و مسیر رزرو جلسه را نشان دهد.",
    cta: "پیش‌نمایش سایت مربی من",
    hubAnchor: "طراحی سایت مربی ورزشی (فردی)",
    related: ["gym", "beauty-salon"],
  }),
  draft({
    slug: "industrial-company",
    name: "شرکت صنعتی",
    shortName: "صنعتی",
    categoryKey: "company-b2b",
    primaryKeyword: "طراحی سایت شرکت صنعتی",
    title: "طراحی سایت شرکت صنعتی | FastWeb آرایه",
    description:
      "سایت شرکت صنعتی با معرفی محصولات/خدمات B2B و دریافت درخواست استعلام.",
    h1: "طراحی سایت شرکت صنعتی؛ معرفی و درخواست استعلام",
    intent: "شرکت صنعتی می‌خواهد کاتالوگ خدمات و مسیر استعلام را نشان دهد.",
    cta: "پیش‌نمایش سایت صنعتی من",
    hubAnchor: "طراحی سایت شرکت صنعتی",
    related: ["law-firm", "gym"],
  }),
  draft({
    slug: "real-estate",
    name: "مشاور املاک",
    shortName: "املاک",
    categoryKey: "real-estate",
    primaryKeyword: "سایت مشاور املاک",
    title: "سایت مشاور املاک | FastWeb آرایه",
    description: "سایت مشاور املاک با معرفی خدمات و مسیر تماس. هنوز بررسی کیفیت نشده است.",
    h1: "سایت مشاور املاک؛ معرفی خدمات و تماس",
    intent: "مشاور املاک می‌خواهد خدمات و مسیر تماس را سریع آنلاین کند.",
    cta: "پیش‌نمایش سایت املاک من",
    hubAnchor: "سایت مشاور املاک",
    related: ["law-firm", "beauty-salon"],
  }),
  draft({
    slug: "home-services",
    name: "خدمات منزل",
    shortName: "خدمات منزل",
    categoryKey: "service-business",
    primaryKeyword: "طراحی سایت خدمات منزل",
    title: "طراحی سایت خدمات منزل | FastWeb آرایه",
    description: "سایت خدمات منزل با لیست خدمات و درخواست سرویس. در انتظار بازبینی کیفیت.",
    h1: "طراحی سایت خدمات منزل؛ خدمات و درخواست سرویس",
    intent: "ارائه‌دهنده خدمات منزل می‌خواهد خدمات و درخواست سرویس را شفاف کند.",
    cta: "پیش‌نمایش سایت خدمات منزل من",
    hubAnchor: "طراحی سایت خدمات منزل",
    related: ["beauty-salon", "gym"],
  }),
  draft({
    slug: "car-repair",
    name: "تعمیرگاه خودرو",
    shortName: "تعمیرگاه",
    categoryKey: "service-business",
    primaryKeyword: "طراحی سایت تعمیرگاه خودرو",
    title: "طراحی سایت تعمیرگاه خودرو | FastWeb آرایه",
    description: "سایت تعمیرگاه با خدمات و درخواست پذیرش. در انتظار بازبینی کیفیت.",
    h1: "طراحی سایت تعمیرگاه؛ خدمات و درخواست پذیرش",
    intent: "تعمیرگاه می‌خواهد خدمات و مسیر پذیرش خودرو را نشان دهد.",
    cta: "پیش‌نمایش سایت تعمیرگاه من",
    hubAnchor: "طراحی سایت تعمیرگاه خودرو",
    related: ["gym", "law-firm"],
  }),
  draft({
    slug: "language-school",
    name: "آموزشگاه زبان",
    shortName: "آموزشگاه",
    categoryKey: "education",
    primaryKeyword: "طراحی سایت آموزشگاه زبان",
    title: "طراحی سایت آموزشگاه زبان | FastWeb آرایه",
    description: "سایت آموزشگاه زبان با دوره‌ها و ثبت‌نام اولیه. در انتظار بازبینی کیفیت.",
    h1: "طراحی سایت آموزشگاه زبان؛ دوره‌ها و ثبت‌نام",
    intent: "آموزشگاه زبان می‌خواهد دوره‌ها و مسیر ثبت‌نام را نشان دهد.",
    cta: "پیش‌نمایش سایت آموزشگاه من",
    hubAnchor: "طراحی سایت آموزشگاه زبان",
    related: ["gym", "beauty-salon"],
  }),
  draft({
    slug: "insurance",
    name: "نمایندگی بیمه",
    shortName: "بیمه",
    categoryKey: "professional",
    primaryKeyword: "طراحی سایت نمایندگی بیمه",
    title: "طراحی سایت نمایندگی بیمه | FastWeb آرایه",
    description: "سایت نمایندگی بیمه با خدمات و درخواست مشاوره. در انتظار بازبینی کیفیت.",
    h1: "طراحی سایت نمایندگی بیمه؛ خدمات و مشاوره",
    intent: "نماینده بیمه می‌خواهد پوشش‌ها و مسیر درخواست مشاوره را نشان دهد.",
    cta: "پیش‌نمایش سایت بیمه من",
    hubAnchor: "طراحی سایت نمایندگی بیمه",
    related: ["law-firm", "beauty-salon"],
  }),
  draft({
    slug: "travel-agency",
    name: "آژانس مسافرتی",
    shortName: "آژانس",
    categoryKey: "service-business",
    primaryKeyword: "طراحی سایت آژانس مسافرتی",
    title: "طراحی سایت آژانس مسافرتی | FastWeb آرایه",
    description: "سایت آژانس با تورها و درخواست مشاوره سفر. در انتظار بازبینی کیفیت.",
    h1: "طراحی سایت آژانس مسافرتی؛ تورها و درخواست",
    intent: "آژانس مسافرتی می‌خواهد تورها و مسیر درخواست را نشان دهد.",
    cta: "پیش‌نمایش سایت آژانس من",
    hubAnchor: "طراحی سایت آژانس مسافرتی",
    related: ["beauty-salon", "gym"],
  }),
];
