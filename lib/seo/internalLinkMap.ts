/**
 * Internal linking map for Araaye SEO clusters (doctors + AI).
 * Source of truth for hub CTAs and content planning — prefer body links over footer.
 */

export type LinkPlacement = "body" | "hero" | "cta" | "related" | "nav" | "footer";
export type LinkPriority = "P0" | "P1" | "P2";

export type InternalLinkEdge = {
  href: string;
  anchors: string[];
  placement: LinkPlacement;
  priority: LinkPriority;
};

export type InternalLinkNode = {
  url: string;
  primaryKeyword: string;
  inboundFrom: InternalLinkEdge[];
  outboundTo: InternalLinkEdge[];
};

export const INTERNAL_LINK_MAP: Record<string, InternalLinkNode> = {
  "/doctors": {
    url: "/doctors",
    primaryKeyword: "طراحی سایت پزشکی",
    inboundFrom: [
      {
        href: "/blog/doctors",
        anchors: ["طراحی سایت پزشکی", "پکیج سایت پزشکان"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/blog/online-booking-system-for-clinics",
        anchors: ["طراحی سایت کلینیک و مطب", "پکیج سایت پزشکان آرایه"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/blog/doctor-website-seo-mistakes",
        anchors: ["طراحی سایت پزشکی", "صفحه خدمات پزشکان"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/seo/doctor",
        anchors: ["طراحی سایت پزشکان", "سایت مطب"],
        placement: "body",
        priority: "P1",
      },
    ],
    outboundTo: [
      {
        href: "/blog/doctors",
        anchors: ["راهنمای طراحی سایت و سئو پزشکان"],
        placement: "related",
        priority: "P0",
      },
      {
        href: "/seo/doctor",
        anchors: ["سئو سایت پزشکان"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/website/clinic",
        anchors: ["طراحی سایت کلینیک"],
        placement: "body",
        priority: "P1",
      },
      {
        href: "/doctors/dentist",
        anchors: ["طراحی سایت دندانپزشکی"],
        placement: "body",
        priority: "P1",
      },
    ],
  },
  "/blog/doctors": {
    url: "/blog/doctors",
    primaryKeyword: "راهنمای طراحی سایت و سئو پزشکان",
    inboundFrom: [
      {
        href: "/blog",
        anchors: ["مقالات پزشکان", "خوشه طراحی سایت پزشکی"],
        placement: "nav",
        priority: "P0",
      },
      {
        href: "/doctors",
        anchors: ["راهنمای سئو و طراحی سایت پزشکان"],
        placement: "related",
        priority: "P1",
      },
      {
        href: "/blog/doctor-website-seo-mistakes",
        anchors: ["مرکز مقالات پزشکان"],
        placement: "related",
        priority: "P0",
      },
      {
        href: "/blog/online-booking-system-for-clinics",
        anchors: ["راهنمای طراحی سایت و سئو پزشکان"],
        placement: "related",
        priority: "P0",
      },
    ],
    outboundTo: [
      {
        href: "/doctors",
        anchors: ["طراحی سایت پزشکی", "سایت حرفه‌ای برای مطب"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/seo/doctor",
        anchors: ["سئو سایت پزشکان"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/website/clinic",
        anchors: ["طراحی سایت کلینیک"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/blog/doctor-website-seo-mistakes",
        anchors: ["اشتباهات سئو سایت پزشکان"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/blog/local-seo-for-doctors",
        anchors: ["لوکال سئو برای پزشکان"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/blog/clinic-website-features",
        anchors: ["امکانات سایت کلینیک"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/blog/online-booking-system-for-clinics",
        anchors: ["نوبت‌دهی آنلاین مطب و کلینیک"],
        placement: "body",
        priority: "P0",
      },
    ],
  },
  "/seo/doctor": {
    url: "/seo/doctor",
    primaryKeyword: "سئو سایت پزشکان",
    inboundFrom: [
      {
        href: "/blog/doctors",
        anchors: ["سئو سایت پزشکان"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/doctors",
        anchors: ["سئو پزشکان"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/blog/doctor-website-seo-mistakes",
        anchors: ["سرویس سئو پزشکان"],
        placement: "cta",
        priority: "P0",
      },
    ],
    outboundTo: [
      {
        href: "/doctors",
        anchors: ["طراحی سایت پزشکی"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/seo/clinic",
        anchors: ["سئو کلینیک"],
        placement: "body",
        priority: "P1",
      },
      {
        href: "/blog/doctors",
        anchors: ["مقالات سئو پزشکان"],
        placement: "related",
        priority: "P1",
      },
    ],
  },
  "/seo/clinic": {
    url: "/seo/clinic",
    primaryKeyword: "سئو کلینیک",
    inboundFrom: [
      {
        href: "/blog/clinic-seo-checklist",
        anchors: ["سئو کلینیک"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/website/clinic",
        anchors: ["سئو سایت کلینیک"],
        placement: "body",
        priority: "P1",
      },
      {
        href: "/seo/doctor",
        anchors: ["سئو کلینیک چندتخصصی"],
        placement: "body",
        priority: "P1",
      },
    ],
    outboundTo: [
      {
        href: "/website/clinic",
        anchors: ["طراحی سایت کلینیک"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/seo/doctor",
        anchors: ["سئو مطب تک‌نفره"],
        placement: "body",
        priority: "P1",
      },
      {
        href: "/blog/doctors",
        anchors: ["راهنمای پزشکان و کلینیک"],
        placement: "related",
        priority: "P1",
      },
    ],
  },
  "/website/clinic": {
    url: "/website/clinic",
    primaryKeyword: "طراحی سایت کلینیک",
    inboundFrom: [
      {
        href: "/blog/doctors",
        anchors: ["طراحی سایت کلینیک"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/doctors",
        anchors: ["سایت کلینیک"],
        placement: "body",
        priority: "P1",
      },
      {
        href: "/blog/clinic-website-features",
        anchors: ["طراحی سایت کلینیک آرایه"],
        placement: "cta",
        priority: "P0",
      },
    ],
    outboundTo: [
      {
        href: "/doctors",
        anchors: ["طراحی سایت پزشکی"],
        placement: "related",
        priority: "P0",
      },
      {
        href: "/seo/clinic",
        anchors: ["سئو کلینیک"],
        placement: "body",
        priority: "P1",
      },
      {
        href: "/blog/doctors",
        anchors: ["مقالات طراحی سایت کلینیک"],
        placement: "related",
        priority: "P1",
      },
    ],
  },
  "/ai": {
    url: "/ai",
    primaryKeyword: "آرایه AI",
    inboundFrom: [
      {
        href: "/blog/ai",
        anchors: ["آرایه AI", "پنل چندمدلی"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/ai/compare",
        anchors: ["آرایه AI"],
        placement: "nav",
        priority: "P0",
      },
      {
        href: "/ai/pricing",
        anchors: ["شروع با آرایه AI"],
        placement: "cta",
        priority: "P0",
      },
    ],
    outboundTo: [
      {
        href: "/ai/compare",
        anchors: ["مقایسه مدل‌های هوش مصنوعی"],
        placement: "hero",
        priority: "P0",
      },
      {
        href: "/ai/pricing",
        anchors: ["قیمت‌گذاری"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/blog/ai",
        anchors: ["راهنمای کاربردی هوش مصنوعی"],
        placement: "related",
        priority: "P1",
      },
      {
        href: "/prompts",
        anchors: ["کتابخانه پرامپت"],
        placement: "body",
        priority: "P1",
      },
    ],
  },
  "/blog/ai": {
    url: "/blog/ai",
    primaryKeyword: "راهنمای کاربردی هوش مصنوعی",
    inboundFrom: [
      {
        href: "/blog",
        anchors: ["مقالات هوش مصنوعی", "راهنمای AI"],
        placement: "nav",
        priority: "P0",
      },
      {
        href: "/ai",
        anchors: ["آموزش عملی هوش مصنوعی"],
        placement: "related",
        priority: "P1",
      },
      {
        href: "/ai/compare",
        anchors: ["راهنمای انتخاب مدل"],
        placement: "related",
        priority: "P1",
      },
    ],
    outboundTo: [
      {
        href: "/ai",
        anchors: ["آرایه AI"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/ai/compare",
        anchors: ["مقایسه مدل‌ها", "آزمایش تعاملی"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/prompts",
        anchors: ["پرامپت‌های آماده"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/ai/pricing",
        anchors: ["قیمت‌گذاری AI"],
        placement: "body",
        priority: "P0",
      },
    ],
  },
  "/ai/compare": {
    url: "/ai/compare",
    primaryKeyword: "مقایسه مدل‌های هوش مصنوعی",
    inboundFrom: [
      {
        href: "/blog/ai",
        anchors: ["مقایسه تعاملی مدل‌ها"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/ai",
        anchors: ["مقایسه مدل‌ها"],
        placement: "hero",
        priority: "P0",
      },
      {
        href: "/prompts",
        anchors: ["تست پرامپت روی چند مدل"],
        placement: "body",
        priority: "P1",
      },
    ],
    outboundTo: [
      {
        href: "/ai",
        anchors: ["پنل آرایه AI"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/ai/pricing",
        anchors: ["مشاهده قیمت"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/blog/ai",
        anchors: ["راهنمای آموزشی AI"],
        placement: "related",
        priority: "P1",
      },
    ],
  },
  "/ai/pricing": {
    url: "/ai/pricing",
    primaryKeyword: "قیمت‌گذاری آرایه AI",
    inboundFrom: [
      {
        href: "/blog/ai",
        anchors: ["قیمت‌گذاری AI"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/ai",
        anchors: ["پلن‌ها و قیمت"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/ai/compare",
        anchors: ["خرید اعتبار"],
        placement: "cta",
        priority: "P1",
      },
    ],
    outboundTo: [
      {
        href: "/ai",
        anchors: ["شروع با آرایه AI"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/ai/compare",
        anchors: ["اول مقایسه کنید"],
        placement: "body",
        priority: "P1",
      },
      {
        href: "/blog/ai",
        anchors: ["راهنمای کاربردی AI"],
        placement: "related",
        priority: "P2",
      },
    ],
  },
  "/prompts": {
    url: "/prompts",
    primaryKeyword: "پرامپت هوش مصنوعی",
    inboundFrom: [
      {
        href: "/blog/ai",
        anchors: ["کتابخانه پرامپت"],
        placement: "body",
        priority: "P0",
      },
      {
        href: "/ai",
        anchors: ["پرامپت‌های آماده"],
        placement: "body",
        priority: "P1",
      },
      {
        href: "/ai/compare",
        anchors: ["نمونه پرامپت"],
        placement: "related",
        priority: "P1",
      },
    ],
    outboundTo: [
      {
        href: "/ai/compare",
        anchors: ["اجرای پرامپت روی چند مدل"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/ai",
        anchors: ["آرایه AI"],
        placement: "cta",
        priority: "P0",
      },
      {
        href: "/blog/ai",
        anchors: ["آموزش پرامپت‌نویسی"],
        placement: "related",
        priority: "P1",
      },
    ],
  },
};

export function getLinkNode(url: string): InternalLinkNode | undefined {
  return INTERNAL_LINK_MAP[url];
}

export function getOutboundLinks(url: string, minPriority: LinkPriority = "P2"): InternalLinkEdge[] {
  const node = INTERNAL_LINK_MAP[url];
  if (!node) return [];
  const order: LinkPriority[] = ["P0", "P1", "P2"];
  const minIdx = order.indexOf(minPriority);
  return node.outboundTo.filter((edge) => order.indexOf(edge.priority) <= minIdx);
}
