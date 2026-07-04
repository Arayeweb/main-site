import Footer from "@/components/Footer";
import { demoPackages, demoSites, type DemoPackageKey, type SpecialtyKey } from "@/lib/demoData";
import { accentConfig } from "./accentConfig";
import DemoNavbar from "./DemoNavbar";
import DemoHero from "./DemoHero";
import PackageNoteBanner from "./PackageNoteBanner";
import AboutDoctorSection from "./AboutDoctorSection";
import ServicesSection from "./ServicesSection";
import TestimonialsSection from "./TestimonialsSection";
import DemoFaqSection from "./DemoFaqSection";
import DemoGuarantee from "./DemoGuarantee";
import PricingCtaSection from "./PricingCtaSection";
import DemoBottomBanner from "./DemoBottomBanner";
import DemoExitIntent from "./DemoExitIntent";
import DemoChatWidget from "./DemoChatWidget";
import RevealSection from "./RevealSection";
import { IconArrowLeft } from "@/components/icons";

const validPackageKeys: DemoPackageKey[] = ["basic", "growth", "premium"];

export default function DemoSitePage({
  specialty,
  packageParam,
}: {
  specialty: SpecialtyKey;
  packageParam?: string;
}) {
  const content = demoSites[specialty];
  const accent = accentConfig[specialty];
  const selectedPackage = validPackageKeys.includes(packageParam as DemoPackageKey)
    ? (packageParam as DemoPackageKey)
    : null;
  const selectedPkgData = selectedPackage ? demoPackages.find((p) => p.key === selectedPackage) ?? null : null;

  return (
    <>
      <DemoExitIntent specialty={specialty} specialtyLabel={content.practiceName} packageKey={selectedPackage} />
      <DemoChatWidget specialty={specialty} accent={accent} faq={content.faq} />
      <DemoNavbar practiceName={content.practiceName} accentClass={accent.text} />
      <main>
        <DemoHero content={content} accent={accent} />
        {selectedPkgData && selectedPkgData.key !== "premium" ? (
          <PackageNoteBanner pkg={selectedPkgData} accent={accent} />
        ) : null}
        <AboutDoctorSection content={content} accent={accent} />
        <ServicesSection content={content} accent={accent} />
        <TestimonialsSection content={content} accent={accent} />
        <DemoFaqSection items={content.faq} badgeClassName={`${accent.badgeBg} ${accent.badgeText}`} />
        <DemoGuarantee />
        <PricingCtaSection
          specialty={specialty}
          specialtyLabel={content.practiceName}
          title={content.finalCtaTitle}
          subtitle={content.finalCtaSubtitle}
          selectedPackage={selectedPackage}
          accent={accent}
        />
        <DemoBottomBanner practiceName={content.practiceName} accent={accent} />

        <div className="border-t border-navy-100 bg-white py-10">
          <div className="container-mx container-px">
            <RevealSection>
              <a
                href="/demo"
                className="mx-auto flex w-fit items-center gap-2 text-sm font-bold text-navy-500 transition-colors hover:text-navy-800"
              >
                مشاهده نمونه‌سایت‌های سایر تخصص‌ها
                <IconArrowLeft size={15} />
              </a>
            </RevealSection>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
