import CtaLink from "./home/CtaLink";

export default function CTA() {
  return (
    <section id="cta" className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900 px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 right-1/4 h-60 w-60 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="absolute -bottom-20 left-1/4 h-60 w-60 rounded-full bg-brand-400/15 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl text-balance leading-tight">
              مشاوره رایگان ۳۰ دقیقه‌ای برای پروژه شما
            </h2>
            <p className="mt-5 text-base text-navy-200 sm:text-lg leading-relaxed">
              نیاز شما را بررسی می‌کنیم و مسیر مناسب برای طراحی، توسعه یا اتوماسیون را پیشنهاد
              می‌دهیم.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <CtaLink
                href="tel:02128426699"
                location="cta_primary"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-navy-900 transition-all duration-200 hover:bg-navy-50 hover:shadow-glow active:scale-[0.98]"
              >
                تماس برای مشاوره رایگان
              </CtaLink>
              <CtaLink
                href="#services"
                location="cta_secondary"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-white/10 active:scale-[0.98]"
              >
                مشاهده خدمات
              </CtaLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
