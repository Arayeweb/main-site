import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BizcardHero from "@/components/bizcard/BizcardHero";
import BizcardBuilder from "@/components/bizcard/BizcardBuilder";
import BizcardSteps from "@/components/bizcard/BizcardSteps";
import BizcardFeatures from "@/components/bizcard/BizcardFeatures";
import BizcardTestimonials from "@/components/bizcard/BizcardTestimonials";
import BizcardFaq from "@/components/bizcard/BizcardFaq";
import BizcardFinalCta from "@/components/bizcard/BizcardFinalCta";
import BizcardFomoToast from "@/components/bizcard/BizcardFomoToast";
import BizcardStickyCta from "@/components/bizcard/BizcardStickyCta";
import ToolHubLinks from "@/components/tools/ToolHubLinks";
import ToolHubIndex from "@/components/tools/ToolHubIndex";
import { bizcardFaq } from "@/lib/bizcardData";
import { getPublishedToolPages } from "@/lib/tools/toolRegistry";
import { buildToolHubJsonLd } from "@/lib/tools/toolSeo";

export const metadata: Metadata = {
  title: "کارت ویزیت دیجیتال رایگان | لینک اختصاصی + QR کد — آرایه",
  description:
    "کارت ویزیت دیجیتال رایگان بساز — لینک اختصاصی، QR کد، نقشه، تماس و شبکه‌های اجتماعی. برای هر کسب‌وکاری. بدون نصب اپ.",
  alternates: { canonical: "/bizcard" },
  openGraph: {
    title: "کارت ویزیت دیجیتال رایگان — آرایه",
    description: "لینک اختصاصی، QR کد، نقشه و شبکه‌های اجتماعی در یک صفحه. رایگان، همیشه.",
    url: "/bizcard",
    type: "website",
    locale: "fa_IR",
  },
};

export default function BizcardPage() {
  const children = getPublishedToolPages("bizcard");
  const jsonLd = buildToolHubJsonLd({
    hub: "bizcard",
    name: "کارت ویزیت دیجیتال رایگان آرایه",
    description:
      "ساخت کارت ویزیت دیجیتال رایگان با لینک اختصاصی، QR کد، نقشه و شبکه‌های اجتماعی.",
    faqs: bizcardFaq,
    children,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="pb-20 sm:pb-0">
        <BizcardHero countLabel="۵۰۰+" />
        <BizcardBuilder />
        <BizcardSteps />
        <BizcardFeatures />
        <BizcardTestimonials />
        <ToolHubIndex
          hub="bizcard"
          title="برای چه کسب‌وکارهایی؟"
          subtitle="کارت ویزیت دیجیتال مخصوص رستوران، پزشک، وکیل، آرایشگاه و بیشتر"
        />
        <BizcardFaq />
        <BizcardFinalCta />
        <ToolHubLinks current="/bizcard" />
      </main>
      <Footer />
      <BizcardStickyCta />
      <BizcardFomoToast />
    </>
  );
}
