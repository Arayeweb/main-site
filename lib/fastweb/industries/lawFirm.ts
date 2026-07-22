import type { FastWebIndustry } from "@/lib/fastweb/industrySchema";

const UPDATED = "2026-07-22";

/**
 * Law firm — search intent: consultation request + practice areas + credentials/trust.
 * Section order is trust-first: credentials early, problems later, pricing near end.
 */
export const lawFirmIndustry: FastWebIndustry = {
  slug: "law-firm",
  name: "دفتر وکالت",
  shortName: "وکالت",
  categoryKey: "law-firm",
  searchTerms: [
    "طراحی سایت دفتر وکالت",
    "سایت وکیل",
    "طراحی سایت موسسه حقوقی",
    "سایت درخواست مشاوره حقوقی",
  ],
  searchIntent:
    "وکیل یا موسسه حقوقی می‌خواهد حوزه‌های تخصصی، اعتبار حرفه‌ای و مسیر درخواست مشاوره را رسمی نشان دهد — نه پرونده آنلاین و نه پرداخت حق‌الوکاله در سایت.",
  audience: ["وکیل مستقل", "دفتر وکالت کوچک", "موسسه حقوقی"],
  primaryGoal: "دریافت درخواست مشاوره حقوقی اولیه",
  primaryCta: "پیش‌نمایش سایت دفتر وکالت من",
  secondaryCta: "دیدن نمونه حقوقی",
  hero: {
    eyebrow: "سایت فوری برای دفتر وکالت",
    title: "حوزه‌های تخصصی، اعتبار و درخواست مشاوره",
    description:
      "مراجع قبل از تماس می‌خواهد بداند در چه حوزه‌هایی کار می‌کنید، چه سابقه‌ای دارید و چطور مشاوره اولیه بگیرد. نسخه اول رسمی و خوانا آماده می‌شود.",
  },
  problems: [
    {
      title: "اعتماد حقوقی از اینستاگرام ساخته نمی‌شود",
      description:
        "بدون معرفی مدارک، عضویت‌ها و حوزه‌های دقیق، مراجع جدی تماس نمی‌گیرد.",
    },
    {
      title: "حوزه‌های کاری مبهم است",
      description:
        "حقوق خانواده، قرارداد، کیفری یا ملکی اگر جدا نشده باشد، پیام‌های نامرتبط زیاد می‌شود.",
    },
    {
      title: "مسیر مشاوره اولیه نامشخص است",
      description:
        "اگر فرم یا تماس مستقیم نباشد، مراجع بین واتساپ و تلفن سردرگم می‌ماند.",
    },
  ],
  outcomes: [
    {
      title: "حوزه‌های وکالت تفکیک‌شده",
      description: "هر حوزه با توضیح کوتاه و مرز کار مشخص.",
    },
    {
      title: "اعتبار حرفه‌ای قابل بررسی",
      description: "مدارک، سوابق و عضویت‌ها در یک بخش قابل اسکن.",
    },
    {
      title: "درخواست مشاوره کنترل‌شده",
      description: "فرم با موضوع پرونده تقریبی — بدون دریافت اسناد حساس.",
    },
  ],
  sectionOrder: [
    "hero",
    "outcomes",
    "requiredBlocks",
    "blueprint",
    "designDirections",
    "example",
    "process",
    "deliverables",
    "exclusions",
    "problems",
    "faq",
    "pricing",
    "related",
    "finalCta",
  ],
  blueprint: ["practiceAreas", "credentials", "process", "about", "booking", "faq", "contact"],
  requiredBlocks: [
    {
      key: "practiceAreas",
      title: "حوزه‌های تخصصی",
      description: "خانواده، قرارداد، کیفری، ملکی و سایر حوزه‌ها به‌صورت جدا",
    },
    {
      key: "credentials",
      title: "مدارک و سوابق",
      description: "پروانه، تحصیلات و عضویت‌های حرفه‌ای",
    },
    {
      key: "process",
      title: "نحوه همکاری",
      description: "از درخواست مشاوره تا جلسه حضوری یا آنلاین",
    },
    {
      key: "booking",
      title: "درخواست مشاوره",
      description: "فرم با موضوع تقریبی — بدون آپلود پرونده",
    },
    {
      key: "about",
      title: "درباره دفتر",
      description: "معرفی کوتاه وکیل یا تیم",
    },
    {
      key: "contact",
      title: "تماس رسمی",
      description: "تلفن دفتر، ایمیل و آدرس",
    },
  ],
  optionalBlocks: ["testimonials", "faq"],
  designDirections: [
    {
      key: "formal",
      label: "رسمی و مطمئن",
      description: "نیم‌تیره، تایپوگرافی آرام، تأکید روی اعتبار و خوانایی.",
      bestFor: "دفاتر وکالت سنتی و موسسات حقوقی",
    },
    {
      key: "modern",
      label: "مدرن و شفاف",
      description: "فضای سفید بیشتر، ساختار واضح حوزه‌ها، حس دسترسی‌پذیری.",
      bestFor: "وکلای جوان و دفاتر مشاوره‌محور",
    },
    {
      key: "editorial",
      label: "نشریه‌ای حقوقی",
      description: "تیترهای دقیق، سلسله‌مراتب متن قوی، حداقل تزئین.",
      bestFor: "موسساتی با محتوای توضیحی بیشتر",
    },
  ],
  imageDirection: {
    photographyStyle: "پرتره رسمی، فضای دفتر، جزئیات مدارک بدون افشای اطلاعات موکل",
    lighting: "نور یکنواخت و حرفه‌ای؛ بدون فیلتر رنگی",
    composition: "پرتره نیم‌تنه، قفسه/میز کار مینیمال، آیکون‌های ساده برای حوزه‌ها",
    colorPalette: "سرمه‌ای، خاکستری گرم، سفید — یک لهجه طلایی بسیار محدود",
    avoid: ["تصاویر ترازو و چکش کلیشه‌ای استوک", "عکس موکل یا جلسه دادگاه", "رنگ‌های نئون"],
  },
  deliverables: [
    "صفحه معرفی دفتر و حوزه‌های تخصصی",
    "بخش مدارک و سوابق",
    "توضیح فرایند مشاوره",
    "فرم درخواست مشاوره اولیه",
    "تماس، آدرس و نسخه موبایل",
    "نسخه اول در ۲۴ ساعت کاری",
  ],
  exclusions: [
    "سامانه مدیریت پرونده و اسناد موکل",
    "پرداخت آنلاین حق‌الوکاله",
    "چت مشاوره‌ای محرمانه درون‌سایت",
    "پنل موکل با تاریخچه پرونده",
  ],
  examples: [
    {
      slug: "rahman-law",
      conceptName: "دفتر وکالت راه‌من",
      isConceptual: true,
      disclaimer: "نمونه طراحی فرضی است و دفتر وکالت واقعی نیست.",
      businessGoal: "جذب درخواست مشاوره در حوزه‌های خانواده و قرارداد",
      visualStyle: "رسمی سرمه‌ای با تأکید روی حوزه‌ها و مدارک",
      whyStructure:
        "برای خدمات حقوقی، اعتماد قبل از اقدام می‌آید؛ بنابراین حوزه‌ها و اعتبار زودتر از قیمت آمده و فرم مشاوره بدون دریافت اسناد حساس طراحی شده است.",
      includedBlocks: ["practiceAreas", "credentials", "process", "booking", "about", "contact"],
      desktopCaption: "نمای دسکتاپ — حوزه‌ها و اعتبار در هیرو ساختاری",
      mobileCaption: "نمای موبایل — درخواست مشاوره در دسترس ثابت",
    },
  ],
  faqs: [
    {
      question: "آیا می‌توان پرونده یا مدارک موکل را در سایت آپلود کرد؟",
      answer:
        "خیر. FastWeb فقط درخواست مشاوره اولیه می‌گیرد. نگهداری اسناد و پرونده خارج از این بسته و نیازمند زیرساخت امن اختصاصی است.",
    },
    {
      question: "آیا حق‌الوکاله را در سایت می‌نویسیم؟",
      answer:
        "معمولاً بازه یا «پس از بررسی موضوع» مناسب‌تر است. مبلغ قطعی بدون شناخت پرونده گمراه‌کننده است و توصیه نمی‌شود.",
    },
    {
      question: "چند حوزه تخصصی می‌توانم معرفی کنم؟",
      answer:
        "در بسته پایه حوزه‌های اصلی در یک صفحه می‌آیند؛ در پلاس می‌توانید برای هر حوزه صفحه جدا داشته باشید.",
    },
    {
      question: "سایت وکالت با صفحه لینکدین چه فرقی دارد؟",
      answer:
        "سایت آدرس رسمی شماست با حوزه‌ها، مسیر مشاوره و کنترل پیام؛ لینکدین شبکه حرفه‌ای است و جایگزین صفحه معرفی دفتر نیست.",
    },
  ],
  relatedIndustries: ["beauty-salon", "gym"],
  relatedGuides: [],
  metadata: {
    title: "طراحی سایت دفتر وکالت و موسسه حقوقی | FastWeb آرایه",
    description:
      "سایت دفتر وکالت با حوزه‌های تخصصی، مدارک و درخواست مشاوره. نسخه اول در ۲۴ ساعت کاری، از ۴.۹ میلیون تومان.",
    h1: "طراحی سایت دفتر وکالت؛ حوزه‌ها، اعتبار و درخواست مشاوره",
  },
  pageTone: "formal",
  hubAnchor: "طراحی سایت دفتر وکالت",
  advancedProjectRoute: "/website-design",
  updatedAt: UPDATED,
  indexable: true,
  reviewed: true,
  reviewedAt: UPDATED,
};
