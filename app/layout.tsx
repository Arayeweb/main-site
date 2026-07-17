import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import PublicOnlyChrome from "@/components/PublicOnlyChrome";
import SitePageviewTracker from "@/components/analytics/SitePageviewTracker";
import { SITE_URL, canonicalUrl } from "@/lib/siteUrl";
import { SITE_NAME, buildHomeSiteGraphJsonLd } from "@/lib/seo/siteIdentity";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "شرکت آرایه | طراحی سایت، سئو و توسعه نرم‌افزار",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "شرکت آرایه ارائه‌دهنده خدمات طراحی سایت، سئو، توسعه نرم‌افزار اختصاصی و ابزارهای هوش مصنوعی برای رشد کسب‌وکارهاست.",
  keywords: [
    "شرکت آرایه",
    "آرایه",
    "شرکت هوش آرایه پارس",
    "طراحی سایت",
    "سئو",
    "توسعه نرم‌افزار",
    "هوش مصنوعی",
    "Araaye",
  ],
  // Do NOT set a root canonical here — it would make every page without its own
  // alternates.canonical self-reference the homepage. Each page/layout sets its own.
  openGraph: {
    title: "شرکت آرایه | طراحی سایت، سئو و توسعه نرم‌افزار",
    description:
      "شرکت آرایه ارائه‌دهنده خدمات طراحی سایت، سئو، توسعه نرم‌افزار اختصاصی و ابزارهای هوش مصنوعی برای رشد کسب‌وکارهاست.",
    type: "website",
    url: canonicalUrl("/"),
    locale: "fa_IR",
    siteName: SITE_NAME,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "شرکت آرایه — طراحی سایت، سئو و نرم‌افزار",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "شرکت آرایه | طراحی سایت، سئو و توسعه نرم‌افزار",
    description:
      "شرکت آرایه ارائه‌دهنده خدمات طراحی سایت، سئو، توسعه نرم‌افزار اختصاصی و ابزارهای هوش مصنوعی برای رشد کسب‌وکارهاست.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logo-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/assets/apple-touch-icon.png",
    shortcut: "/favicon-32.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: SITE_NAME,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a1929",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteIdentityJsonLd = JSON.stringify(buildHomeSiteGraphJsonLd());

  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* Page-level openGraph overrides drop layout siteName — pin it in head for every URL. */}
        <meta property="og:site_name" content={SITE_NAME} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: siteIdentityJsonLd }}
        />
      </head>
      <body className="font-sans antialiased bg-white text-navy-900">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PHW3CH86"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
        <PublicOnlyChrome />
        <SitePageviewTracker />
        <Analytics />
        <SpeedInsights />
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PHW3CH86');`,
          }}
        />
      </body>
    </html>
  );
}
