import { SITE_URL } from "@/lib/siteUrl";

export const kavehImages = {
  hero: "/showcase-assets/kaveh/hero.jpg",
  heroAlt: "انبار مقاطع فولادی و آهن‌آلات ساختمانی",
  products: {
    rebar: "/showcase-assets/kaveh/product-rebar.jpg",
    beam: "/showcase-assets/kaveh/product-beam.jpg",
    sheet: "/showcase-assets/kaveh/product-sheet.jpg",
    delivery: "/showcase-assets/kaveh/delivery.jpg",
  },
} as const;

export const kavehContact = {
  phone: "۰۲۱-۰۰۰۰۰۰۰۰",
  phoneTel: "tel:+982100000000",
  whatsapp: "https://wa.me/989000000000",
  address: "[آدرس انبار — پس از تأیید نهایی جایگزین می‌شود]",
} as const;

export const kavehNav = [
  { label: "محصولات", href: "#products" },
  { label: "استعلام قیمت", href: "#quote" },
  { label: "نحوه ارسال", href: "#delivery" },
  { label: "سوالات متداول", href: "#faq" },
  { label: "تماس", href: "#contact" },
] as const;

export const kavehProducts = [
  { id: "rebar", name: "میلگرد", desc: "تأمین میلگرد ساختمانی با ثبت سایز و مقدار دقیق.", image: kavehImages.products.rebar },
  { id: "beam", name: "تیرآهن", desc: "تیرآهن در سایزهای متداول برای پروژه‌های ساختمانی.", image: kavehImages.products.beam },
  { id: "black-sheet", name: "ورق سیاه", desc: "ورق سیاه با ضخامت و ابعاد قابل‌ثبت در فرم استعلام.", image: kavehImages.products.sheet },
  { id: "galvanized", name: "ورق گالوانیزه", desc: "مناسب کاربردهایی که به مقاومت خوردگی نیاز دارند.", image: kavehImages.products.sheet },
  { id: "angle", name: "نبشی و ناودانی", desc: "مقاطع ساختمانی برای اسکلت و اتصالات.", image: kavehImages.products.beam },
  { id: "profile", name: "قوطی و پروفیل", desc: "پروفیل‌های ساختمانی و صنعتی با مشخصات قابل‌ثبت.", image: kavehImages.products.rebar },
  { id: "pipe", name: "لوله", desc: "لوله فولادی در سایزها و کاربردهای مختلف.", image: kavehImages.products.rebar },
  { id: "mesh", name: "توری و مش", desc: "توری و مش فلزی برای پروژه‌های عمرانی و صنعتی.", image: kavehImages.products.sheet },
] as const;

export const kavehUnits = ["کیلوگرم", "تن", "شاخه", "ورق", "عدد"] as const;

export const kavehBenefits = [
  "ثبت سریع درخواست",
  "امکان سفارش چند محصول",
  "هماهنگی تلفنی پیش از خرید",
  "بررسی مشخصات سفارش",
  "هماهنگی ارسال تا مقصد",
] as const;

export const kavehProcess = [
  "ثبت محصول و مقدار موردنیاز",
  "بررسی درخواست",
  "اعلام قیمت و شرایط",
  "تأیید سفارش",
  "هماهنگی ارسال",
] as const;

export const kavehExamples = [
  "میلگرد سایز ۱۴، مقدار ۲ تن، مقصد تهران",
  "تیرآهن سایز ۱۶، تعداد ۳۰ شاخه",
  "ورق سیاه ۲ میلی‌متر، ابعاد مشخص، مقدار ۱۰ ورق",
] as const;

export const kavehFaq = [
  {
    q: "برای استعلام قیمت چه اطلاعاتی لازم است؟",
    a: "نوع محصول، سایز یا مشخصات، مقدار، واحد و شهر مقصد. هرچه دقیق‌تر باشد، پاسخ سریع‌تر و شفاف‌تر است.",
  },
  {
    q: "قیمت اعلام‌شده تا چه زمانی معتبر است؟",
    a: "قیمت آهن‌آلات به نوسان بازار وابسته است. زمان اعتبار قیمت در تماس هماهنگی اعلام می‌شود.",
  },
  {
    q: "حداقل مقدار سفارش چقدر است؟",
    a: "بسته به نوع محصول متفاوت است. پس از ثبت درخواست، حداقل مقدار قابل‌سفارش بررسی و اعلام می‌شود.",
  },
  {
    q: "هزینه ارسال چگونه محاسبه می‌شود؟",
    a: "بر اساس نوع کالا، وزن، مقصد و روش حمل. پس از تأیید سفارش هماهنگ می‌شود.",
  },
  {
    q: "امکان سفارش چند نوع محصول وجود دارد؟",
    a: "بله. می‌توانید چند محصول را در یک درخواست یا با تماس جداگانه ثبت کنید.",
  },
  {
    q: "چطور مشخصات دقیق محصول را ارسال کنیم؟",
    a: "در فرم استعلام یا از طریق واتساپ و تماس؛ سایز، ضخامت، طول و مقدار را بنویسید.",
  },
] as const;

export const kavehJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "آهن کاوه",
  description: "فروش و تأمین آهن‌آلات ساختمانی — نمونه مفهومی طراحی شده توسط آرایه.",
  url: `${SITE_URL}/showcase/kaveh-iron`,
};
