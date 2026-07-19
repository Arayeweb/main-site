import { blogPosts, type BlogPost } from "@/lib/blog/posts";

export type BlogClusterId = "doctors" | "ai";

export type BlogClusterTopic = {
  id: string;
  title: string;
  description: string;
};

export type BlogClusterServiceLink = {
  href: string;
  label: string;
  description: string;
};

export type BlogClusterDef = {
  id: BlogClusterId;
  path: `/blog/${BlogClusterId}`;
  primaryKeyword: string;
  searchIntent: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  topics: BlogClusterTopic[];
  featuredSlugs: string[];
  latestSlugs: string[];
  relatedSlugs: string[];
  serviceLinks: BlogClusterServiceLink[];
  cta: {
    title: string;
    description: string;
    href: string;
    label: string;
  };
  emptyArticlesNote?: string;
};

export const BLOG_CLUSTERS: Record<BlogClusterId, BlogClusterDef> = {
  doctors: {
    id: "doctors",
    path: "/blog/doctors",
    primaryKeyword: "طراحی سایت و سئو پزشکان",
    searchIntent: "Informational / Commercial investigation",
    metaTitle: "راهنمای طراحی سایت و سئو پزشکان | بلاگ آرایه",
    metaDescription:
      "مرکز مقالات طراحی سایت پزشکی، سئو پزشکان، سئو کلینیک و جذب بیمار از گوگل. راهنماهای عملی با لینک به سرویس طراحی سایت پزشکان آرایه.",
    h1: "راهنمای طراحی سایت و سئو پزشکان",
    intro:
      "این صفحه مرکز محتوای آرایه برای پزشکان و کلینیک‌هاست: از طراحی سایت پزشکی و ساختار صفحات تخصصی تا سئوی محلی، نوبت‌دهی و تبدیل بازدید به تماس. هدف ما این نیست که فقط مقاله منتشر کنیم؛ هر مطلب به یک تصمیم مشخص در مسیر جذب بیمار کمک می‌کند و در نهایت به صفحه خدمات مرتبط وصل می‌شود. اگر مطب تک‌نفره دارید یا کلینیک چندتخصصی، از موضوعات زیر شروع کنید و برای اجرای حرفه‌ای به صفحات سرویس بروید.",
    topics: [
      {
        id: "medical-website",
        title: "طراحی سایت پزشکی",
        description: "ساختار صفحات، اعتماد بیمار و مسیر رزرو روی موبایل.",
      },
      {
        id: "doctor-seo",
        title: "سئو سایت پزشکان",
        description: "اشتباهات رایج، لوکال سئو و صفحات تخصصی مطابق نیت جستجو.",
      },
      {
        id: "clinic-website",
        title: "طراحی سایت کلینیک",
        description: "امکانات ضروری کلینیک برای تبدیل بازدید به رزرو.",
      },
      {
        id: "patient-conversion",
        title: "جذب و تبدیل بیمار",
        description: "نوبت‌دهی، CTA، فرم درخواست و مسیر تماس شفاف.",
      },
      {
        id: "case-studies",
        title: "مطالعات موردی",
        description: "نمونه‌های واقعی و درس‌های پروژه برای تخصص‌های مختلف.",
      },
    ],
    featuredSlugs: [
      "doctor-website-seo-mistakes",
      "local-seo-for-doctors",
      "clinic-website-features",
    ],
    latestSlugs: [
      "doctor-website-seo-mistakes",
      "clinic-seo-checklist",
      "local-seo-for-doctors",
      "clinic-website-features",
      "online-booking-system-for-clinics",
    ],
    relatedSlugs: [
      "doctor-website-seo-mistakes",
      "clinic-seo-checklist",
      "local-seo-for-doctors",
      "clinic-website-features",
      "online-booking-system-for-clinics",
      "google-my-business-local-seo",
      "website-chatbot-customer-support",
      "website-speed-core-web-vitals",
    ],
    serviceLinks: [
      {
        href: "/doctors",
        label: "طراحی سایت پزشکی",
        description: "پکیج طراحی سایت مطب و کلینیک با مسیر تماس و نوبت.",
      },
      {
        href: "/seo/doctor",
        label: "سئو سایت پزشکان",
        description: "سئوی محلی و تخصصی برای مطب تک‌نفره و پروفایل پزشک.",
      },
      {
        href: "/website/clinic",
        label: "طراحی سایت کلینیک",
        description: "سایت چندتخصصی با معماری صفحات و مسیر لید مشخص.",
      },
    ],
    cta: {
      title: "برای مطب یا کلینیک سایت حرفه‌ای می‌خواهید؟",
      description:
        "اگر می‌خواهید از جستجوی گوگل تا تماس و درخواست نوبت مسیر مشخصی داشته باشید، پکیج طراحی سایت پزشکی آرایه را ببینید.",
      href: "/doctors",
      label: "مشاهده طراحی سایت پزشکان",
    },
  },
  ai: {
    id: "ai",
    path: "/blog/ai",
    primaryKeyword: "راهنمای کاربردی هوش مصنوعی",
    searchIntent: "Informational",
    metaTitle: "راهنمای کاربردی هوش مصنوعی | بلاگ آرایه",
    metaDescription:
      "مرکز آموزش عملی هوش مصنوعی: استفاده از مدل‌ها، پرامپت‌نویسی، برنامه‌نویسی با AI و مقایسه کاربردی. برای آزمایش تعاملی به آرایه AI بروید.",
    h1: "راهنمای کاربردی هوش مصنوعی",
    intro:
      "این Hub برای آموزش عملی است: چطور از GPT، Claude، Gemini و DeepSeek در کار واقعی استفاده کنید، پرامپت بنویسید، خروجی را بررسی کنید و مدل مناسب را انتخاب کنید. مقایسه تعاملی و خرید اشتراک چندمدلی در صفحات محصول آرایه انجام می‌شود؛ اینجا روش، آزمایش و تجربه می‌آید تا بدون رقابت محتوایی با Compare، مسیر یادگیری شفاف بماند.",
    topics: [
      {
        id: "ai-howto",
        title: "آموزش استفاده از AI",
        description: "شروع کار با مدل‌ها و جریان کار روزمره.",
      },
      {
        id: "model-tests",
        title: "مقایسه و آزمایش مدل‌ها",
        description: "آزمایش‌های عملی؛ برای مقایسه زنده به /ai/compare بروید.",
      },
      {
        id: "prompting",
        title: "پرامپت‌نویسی",
        description: "ساخت پرامپت فارسی و الگوهای قابل تکرار.",
      },
      {
        id: "ai-coding",
        title: "AI برای برنامه‌نویسی",
        description: "کمک کدنویسی، دیباگ و انتخاب مدل مناسب.",
      },
      {
        id: "ai-business",
        title: "AI برای کسب‌وکار",
        description: "کاربرد در محتوا، پشتیبانی و تصمیم‌گیری.",
      },
    ],
    featuredSlugs: [],
    latestSlugs: [],
    relatedSlugs: ["website-chatbot-customer-support"],
    serviceLinks: [
      {
        href: "/ai",
        label: "آرایه AI",
        description: "دسترسی به چند مدل هوش مصنوعی در یک پنل.",
      },
      {
        href: "/ai/compare",
        label: "مقایسه مدل‌ها",
        description: "مقایسه تعاملی مدل‌ها روی پرامپت واقعی شما.",
      },
      {
        href: "/prompts",
        label: "کتابخانه پرامپت",
        description: "پرامپت‌های آماده برای کارهای رایج فارسی.",
      },
      {
        href: "/ai/pricing",
        label: "قیمت‌گذاری AI",
        description: "اعتبار و پلن‌های دسترسی چندمدلی.",
      },
    ],
    cta: {
      title: "چند مدل هوش مصنوعی را در آرایه امتحان کنید",
      description:
        "برای آموزش همین Hub را بخوانید؛ برای آزمایش زنده و مقایسه خروجی‌ها، Compare آرایه را باز کنید.",
      href: "/ai/compare",
      label: "شروع مقایسه مدل‌ها",
    },
    emptyArticlesNote:
      "مقالات آموزشی اختصاصی AI به‌زودی منتشر می‌شوند. تا آن زمان از صفحات محصول و راهنماهای مرتبط استفاده کنید.",
  },
};

export function getClusterPosts(clusterId: BlogClusterId): BlogPost[] {
  return blogPosts.filter(
    (post) => post.cluster === clusterId && post.href.startsWith("/blog/"),
  );
}

export function resolveClusterPosts(slugs: string[]): BlogPost[] {
  const bySlug = new Map(blogPosts.map((p) => [p.slug, p]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((post): post is BlogPost => Boolean(post && post.href.startsWith("/blog/")));
}

export function getBlogCluster(id: BlogClusterId): BlogClusterDef {
  return BLOG_CLUSTERS[id];
}
