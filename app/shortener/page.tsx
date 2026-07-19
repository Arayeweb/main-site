import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShortenerHero from "@/components/shortener/ShortenerHero";
import ShortenerTool from "@/components/shortener/ShortenerTool";
import ShortenerFeatures from "@/components/shortener/ShortenerFeatures";
import ShortenerFaq from "@/components/shortener/ShortenerFaq";
import ToolHubLinks from "@/components/tools/ToolHubLinks";
import ToolHubIndex from "@/components/tools/ToolHubIndex";
import { shortenerFaq } from "@/lib/shortenerData";
import { getPublishedToolPages } from "@/lib/tools/toolRegistry";
import { buildToolHubJsonLd } from "@/lib/tools/toolSeo";

export const metadata: Metadata = {
  title: "کوتاه‌کننده لینک رایگان | ساخت لینک کوتاه + QR — آرایه",
  description:
    "لینک‌های بلند را رایگان کوتاه کنید — آدرس کوتاه و حرفه‌ای با QR کد. مناسب اینستاگرام، واتساپ و تبلیغات. بدون نصب اپ.",
  alternates: { canonical: "/shortener" },
  openGraph: {
    title: "کوتاه‌کننده لینک رایگان — آرایه",
    description: "لینک بلند را به آدرس کوتاه و حرفه‌ای با QR تبدیل کنید. رایگان.",
    url: "/shortener",
    type: "website",
    locale: "fa_IR",
  },
};

export default function ShortenerPage() {
  const children = getPublishedToolPages("shortener");
  const jsonLd = buildToolHubJsonLd({
    hub: "shortener",
    name: "کوتاه‌کننده لینک رایگان آرایه",
    description:
      "ساخت لینک کوتاه رایگان با آدرس دلخواه و QR کد — مناسب شبکه‌های اجتماعی و تبلیغات.",
    faqs: shortenerFaq,
    children,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <ShortenerHero />
        <ShortenerTool />
        <ShortenerFeatures />
        <ToolHubIndex
          hub="shortener"
          title="لینک کوتاه برای چه کانال‌هایی؟"
          subtitle="صفحات راهنما برای اینستاگرام، واتساپ، کمپین و بیشتر"
        />
        <ShortenerFaq />
        <ToolHubLinks current="/shortener" />
      </main>
      <Footer />
    </>
  );
}
