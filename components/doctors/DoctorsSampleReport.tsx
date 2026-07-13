import DoctorsReportPreview from "@/components/doctors/DoctorsReportPreview";
import SectionHeader from "@/components/home/SectionHeader";

export default function DoctorsSampleReport() {
  return (
    <section id="sample-report" className="section-py scroll-mt-24 bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="نمونه خروجی"
          badgeClassName="bg-sky-50 text-sky-700"
          title="گزارشی که بعد از بررسی دریافت می‌کنید"
          subtitle="وضعیت حضور در گوگل، کامل بودن اطلاعات، صفحه خدمات و مسیر نوبت — به‌همراه سه پیشنهاد عملی."
        />
        <DoctorsReportPreview />
      </div>
    </section>
  );
}
