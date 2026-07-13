import { SITE_URL } from "@/lib/siteUrl";

export const sfImages = {
  hero: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1400&q=85&auto=format&fit=crop",
  heroAlt: "معاینه تخصصی چشم در محیط کلینیک",
  surgeon: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&q=85&auto=format&fit=crop",
  surgeonAlt: "جراح متخصص در حال انجام عمل دقیق",
  clinic: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=85&auto=format&fit=crop",
  clinicAlt: "فضای آرام و مجهز کلینیک",
} as const;

export const sfContact = {
  phone: "۰۲۱-۰۰۰۰۰۰۰۰",
  phoneTel: "tel:+982100000000",
  telegram: "https://t.me/salamatfarda_eye",
  instagram: "https://instagram.com/salamat.farda.eye",
  address: "بیمارستان سلامت فردا — [آدرس دقیق پس از تأیید]",
  hours: "شنبه تا پنج‌شنبه ۹ تا ۲۰ · جمعه تعطیل",
} as const;

export const sfBrand = {
  name: "مرکز تخصصی چشم",
  hospital: "بیمارستان سلامت فردا",
  tagline: "چشم‌هایی که فردا را می‌بینند، امروز در بیمارستان سلامت فردا معاینه می‌شوند.",
  instagram: "@salamat.farda.eye",
  followers: "۴۴٬۴۰۰+",
} as const;

export const sfValues = [
  { label: "تخصص", desc: "تیم جراحان با تجربه در زیبایی و جراحی چشم" },
  { label: "دقت", desc: "برنامه‌ریزی دقیق قبل از هر مداخله" },
  { label: "آرامش بینایی", desc: "مراقبت کامل از مشاوره تا پیگیری" },
] as const;

export const sfNav = [
  { label: "صفحه اصلی", href: "#top" },
  { label: "خدمات", href: "#services" },
  { label: "قبل و بعد", href: "#gallery" },
  { label: "درباره ما", href: "#about" },
  { label: "پرسش‌ها", href: "#faq" },
  { label: "نوبت‌دهی", href: "#contact" },
] as const;

export const sfCarouselServices = [
  { id: "bleph", title: "بلفاروپلاستی", subtitle: "جراحی پلک", icon: "👁️" },
  { id: "botox", title: "بوتاکس", subtitle: "زیبایی چشم", icon: "✦" },
  { id: "brow", title: "کاشت ابرو", subtitle: "ترمیم ابرو", icon: "◈" },
  { id: "clinic", title: "خدمات کلینیک", subtitle: "خدمات مجموعه", icon: "◎" },
  { id: "thread", title: "لیفت صورت با نخ", subtitle: "جوانسازی", icon: "◇" },
  { id: "laser", title: "لیزر موهای زائد", subtitle: "دستگاه لیزر", icon: "◉" },
  { id: "browlift", title: "لیفت ابرو", subtitle: "بالا بردن ابرو", icon: "👀" },
  { id: "asian", title: "پیک آسیایی", subtitle: "فرم پلک", icon: "◐" },
  { id: "design", title: "طراحی پلک", subtitle: "طراحی اختصاصی", icon: "◑" },
] as const;

export const sfFeaturedServices = [
  {
    id: "blepharoplasty",
    title: "بلفاروپلاستی",
    description:
      "اصلاح افتادگی پلک بالا و پایین با تکنیک‌های مدرن و بخیه لیزری برای بهبود سریع‌تر.",
    highlight: "پرطرفدار",
  },
  {
    id: "eyelid-design",
    title: "طراحی پلک",
    description:
      "طراحی فرم پلک متناسب با آناتومی صورت — قبل از عمل، نتیجه را با دقت برنامه‌ریزی می‌کنیم.",
    highlight: "اختصاصی",
  },
  {
    id: "laser-suture",
    title: "بخیه لیزری",
    description:
      "بستن بخیه با لیزر برای ظاهر تمیزتر، التیام سریع‌تر و اثربخشی بهتر در جراحی‌های ظریف.",
    highlight: "پیشرفته",
  },
  {
    id: "asian-eyelid",
    title: "پیک آسیایی",
    description:
      "ایجاد چین طبیعی پلک با حفظ هویت چهره — مناسب برای فرم‌های مختلف صورت.",
    highlight: null,
  },
  {
    id: "consultation",
    title: "مشاوره رایگان",
    description:
      "ارزیابی اولیه، پاسخ به پرسش‌ها و معرفی گزینه‌های درمانی متناسب با شرایط شما.",
    highlight: "رایگان",
  },
  {
    id: "chin",
    title: "ساکشن غبغب",
    description:
      "رفع چربی زیر چانه با تکنیک‌های کم‌تهاجمی برای خط فک واضح‌تر و پروفایل متعادل‌تر.",
    highlight: null,
  },
] as const;

export const sfBeforeAfter = [
  {
    id: "ba-1",
    title: "بلفاروپلاستی پلک بالا",
    caption: "اصلاح افتادگی و باز شدن میدان دید",
  },
  {
    id: "ba-2",
    title: "طراحی پلک",
    caption: "فرم متعادل و طبیعی پس از جراحی",
  },
  {
    id: "ba-3",
    title: "پیک آسیایی",
    caption: "چین پلک طبیعی با حفظ هویت چهره",
  },
  {
    id: "ba-4",
    title: "لیفت ابرو",
    caption: "بالا بردن ابرو و جوان‌تر شدن نگاه",
  },
] as const;

export const sfProcessSteps = [
  { step: "۰۱", title: "مشاوره رایگان", text: "بررسی نیازها، پرسش‌ها و انتظارات شما" },
  { step: "۰۲", title: "طراحی و برنامه‌ریزی", text: "طراحی پلک و توضیح مراحل عمل" },
  { step: "۰۳", title: "جراحی تخصصی", text: "انجام مداخله با دقت و تجهیزات پیشرفته" },
  { step: "۰۴", title: "پیگیری و مراقبت", text: "ویزیت‌های بعد از عمل و راهنمایی مراقبتی" },
] as const;

export const sfTestimonials = [
  {
    id: "t1",
    quote:
      "قبل از عمل خیلی نگران بودم، ولی توضیحات دقیق دکتر و نتیجه طبیعی پلک‌ها اعتمادم را برگرداند.",
    name: "مراجع",
    service: "بلفاروپلاستی",
  },
  {
    id: "t2",
    quote:
      "مشاوره رایگان واقعاً کمک کرد انتخاب درستی داشته باشم. تیم کلینیک در تمام مراحل همراه بود.",
    name: "مراجع",
    service: "طراحی پلک",
  },
  {
    id: "t3",
    quote:
      "بخیه لیزری التیام را سریع‌تر کرد و اثری از بخیه باقی نماند. از نتیجه بسیار راضی‌ام.",
    name: "مراجع",
    service: "جراحی پلک",
  },
] as const;

export const sfFaq = [
  {
    q: "بلفاروپلاستی برای چه کسانی مناسب است؟",
    a: "افرادی که افتادگی پلک دارند، میدان دیدشان محدود شده یا از ظاهر پلک ناراضی‌اند. مناسب بودن پس از معاینه مشخص می‌شود.",
  },
  {
    q: "دوران نقاهت جراحی پلک چقدر است؟",
    a: "معمولاً ۷ تا ۱۴ روز برای بازگشت به فعالیت‌های روزمره؛ التیام کامل ممکن است چند هفته طول بکشد.",
  },
  {
    q: "آیا مشاوره اولیه رایگان است؟",
    a: "بله. می‌توانید از طریق فرم سایت، تلگرام یا تماس تلفنی برای مشاوره رایگان وقت بگیرید.",
  },
  {
    q: "بخیه لیزری چه مزیتی دارد؟",
    a: "بخیه لیزری می‌تواند ظاهر محل بخیه را تمیزتر و روند بهبود را سریع‌تر کند؛ مناسب بودن بسته به نوع جراحی تعیین می‌شود.",
  },
  {
    q: "چگونه نوبت بگیرم؟",
    a: "فرم نوبت‌دهی را پر کنید، در تلگرام پیام دهید یا با شماره کلینیک تماس بگیرید.",
  },
] as const;

export const sfRequestTypes = [
  "مشاوره رایگان",
  "بلفاروپلاستی",
  "طراحی پلک",
  "پیک آسیایی",
  "بوتاکس",
  "سایر خدمات",
] as const;

export const sfStats = [
  { value: "۴۴K+", label: "دنبال‌کننده اینستاگرام" },
  { value: "۱۰+", label: "سال تجربه تخصصی" },
  { value: "۱۰۰۰+", label: "مراجع راضی" },
  { value: "۲۴/۷", label: "پشتیبانی تلگرام" },
] as const;

export const sfJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: "مرکز تخصصی چشم بیمارستان سلامت فردا",
  description: sfBrand.tagline,
  url: `${SITE_URL}/showdemoto/salamat-farda-eye`,
  medicalSpecialty: "Ophthalmology",
  sameAs: [sfContact.instagram, sfContact.telegram],
  availableService: sfFeaturedServices.map((s) => s.title),
};
