import { LEAD_FORM_ID, PORTFOLIO_SECTION_ID } from "@/data/website-design";

export default function WebsiteDesignFinalCta() {
  return (
    <section className="section-py bg-navy-900 text-white">
      <div className="container-mx container-px text-center">
        <h2 className="mx-auto max-w-2xl text-2xl font-extrabold leading-snug sm:text-3xl">
          سایت بعدی شما باید بخشی از سیستم فروش باشد
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-navy-200 sm:text-base">
          برای طراحی سایتی که اعتماد بسازد، مشتری جذب کند و همراه کسب‌وکار رشد کند، درخواست
          خود را ثبت کنید.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`#${LEAD_FORM_ID}`}
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy-900 transition-all duration-200 hover:bg-navy-50 active:scale-[0.98]"
          >
            ثبت درخواست طراحی سایت
          </a>
          <a
            href={`#${PORTFOLIO_SECTION_ID}`}
            className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            مشاهده نمونه‌کارها
          </a>
        </div>
      </div>
    </section>
  );
}
