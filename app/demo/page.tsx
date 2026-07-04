import type { Metadata } from "next";
import Footer from "@/components/Footer";
import DemoPickerNavbar from "@/components/demo/DemoPickerNavbar";
import DemoFlow from "@/components/demo/DemoFlow";
import WhyAraayeSection from "@/components/demo/WhyAraayeSection";
import RevealSection from "@/components/demo/RevealSection";
import { IconCheck } from "@/components/icons";

export const metadata: Metadata = {
  title: "دمو سایت اختصاصی برای مطب و کلینیک شما | آرایه",
  description:
    "پکیج مناسب مطب یا کلینیک خود را انتخاب کنید و یک نمونه‌سایت واقعی و کامل، دقیقاً مثل چیزی که آرایه برایتان می‌سازد، ببینید.",
  robots: { index: false, follow: false },
};

const trustPills = ["بدون تعهد و رایگان", "طراحی اختصاصی برای مطب شما", "پشتیبانی بعد از تحویل"];

export default function DemoLandingPage() {
  return (
    <>
      <DemoPickerNavbar />
      <main className="pb-16">
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-white pt-14 pb-14 sm:pt-20 sm:pb-20">
          <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-brand-200/30 blur-3xl" />
          <div className="pointer-events-none absolute top-40 -left-20 h-64 w-64 rounded-full bg-violet-200/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 -z-10 grid-pattern opacity-40" />

          <div className="container-mx container-px relative text-center">
            <RevealSection>
              <span className="badge mb-5 bg-brand-50 text-brand-600">دمو اختصاصی آرایه برای پزشکان</span>

              <h1 className="mx-auto max-w-2xl text-balance text-3xl font-extrabold leading-[1.3] text-navy-900 sm:text-4xl lg:text-5xl">
                سایتی که{" "}
                <em className="not-italic hero-accent">بیماران بیشتری</em> برای شما می‌آورد
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-navy-500 sm:text-lg">
                تخصص مطب‌تان را انتخاب کنید و در چند ثانیه یک نمونه‌سایت واقعی و کامل —
                دقیقاً مثل چیزی که برای شما خواهیم ساخت — را ببینید. قیمت‌ها هر وقت خواستید، بدون عجله.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                {trustPills.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-navy-600 shadow-soft backdrop-blur"
                  >
                    <IconCheck size={13} className="text-brand-600" />
                    {pill}
                  </span>
                ))}
              </div>
            </RevealSection>
          </div>
        </section>

        <section className="section-py pt-0">
          <div className="container-mx container-px">
            <DemoFlow />
          </div>
        </section>

        <WhyAraayeSection />
      </main>
      <Footer />
    </>
  );
}
