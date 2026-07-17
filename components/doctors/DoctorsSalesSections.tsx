import type { DoctorFaqItem } from "@/lib/doctorsData";
import { doctorFaq } from "@/lib/doctorsData";
import DoctorsComparison from "@/components/doctors/DoctorsComparison";
import DoctorsFaq from "@/components/doctors/DoctorsFaq";
import DoctorsLossAversion from "@/components/doctors/DoctorsLossAversion";
import DoctorsOfferStack from "@/components/doctors/DoctorsOfferStack";
import DoctorsPatientJourney from "@/components/doctors/DoctorsPatientJourney";
import DoctorsProcess from "@/components/doctors/DoctorsProcess";
import DoctorsReviews from "@/components/doctors/DoctorsReviews";
import DoctorsRiskReduction from "@/components/doctors/DoctorsRiskReduction";
import DoctorsRoiCalculator from "@/components/doctors/DoctorsRoiCalculator";
import DoctorsSalesForm from "@/components/doctors/DoctorsSalesForm";
import DoctorsSeoContent from "@/components/doctors/DoctorsSeoContent";
import DoctorsSpecialtyNeeds from "@/components/doctors/DoctorsSpecialtyNeeds";
import DoctorsSpecialtySamples from "@/components/doctors/DoctorsSpecialtySamples";

type DoctorsSalesSectionsProps = {
  specialtyFilterKeys?: string[];
  faqItems?: DoctorFaqItem[];
  faqTitle?: string;
};

export default function DoctorsSalesSections({
  specialtyFilterKeys,
  faqItems = doctorFaq,
  faqTitle,
}: DoctorsSalesSectionsProps) {
  return (
    <>
      <DoctorsLossAversion />
      <DoctorsReviews />
      <DoctorsSpecialtySamples filterKeys={specialtyFilterKeys} />
      <DoctorsPatientJourney />
      <DoctorsSpecialtyNeeds />
      <DoctorsOfferStack />
      <DoctorsComparison />
      <DoctorsRoiCalculator />
      <DoctorsRiskReduction />
      <DoctorsProcess />
      <DoctorsSalesForm />
      <DoctorsFaq items={faqItems} title={faqTitle ?? "پاسخ اعتراض‌ها و سؤال‌های رایج"} />
      <DoctorsSeoContent />
    </>
  );
}
