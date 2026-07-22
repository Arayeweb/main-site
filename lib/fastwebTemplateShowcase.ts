// =========================================================
// Sample content for each of the 10 FastWeb categories — used only by the
// internal /fastweb/templates gallery so the team can review every
// Core + Block combination with realistic (not placeholder) copy.
// =========================================================

import type {
  FastWebBrief,
  FastWebCategoryKey,
  FastWebPreviewContent,
} from "@/lib/fastweb";
import { getFastWebCategory } from "@/lib/fastwebCategories";

interface ShowcaseEntry {
  brief: FastWebBrief;
  content: FastWebPreviewContent;
}

function entry(
  categoryKey: FastWebCategoryKey,
  brandColor: string,
  style: FastWebBrief["style"],
  overrides: Partial<FastWebPreviewContent> & { businessName: string; city?: string }
): ShowcaseEntry {
  const category = getFastWebCategory(categoryKey)!;
  const brief: FastWebBrief = {
    categoryKey,
    businessName: overrides.businessName,
    city: overrides.city,
    brandColor,
    style,
    contacts: {
      phone: "021-91000000",
      whatsapp: "09120000000",
      instagram: "@" + overrides.businessName.replace(/\s+/g, "").toLowerCase(),
      address: `${overrides.city || "تهران"}، خیابان نمونه`,
      hours: "شنبه تا چهارشنبه ۹ تا ۱۸",
      email: "info@example.com",
    },
    logoUrl: undefined,
  };

  const base: FastWebPreviewContent = {
    headline: overrides.headline || overrides.businessName,
    subheadline: overrides.subheadline || category.pitch,
    aboutText: overrides.aboutText || category.description,
    offerings: overrides.offerings || [],
    portfolioNotes: overrides.portfolioNotes || [],
    testimonials: overrides.testimonials || [],
    faq: overrides.faq || [],
    ctaText: overrides.ctaText || "درخواست مشاوره",
    formTitle: overrides.formTitle || "فرم درخواست",
    seoTitle: overrides.businessName,
    seoDescription: overrides.subheadline || category.pitch,
    categoryKey,
    templateKey: category.core,
    styleKey: style || "modern",
    brandColor,
    sections: overrides.sections || [
      "hero",
      ...category.defaultSections,
      "contact",
    ],
    pricingPlans: overrides.pricingPlans || [],
    teamMembers: overrides.teamMembers || [],
    galleryNotes: overrides.galleryNotes || [],
    listings: overrides.listings || [],
    schedule: overrides.schedule || [],
    stats: overrides.stats || [],
    clients: overrides.clients || [],
  };

  return { brief, content: base };
}

export const FASTWEB_TEMPLATE_SHOWCASE: Record<FastWebCategoryKey, ShowcaseEntry> = {
  "service-business": entry("service-business", "#0F4C5C", "modern", {
    businessName: "تاسیسات پارسیان",
    city: "کرج",
    headline: "تاسیسات پارسیان در کرج",
    subheadline: "نصب، تعمیر و سرویس تاسیسات گرمایشی و سرمایشی — با گارانتی و اعزام سریع.",
    offerings: [
      { title: "نصب پکیج و رادیاتور", description: "نصب استاندارد با گارانتی یک‌ساله قطعات و اجرا." },
      { title: "تعمیر تاسیسات", description: "عیب‌یابی و تعمیر تخصصی پکیج، آبگرمکن و لوله‌کشی." },
      { title: "سرویس دوره‌ای", description: "قرارداد سرویس فصلی برای ساختمان‌ها و واحدهای مسکونی." },
    ],
    testimonials: [
      { name: "حسین م.", text: "همان روز تماس اومدن و مشکل پکیج رو حل کردن." },
    ],
    faq: [
      { question: "هزینه اعزام چقدر است؟", answer: "برای بازدید داخل کرج هزینه اعزام ندارد." },
    ],
    ctaText: "درخواست بازدید",
  }),

  professional: entry("professional", "#1E3A5F", "formal", {
    businessName: "دکتر آرش نجفی",
    city: "تهران",
    headline: "دکتر آرش نجفی — متخصص پوست و مو",
    subheadline: "بیش از ۱۲ سال تجربه در درمان‌های پوست، لیزر و جوانسازی.",
    aboutText: "دکتر آرش نجفی، متخصص پوست، مو و زیبایی، فارغ‌التحصیل دانشگاه علوم پزشکی تهران با بیش از ۱۲ سال تجربه بالینی است.",
    offerings: [
      { title: "درمان آکنه و جای جوش", description: "پروتکل درمانی اختصاصی بر اساس نوع پوست." },
      { title: "لیزر موهای زائد", description: "دستگاه‌های روز با کمترین درد و بازگشت سریع." },
      { title: "مشاوره جوانسازی پوست", description: "بوتاکس، فیلر و درمان‌های غیرجراحی." },
    ],
    testimonials: [
      { name: "نگار س.", text: "برخورد دکتر خیلی حرفه‌ای بود و نتیجه درمان عالی شد." },
    ],
    faq: [
      { question: "برای وقت گرفتن چه کنم؟", answer: "از فرم پایین صفحه یا واتساپ مطب وقت رزرو کنید." },
    ],
    ctaText: "رزرو نوبت",
  }),

  "online-store": entry("online-store", "#B8542F", "modern", {
    businessName: "فروشگاه چرم آوا",
    city: "تبریز",
    headline: "چرم آوا — کیف و کفش چرم دست‌دوز",
    subheadline: "تولید و فروش کیف، کفش و اکسسوری چرم طبیعی با ارسال به سراسر ایران.",
    offerings: [
      { title: "کیف دستی زنانه", description: "چرم طبیعی، دوخت دستی، رنگ‌بندی متنوع." },
      { title: "کفش کلاسیک مردانه", description: "چرم گاوی درجه یک با ضمانت دوخت." },
      { title: "کمربند و اکسسوری", description: "ست‌های هدیه با بسته‌بندی ویژه." },
    ],
    pricingPlans: [
      { name: "کیف دستی مدل آوا", price: "۲٬۹۵۰٬۰۰۰ تومان", description: "چرم طبیعی گاوی", features: ["رنگ‌بندی: مشکی، عسلی، قهوه‌ای", "ارسال رایگان بالای ۳ میلیون"] },
      { name: "کفش کلاسیک مردانه", price: "۳٬۴۰۰٬۰۰۰ تومان", description: "چرم درجه یک با ضمانت", features: ["سایزبندی ۴۰ تا ۴۵", "۷ روز ضمانت تعویض"] },
    ],
    galleryNotes: ["کیف دستی آوا — مشکی", "کفش کلاسیک — قهوه‌ای", "ست کمربند و کیف پول", "کیف رودوشی چرم"],
    testimonials: [{ name: "مریم ت.", text: "کیفیت چرم فوق‌العاده بود، دقیقاً مثل عکس‌ها." }],
    faq: [{ question: "ارسال چند روز طول می‌کشد؟", answer: "ارسال به سراسر ایران ۲ تا ۴ روز کاری." }],
    ctaText: "سفارش محصول",
  }),

  "restaurant-cafe": entry("restaurant-cafe", "#8B3A3A", "warm", {
    businessName: "کافه رسپینا",
    city: "اصفهان",
    headline: "کافه رسپینا در اصفهان",
    subheadline: "قهوه تخصصی، صبحانه و دسر خانگی در فضایی آرام و دلنشین.",
    offerings: [
      { title: "اسپرسو و قهوه‌های تخصصی", description: "دان قهوه تازه‌برشته با باریستای مجرب." },
      { title: "صبحانه کامل", description: "صبحانه ایرانی و فرنگی، هر روز از ساعت ۸." },
      { title: "دسر و شیرینی خانگی", description: "چیزکیک، براونی و کیک‌های تازه هر روز." },
    ],
    galleryNotes: ["فضای داخلی کافه", "میز اسپرسو بار", "صبحانه فرنگی", "کیک خانگی رسپینا"],
    testimonials: [{ name: "سینا ر.", text: "بهترین قهوه اصفهان رو اینجا خوردم، فضاش هم آرومه." }],
    faq: [{ question: "آیا رزرو میز لازم است؟", answer: "برای گروه‌های بالای ۴ نفر رزرو پیشنهاد می‌شود." }],
    ctaText: "مشاهده منو",
  }),

  "company-b2b": entry("company-b2b", "#1F3B4D", "formal", {
    businessName: "صنایع فولاد البرز",
    city: "قزوین",
    headline: "صنایع فولاد البرز",
    subheadline: "تولیدکننده قطعات فولادی صنعتی برای خطوط تولید خودرو و ماشین‌آلات سنگین.",
    offerings: [
      { title: "تولید قطعات فولادی سفارشی", description: "بر اساس نقشه مشتری با تلرانس دقیق." },
      { title: "ماشین‌کاری CNC", description: "خطوط تولید مدرن با کنترل کیفیت مستمر." },
      { title: "تامین برای خودروسازان", description: "همکاری بلندمدت با تیراژ صنعتی." },
    ],
    stats: [
      { value: "+۱۸", label: "سال فعالیت" },
      { value: "+۴۰", label: "مشتری صنعتی" },
      { value: "۲۴/۷", label: "خط تولید" },
      { value: "ISO 9001", label: "گواهی کیفیت" },
    ],
    clients: ["سایپا", "ایران‌خودرو", "گروه صنعتی آذر", "ماشین‌سازی البرز"],
    teamMembers: [
      { name: "مهدی رضایی", role: "مدیر تولید", bio: "۱۵ سال تجربه در مدیریت خطوط تولید صنعتی." },
    ],
    testimonials: [
      { name: "مدیر تامین آذرخودرو", text: "کیفیت پایدار قطعات و تعهد تیم البرز به زمان تحویل، این همکاری را به یک شراکت بلندمدت تبدیل کرده است." },
    ],
    faq: [{ question: "حداقل تیراژ سفارش چقدر است؟", answer: "بسته به قطعه، از ۵۰۰ عدد به بالا قابل بررسی است." }],
    ctaText: "درخواست همکاری B2B",
  }),

  "beauty-salon": entry("beauty-salon", "#A6416F", "warm", {
    businessName: "سالن زیبایی ملیسا",
    city: "شیراز",
    headline: "سالن زیبایی ملیسا در شیراز",
    subheadline: "خدمات تخصصی مو، پوست و ناخن با محصولات اورجینال و کادر مجرب.",
    offerings: [
      { title: "رنگ و مدل مو", description: "رنگ تخصصی، بالیاژ و مدل روز با محصولات اورجینال." },
      { title: "خدمات ناخن", description: "کاشت، ژلیش و طراحی ناخن با استریلیزاسیون کامل." },
      { title: "پاکسازی و مراقبت پوست", description: "پاکسازی صورت و درمان‌های ضدپیری." },
    ],
    galleryNotes: ["مدل رنگ بالیاژ", "طراحی ناخن ژلیش", "قبل و بعد پاکسازی پوست", "فضای داخلی سالن"],
    portfolioNotes: ["تغییر رنگ مو از قهوه‌ای به بالیاژ عسلی", "طراحی ناخن مینیمال برای عروس"],
    testimonials: [{ name: "الهام د.", text: "رنگ موم دقیقاً همونی شد که می‌خواستم، خیلی حرفه‌ای بودن." }],
    faq: [
      { question: "برای رزرو چه زمانی اقدام کنم؟", answer: "برای خدمات تخصصی رنگ و عروس بهتر است حداقل یک هفته زودتر وقت خود را قطعی کنید." },
      { question: "مشاوره قبل از خدمات دارید؟", answer: "بله، مشاوره اولیه برای انتخاب خدمات و بررسی شرایط مو و پوست رایگان است." },
    ],
    ctaText: "رزرو نوبت آنلاین",
  }),

  "gym-fitness": entry("gym-fitness", "#1A5C3E", "modern", {
    businessName: "باشگاه پاور فیت",
    city: "مشهد",
    headline: "باشگاه پاور فیت مشهد",
    subheadline: "بدنسازی، کراسفیت و برنامه شخصی‌سازی‌شده با مربیان مجرب.",
    pricingPlans: [
      { name: "عضویت ماهانه", price: "۱٬۲۰۰٬۰۰۰ تومان", description: "دسترسی آزاد به سالن بدنسازی", features: ["استفاده از کلیه دستگاه‌ها", "یک جلسه مشاوره رایگان"] },
      { name: "عضویت + برنامه شخصی", price: "۲٬۵۰۰٬۰۰۰ تومان", description: "با نظارت مربی اختصاصی", features: ["برنامه تمرینی ماهانه", "پیگیری پیشرفت هفتگی"] },
      { name: "کلاس گروهی کراسفیت", price: "۹۵۰٬۰۰۰ تومان", description: "۱۲ جلسه در ماه", features: ["گروه‌های حداکثر ۸ نفره", "مربی اختصاصی کلاس"] },
    ],
    teamMembers: [
      { name: "رضا کریمی", role: "مربی بدنسازی", bio: "مربی درجه یک فدراسیون با ۱۰ سال تجربه." },
      { name: "سارا احمدی", role: "مربی کراسفیت", bio: "متخصص برنامه‌های تناسب اندام و کاهش وزن." },
    ],
    schedule: [
      { day: "شنبه، دوشنبه، چهارشنبه", time: "۱۸ تا ۱۹:۳۰", title: "کلاس کراسفیت" },
      { day: "یکشنبه، سه‌شنبه", time: "۱۷ تا ۱۸", title: "کلاس بدنسازی خانم‌ها" },
      { day: "هر روز", time: "۶ تا ۲۲", title: "ساعت آزاد باشگاه" },
    ],
    testimonials: [{ name: "امیرحسین ب.", text: "با برنامه اختصاصی مربی در ۳ ماه به هدفم رسیدم." }],
    faq: [
      { question: "جلسه آزمایشی دارید؟", answer: "بله، می‌توانید پیش از ثبت‌نام یک جلسه با هماهنگی مجموعه تمرین کنید." },
      { question: "برنامه غذایی هم ارائه می‌شود؟", answer: "در پلن مربی اختصاصی، ارزیابی اولیه و برنامه تغذیه متناسب با هدف شما ارائه می‌شود." },
    ],
    ctaText: "ثبت‌نام عضویت",
  }),

  "law-firm": entry("law-firm", "#2C3E50", "formal", {
    businessName: "موسسه حقوقی دادپویان",
    city: "تهران",
    headline: "موسسه حقوقی دادپویان",
    subheadline: "مشاوره و وکالت تخصصی در دعاوی ملکی، قراردادها و امور خانواده.",
    offerings: [
      { title: "دعاوی ملکی و قراردادها", description: "تنظیم و بررسی قرارداد، دعاوی خلع‌ید و الزام به تنظیم سند." },
      { title: "امور خانواده", description: "طلاق، مهریه، حضانت و نفقه با رویکرد مذاکره‌محور." },
      { title: "دعاوی تجاری", description: "وصول مطالبات، دعاوی چک و سفته برای کسب‌وکارها." },
    ],
    portfolioNotes: [
      "احقاق حق مشتری در دعوای ملکی پیچیده با رای قطعی به نفع موکل",
      "مذاکره و توافق در پرونده خانوادگی بدون نیاز به دادگاه طولانی",
    ],
    testimonials: [
      { name: "موکل پرونده ملکی", text: "از ابتدا مسیر پرونده و ریسک‌ها شفاف توضیح داده شد و پیگیری منظم تیم، آرامش زیادی به ما داد." },
    ],
    faq: [{ question: "هزینه مشاوره اولیه چقدر است؟", answer: "جلسه مشاوره اولیه حضوری یا آنلاین با هزینه ثابت مشخص برگزار می‌شود." }],
    ctaText: "درخواست مشاوره حقوقی",
  }),

  "real-estate": entry("real-estate", "#5C4A2E", "modern", {
    businessName: "املاک کیان",
    city: "کرج",
    headline: "املاک کیان در کرج",
    subheadline: "خرید، فروش و رهن و اجاره واحدهای مسکونی و تجاری با مشاوره تخصصی.",
    listings: [
      { title: "آپارتمان ۱۱۰ متری، گوهردشت", price: "۴٫۲ میلیارد تومان", meta: "۲ خواب، طبقه ۳، سند تک‌برگ" },
      { title: "واحد تجاری، بلوار طالقانی", price: "رهن ۲۰۰ میلیون / اجاره ۱۵ میلیون", meta: "۴۵ متر، همکف، مناسب هر شغل" },
      { title: "ویلایی، مشکین‌دشت", price: "۷٫۸ میلیارد تومان", meta: "۳۰۰ متر زمین، ۲۰۰ متر بنا" },
    ],
    offerings: [
      { title: "مشاوره خرید و فروش", description: "بررسی بازار و مذاکره قیمت برای بهترین معامله." },
      { title: "رهن و اجاره", description: "فایل‌های به‌روز مسکونی و تجاری متناسب با بودجه." },
    ],
    testimonials: [
      { name: "خانواده احمدی", text: "فایل‌ها واقعی و متناسب با بودجه ما بود؛ بدون اتلاف وقت خانه مناسب‌مان را پیدا کردیم." },
    ],
    faq: [{ question: "بازدید ملک چگونه است؟", answer: "با هماهنگی قبلی از طریق واتساپ، بازدید حضوری ترتیب داده می‌شود." }],
    ctaText: "مشاهده فایل‌های بیشتر",
  }),

  education: entry("education", "#2E5C6E", "modern", {
    businessName: "آموزشگاه زبان نووا",
    city: "تهران",
    headline: "آموزشگاه زبان نووا",
    subheadline: "دوره‌های زبان انگلیسی، آلمانی و آیلتس با اساتید مجرب و کلاس‌های کوچک.",
    offerings: [
      { title: "دوره‌های عمومی انگلیسی", description: "از سطح پایه تا پیشرفته با متد ارتباطی." },
      { title: "آمادگی آیلتس و تافل", description: "کلاس‌های فشرده با آزمون‌های شبیه‌سازی‌شده." },
      { title: "زبان آلمانی A1 تا B2", description: "مناسب متقاضیان مهاجرت و تحصیل." },
    ],
    teamMembers: [
      { name: "دکتر لیلا حیدری", role: "مدیر آموزشی و مدرس آیلتس", bio: "مدرک IELTS 8.5 و ۱۲ سال تجربه تدریس." },
      { name: "مارتین اشمیت", role: "مدرس زبان آلمانی", bio: "مدرس بومی با تجربه بین‌المللی." },
    ],
    schedule: [
      { day: "شنبه تا چهارشنبه", time: "۱۶ تا ۲۱", title: "کلاس‌های عصر" },
      { day: "پنجشنبه و جمعه", time: "۹ تا ۱۴", title: "کلاس‌های فشرده آخر هفته" },
    ],
    testimonials: [{ name: "پارسا ک.", text: "با کلاس آیلتس نووا نمره ۷.۵ گرفتم، تدریس خیلی هدفمند بود." }],
    ctaText: "ثبت‌نام دوره",
  }),
};

export function getFastWebTemplateShowcase(
  categoryKey: FastWebCategoryKey
): ShowcaseEntry {
  return FASTWEB_TEMPLATE_SHOWCASE[categoryKey];
}
