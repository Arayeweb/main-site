import DoctorsWhatsAppCta from "@/components/doctors/DoctorsWhatsAppCta";

export default function DoctorsFinalCta() {
  return (
    <section id="final-cta" className="pb-20 sm:pb-28">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-xl rounded-3xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-8 text-center shadow-soft sm:p-10">
          <h2 className="text-xl font-extrabold text-navy-900 sm:text-2xl">آماده شروع سفارش سایت مطب هستید؟</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy-500">
            در واتساپ تخصص و شهر فعالیتتان را بفرستید تا نمونه نزدیک و مراحل شروع را دریافت کنید.
          </p>

          <DoctorsWhatsAppCta
            source="final_section"
            fullWidth
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98] sm:w-auto sm:min-w-[260px]"
          >
            شروع سفارش در واتساپ
          </DoctorsWhatsAppCta>
        </div>
      </div>
    </section>
  );
}
