import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QrHero from "@/components/qr/QrHero";
import QrTool from "@/components/qr/QrTool";
import QrFeatures from "@/components/qr/QrFeatures";
import QrFaq from "@/components/qr/QrFaq";
import ToolHubLinks from "@/components/tools/ToolHubLinks";
import ToolHubIndex from "@/components/tools/ToolHubIndex";
import { qrFaq } from "@/lib/qrData";
import { getPublishedToolPages } from "@/lib/tools/toolRegistry";
import { buildToolHubJsonLd } from "@/lib/tools/toolSeo";

export const metadata: Metadata = {
  title: "ساخت QR کد رایگان | تولید QR از لینک و متن — آرایه",
  description:
    "QR کد رایگان بساز — از هر لینک، متن، شماره یا آدرس. آماده دانلود و پرینت. بدون نصب اپ، بدون ثبت‌نام.",
  alternates: { canonical: "/qr" },
  openGraph: {
    title: "ساخت QR کد رایگان — آرایه",
    description: "از هر لینک یا متنی، QR کد آماده دانلود بساز. رایگان.",
    url: "/qr",
    type: "website",
    locale: "fa_IR",
  },
};

export default function QrPage() {
  const children = getPublishedToolPages("qr");
  const jsonLd = buildToolHubJsonLd({
    hub: "qr",
    name: "ساخت QR کد رایگان آرایه",
    description:
      "ساخت QR کد رایگان از لینک، متن، وای‌فای و بیشتر — آماده دانلود و پرینت.",
    faqs: qrFaq,
    children,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="tool-page">
        <QrHero />
        <QrTool />
        <QrFeatures />
        <ToolHubIndex
          hub="qr"
          title="QR برای چه پلتفرم‌هایی؟"
          subtitle="راهنماهای ساخت QR برای اینستاگرام، واتساپ، منو، وای‌فای و بیشتر"
        />
        <QrFaq />
        <ToolHubLinks current="/qr" />
      </main>
      <Footer />
    </>
  );
}
