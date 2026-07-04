import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import PublicOnlyChrome from "@/components/PublicOnlyChrome";
import SitePageviewTracker from "@/components/analytics/SitePageviewTracker";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://arayeweb.com"),
  title: {
    default: "آرایه | توسعه نرم‌افزار اختصاصی، وب‌اپلیکیشن و هوش مصنوعی",
    template: "%s | آرایه",
  },
  description:
    "آرایه شرکت توسعه نرم‌افزار است؛ سایت، وب‌اپلیکیشن، CRM، داشبورد، چت‌بات هوشمند و ابزارهای اختصاصی برای کسب‌وکارها می‌سازد.",
  keywords: [
    "توسعه نرم‌افزار",
    "طراحی سایت",
    "وب‌اپلیکیشن",
    "CRM",
    "داشبورد",
    "چت‌بات هوشمند",
    "هوش مصنوعی",
    "اتوماسیون",
    "آرایه",
  ],
  alternates: {
    canonical: "https://arayeweb.com",
  },
  openGraph: {
    title: "آرایه | توسعه نرم‌افزار اختصاصی، وب‌اپلیکیشن و هوش مصنوعی",
    description:
      "آرایه به شرکت‌ها کمک می‌کند سایت، وب‌اپلیکیشن، پنل مدیریتی، CRM، چت‌بات هوشمند و ابزارهای اختصاصی بسازند.",
    type: "website",
    url: "https://arayeweb.com",
    locale: "fa_IR",
    siteName: "آرایه",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "آرایه — توسعه نرم‌افزار اختصاصی",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "آرایه | توسعه نرم‌افزار اختصاصی، وب‌اپلیکیشن و هوش مصنوعی",
    description:
      "آرایه به شرکت‌ها کمک می‌کند سایت، وب‌اپلیکیشن، پنل مدیریتی، CRM، چت‌بات هوشمند و ابزارهای اختصاصی بسازند.",
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
  return (
    <html lang="fa" dir="rtl">
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
