"use client";

import { useEffect, useRef } from "react";
import DoctorsReportPreview from "@/components/doctors/DoctorsReportPreview";
import SectionHeader from "@/components/home/SectionHeader";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";

export default function DoctorsSampleReport() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !trackedRef.current) {
          trackedRef.current = true;
          trackDoctorsEvent("doctors_sample_report_view", { source: "section" });
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="sample-report"
      ref={sectionRef}
      className="section-py scroll-mt-24 bg-navy-50/40"
    >
      <div className="container-mx container-px">
        <SectionHeader
          badge="نمونه خروجی"
          badgeClassName="bg-sky-50 text-sky-700"
          title="قبل از ثبت درخواست، نمونه خروجی را ببینید"
          subtitle="گزارش فقط فهرست ایرادها نیست؛ مشکل اصلی، اولویت اصلاح و مسیر پیشنهادی را مشخص می‌کند."
        />
        <DoctorsReportPreview />
      </div>
    </section>
  );
}
