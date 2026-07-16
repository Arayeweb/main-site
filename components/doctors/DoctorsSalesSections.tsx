import type { DoctorFaqItem } from "@/lib/doctorsData";
import { doctorFaq } from "@/lib/doctorsData";
import DoctorsAuditTeaser from "@/components/doctors/DoctorsAuditTeaser";
import DoctorsCaseStudy from "@/components/doctors/DoctorsCaseStudy";
import DoctorsFaq from "@/components/doctors/DoctorsFaq";
import DoctorsFinalCta from "@/components/doctors/DoctorsFinalCta";
import DoctorsPackageDetails from "@/components/doctors/DoctorsPackageDetails";
import DoctorsPricing from "@/components/doctors/DoctorsPricing";
import DoctorsProcess from "@/components/doctors/DoctorsProcess";
import DoctorsSpecialtySamples from "@/components/doctors/DoctorsSpecialtySamples";

type DoctorsSalesSectionsProps = {
  specialtyFilterKeys?: string[];
  showCaseStudy?: boolean;
  faqItems?: DoctorFaqItem[];
  faqTitle?: string;
};

export default function DoctorsSalesSections({
  specialtyFilterKeys,
  showCaseStudy = true,
  faqItems = doctorFaq,
  faqTitle,
}: DoctorsSalesSectionsProps) {
  return (
    <>
      <DoctorsSpecialtySamples filterKeys={specialtyFilterKeys} />
      <DoctorsPackageDetails />
      {showCaseStudy ? <DoctorsCaseStudy /> : null}
      <DoctorsPricing />
      <DoctorsProcess />
      <DoctorsAuditTeaser />
      <DoctorsFaq items={faqItems} title={faqTitle} />
      <DoctorsFinalCta />
    </>
  );
}
