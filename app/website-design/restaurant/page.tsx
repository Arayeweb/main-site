import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RestaurantHero from "@/components/restaurant/RestaurantHero";
import RestaurantSections from "@/components/restaurant/RestaurantSections";
import RestaurantFaq from "@/components/restaurant/RestaurantFaq";
import RestaurantLeadForm from "@/components/restaurant/RestaurantLeadForm";
import RestaurantStickyCta from "@/components/restaurant/RestaurantStickyCta";
import { restaurantFaq, RESTAURANT_PAGE_PATH } from "@/lib/restaurantData";
import { canonicalUrl } from "@/lib/siteUrl";
import { organizationProviderRef } from "@/lib/seo/siteIdentity";

export const metadata: Metadata = {
  title: { absolute: "طراحی سایت رستوران؛ منوی دیجیتال و سفارش آنلاین | آرایه" },
  description:
    "آرایه برای رستوران و کافه شما سایتی فروش‌ساز می‌سازد: منوی دیجیتال، سفارش آنلاین بدون کمیسیون، رزرو میز، چت‌بات سفارش‌گیری، دامنه، سرور و درگاه پرداخت.",
  alternates: {
    canonical: RESTAURANT_PAGE_PATH,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: "سایت، منوی دیجیتال و سفارش آنلاین برای رستوران‌ها و کافه‌ها | آرایه",
    description:
      "سایت فروش‌ساز رستوران با منوی دیجیتال، سفارش آنلاین بدون کمیسیون، رزرو میز، چت‌بات سفارش‌گیری، دامنه، سرور و درگاه پرداخت.",
    url: RESTAURANT_PAGE_PATH,
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "سایت، منوی دیجیتال و سفارش آنلاین برای رستوران‌ها و کافه‌ها | آرایه",
    description:
      "سایت فروش‌ساز رستوران با سفارش آنلاین مستقیم و بدون کمیسیون، منوی دیجیتال و چت‌بات سفارش‌گیری.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "سایت، منوی دیجیتال و سفارش آنلاین رستوران",
      serviceType: "طراحی وب‌سایت، منوی دیجیتال و سفارش آنلاین برای رستوران و کافه",
      provider: organizationProviderRef(),
      areaServed: { "@type": "Country", name: "Iran" },
      url: canonicalUrl(RESTAURANT_PAGE_PATH),
      description:
        "سایت فروش‌ساز رستوران با منوی دیجیتال، سفارش آنلاین مستقیم و بدون کمیسیون، رزرو میز، چت‌بات سفارش‌گیری و زیرساخت پایدار.",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "آرایه", item: canonicalUrl("/") },
        {
          "@type": "ListItem",
          position: 2,
          name: "طراحی سایت",
          item: canonicalUrl("/website-design"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "رستوران و کافه",
          item: canonicalUrl(RESTAURANT_PAGE_PATH),
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: restaurantFaq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function WebsiteDesignRestaurantPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar ctaLabel="مشاوره رایگان" ctaHref="#leadform" />
      <main className="pb-20 sm:pb-0">
        <RestaurantHero />
        <RestaurantSections />
        <RestaurantFaq />
        <RestaurantLeadForm />
      </main>
      <Footer />
      <RestaurantStickyCta />
    </>
  );
}
