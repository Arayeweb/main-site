import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import DoctorDemoLanding from "@/components/doctors/demo/DoctorDemoLanding";
import {
  doctorDemoKeys,
  getDoctorDemo,
  type DoctorDemoKey,
} from "@/lib/doctorsDemoData";

type PageProps = {
  params: { key: string };
};

export function generateStaticParams() {
  return doctorDemoKeys.map((key) => ({ key }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const content = getDoctorDemo(params.key);
  if (!content) {
    return { title: "نمونه یافت نشد" };
  }

  return {
    title: `نمونه لندینگ ${content.practiceName} | آرایه`,
    description: `نمونه لندینگ یک‌صفحه‌ای مطب ${content.practiceName} — دموی آرایه برای پزشکان.`,
    robots: { index: false, follow: false },
  };
}

export default function DoctorDemoPage({ params }: PageProps) {
  const content = getDoctorDemo(params.key);
  if (!content) {
    notFound();
  }

  return (
    <>
      <DoctorDemoLanding content={content} />
      <Footer />
    </>
  );
}

export type { DoctorDemoKey };
