/**
 * Machine-readable AI SEO surfaces for the website-design cluster.
 * Content is generated from pricing + industry SoT — do not hardcode prices here.
 */

import { SITE_NAME } from "@/lib/seo/siteIdentity";
import { SITE_URL, canonicalUrl } from "@/lib/siteUrl";
import {
  FASTWEB_PLUS_PRICE_TOMAN,
  FASTWEB_START_PRICE_TOMAN,
  WEBSITE_PRICING_OFFERS,
  WEBSITE_PRICING_UPDATED_AT,
  formatWebsiteDesignPrice,
  websiteDesignPricingPlans,
} from "@/lib/websitePricing";
import { FASTWEB_PACKAGES } from "@/lib/fastweb";
import { getPublishedIndustryPages } from "@/lib/seo/programmaticPages";
import { getIndexableFastWebIndustries } from "@/lib/fastweb/industries";

function tomanLine(n: number): string {
  return `${formatWebsiteDesignPrice(n)} تومان (${n.toLocaleString("en-US")} IRR)`;
}

/** Hub industry cards for ItemList / llms.txt (mirrors IndustryHubLinks + sales overrides). */
export function getWebsiteDesignHubListItems(): {
  name: string;
  url: string;
  description: string;
}[] {
  const sales = [
    {
      name: "طراحی سایت پزشکی",
      url: canonicalUrl("/doctors"),
      description: "پزشکان — طراحی سایت پزشک و مطب",
    },
    {
      name: "طراحی سایت رستوران",
      url: canonicalUrl("/website-design/restaurant"),
      description: "رستوران و کافه — منوی دیجیتال و سفارش آنلاین",
    },
  ];

  const programmatic = getPublishedIndustryPages("website")
    .filter((p) => p.slug !== "restaurant")
    .map((page) => ({
      name: page.primaryKeyword,
      url: canonicalUrl(`/website/${page.slug}`),
      description: page.secondaryKeywords[0] ?? page.primaryKeyword,
    }));

  return [...sales, ...programmatic];
}

export function buildWebsiteDesignItemListJsonLd() {
  const items = getWebsiteDesignHubListItems();
  return {
    "@type": "ItemList",
    name: "طراحی سایت برای صنایع مختلف | آرایه",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
      description: item.description,
    })),
  };
}

export function buildLlmsTxt(): string {
  const hubItems = getWebsiteDesignHubListItems();
  const fastweb = getIndexableFastWebIndustries();

  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_NAME} طراحی سایت، سئو، نرم‌افزار اختصاصی و راهکارهای هوش مصنوعی را برای کسب‌وکارهای ایرانی یکپارچه می‌کند.`,
    "",
    `سایت: ${SITE_URL}`,
    `آخرین به‌روزرسانی تعرفه طراحی سایت: ${WEBSITE_PRICING_UPDATED_AT}`,
    "",
    "## طراحی سایت",
    "",
    `- [طراحی سایت حرفه‌ای](${canonicalUrl("/website-design")}): طراحی اختصاصی فروش‌محور برای معرفی برند، جذب مشتری و مسیر تماس.`,
    `- [قیمت طراحی سایت](${canonicalUrl("/website-design/cost")}): مقایسه شفاف FastWeb و پکیج‌های اختصاصی.`,
    `- [تعرفه ماشین‌خوان](${canonicalUrl("/pricing.md")}): قیمت‌ها به صورت ساختاریافته برای agentها.`,
    `- [سایت فوری FastWeb](${canonicalUrl("/fastweb")}): سایت رسمی سریع با قالب کنترل‌شده؛ نسخه اول در ۲۴ ساعت کاری.`,
    "",
    "### تفاوت مسیرها",
    "",
    `- FastWeb: شروع از ${tomanLine(FASTWEB_START_PRICE_TOMAN)}؛ حضور رسمی سریع، ساختار ازپیش‌تعریف‌شده، نه سیستم فروش پیچیده.`,
    `- طراحی اختصاصی: شروع از ${tomanLine(websiteDesignPricingPlans[0].priceFrom)}؛ برند، چند صفحه و امکانات سفارشی در ۳ تا ۱۲ هفته.`,
    "",
    "### صفحات تخصصی طراحی سایت",
    "",
    ...hubItems.map((item) => `- [${item.name}](${item.url}): ${item.description}`),
    "",
    "### صنایع سایت فوری (FastWeb)",
    "",
    ...fastweb.map(
      (i) =>
        `- [${i.primaryKeyword}](${canonicalUrl(`/fastweb/${i.slug}`)}): ${i.secondaryKeywords[0] ?? i.name}`,
    ),
    "",
    "## لینک‌های مرتبط",
    "",
    `- [سئو سایت](${canonicalUrl("/seo")})`,
    `- [چک‌لیست سفارش طراحی سایت](${canonicalUrl("/blog/website-design-order-checklist")})`,
    `- [تبدیل پیج اینستاگرام به سایت](${canonicalUrl("/blog/instagram-page-to-website")})`,
    `- [هوش مصنوعی آرایه](${canonicalUrl("/ai")})`,
    "",
  ];

  return lines.join("\n");
}

export function buildPricingMarkdown(): string {
  const lines: string[] = [
    `# Pricing — طراحی سایت ${SITE_NAME}`,
    "",
    `Last updated: ${WEBSITE_PRICING_UPDATED_AT}`,
    `Human-readable page: ${canonicalUrl("/website-design/cost")}`,
    `Currency: IRR (تومان)`,
    "",
    "Prices below are starting estimates («شروع از»). Final quote depends on pages, features, and content readiness.",
    "",
    "## FastWeb — سایت فوری",
    "",
    `### ${FASTWEB_PACKAGES.fast.name}`,
    `- Price: ${tomanLine(FASTWEB_PACKAGES.fast.priceToman)}`,
    `- Limits: تا ${FASTWEB_PACKAGES.fast.maxPages} صفحه، ${FASTWEB_PACKAGES.fast.revisions} مرحله اصلاح`,
    `- Timeline: نسخه اول در ۲۴ ساعت کاری پس از تکمیل اطلاعات`,
    `- Features:`,
    ...FASTWEB_PACKAGES.fast.features.map((f) => `  - ${f}`),
    "",
    `### ${FASTWEB_PACKAGES.plus.name}`,
    `- Price: ${tomanLine(FASTWEB_PACKAGES.plus.priceToman)}`,
    `- Limits: تا ${FASTWEB_PACKAGES.plus.maxPages} صفحه، ${FASTWEB_PACKAGES.plus.revisions} مرحله اصلاح`,
    `- Features:`,
    ...FASTWEB_PACKAGES.plus.features.map((f) => `  - ${f}`),
    "",
    `CTA: ${canonicalUrl("/fastweb/new")}`,
    "",
    "## Custom website design — طراحی اختصاصی",
    "",
  ];

  for (const plan of websiteDesignPricingPlans) {
    lines.push(`### ${plan.title}`);
    lines.push(`- Price from: ${tomanLine(plan.priceFrom)}`);
    lines.push(`- Audience: ${plan.audience}`);
    lines.push(`- Timeline: ${plan.timeline}`);
    lines.push(`- Revisions: ${plan.revisions}`);
    lines.push(`- Support: ${plan.support}`);
    lines.push("- Features:");
    for (const f of plan.features) lines.push(`  - ${f}`);
    lines.push("");
  }

  lines.push("CTA: " + canonicalUrl("/website-design#website-design-lead-form"));
  lines.push("");
  lines.push("## Commercial comparison offers");
  lines.push("");

  for (const offer of WEBSITE_PRICING_OFFERS) {
    lines.push(`### ${offer.title}`);
    lines.push(`- Path: ${offer.path}`);
    lines.push(`- Price from: ${tomanLine(offer.priceFromToman)}`);
    lines.push(`- Scope: ${offer.scope}`);
    lines.push(`- Timeline: ${offer.timeline}`);
    lines.push(`- CTA: ${canonicalUrl(offer.ctaHref)}`);
    lines.push("");
  }

  lines.push("## Notes");
  lines.push("");
  lines.push("- Domain and annual hosting are usually billed separately.");
  lines.push("- Ongoing SEO / content production is a separate service.");
  lines.push(`- FastWeb start price constant: ${FASTWEB_START_PRICE_TOMAN}`);
  lines.push(`- FastWeb plus price constant: ${FASTWEB_PLUS_PRICE_TOMAN}`);
  lines.push("");

  return lines.join("\n");
}
