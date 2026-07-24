const STEPS = [
  {
    n: "۱",
    title: "انتخاب پکیج و ثبت درخواست",
    description: "پکیج را انتخاب کنید، کد تخفیف را بزنید و فرم کوتاه را پر کنید — بدون پرداخت.",
  },
  {
    n: "۲",
    title: "تماس کارشناس",
    description: "کارشناسان آرایه با شما تماس می‌گیرند، جزئیات را تأیید و مسیر پرداخت را هماهنگ می‌کنند.",
  },
  {
    n: "۳",
    title: "راه‌اندازی و تحویل",
    description: "حضور شما در نقشه‌ها راه‌اندازی می‌شود و خروجی نهایی تحویل داده می‌شود.",
  },
] as const;

export default function GooglesabtTimeline() {
  return (
    <section
      className="bg-white py-20 sm:py-28"
      aria-labelledby="googlesabt-timeline-heading"
    >
      <div className="container-mx container-px">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="googlesabt-timeline-heading"
            className="text-2xl font-extrabold leading-snug text-navy-900 sm:text-3xl lg:text-[2.1rem]"
          >
            شروع کار فقط در ۳ مرحله
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-navy-500 sm:text-base">
            ما تمام مراحل را برای شما انجام می‌دهیم.
          </p>
        </header>

        {/* Desktop: horizontal */}
        <ol className="relative mx-auto mt-16 hidden max-w-5xl lg:grid lg:grid-cols-3 lg:gap-8">
          <li
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[16%] top-7 h-px bg-gradient-to-l from-transparent via-navy-200 to-transparent"
          />
          {STEPS.map((step) => (
            <li key={step.n} className="relative text-center">
              <span className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-navy-100 bg-white text-lg font-extrabold text-[#4285F4] shadow-[0_8px_24px_rgba(16,42,67,0.06)]">
                {step.n}
              </span>
              <h3 className="mt-6 text-base font-extrabold text-navy-900">{step.title}</h3>
              <p className="mx-auto mt-2.5 max-w-[26ch] text-[13px] leading-relaxed text-navy-500 sm:text-[14px]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        {/* Mobile / tablet: vertical */}
        <ol className="relative mx-auto mt-14 max-w-md space-y-0 lg:hidden">
          <span
            aria-hidden="true"
            className="absolute bottom-4 top-4 right-[1.375rem] w-px bg-gradient-to-b from-navy-200 via-navy-200 to-transparent"
          />
          {STEPS.map((step) => (
            <li key={step.n} className="relative flex gap-5 pb-10 last:pb-0">
              <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-navy-100 bg-white text-sm font-extrabold text-[#4285F4] shadow-[0_6px_18px_rgba(16,42,67,0.06)]">
                {step.n}
              </span>
              <div className="pt-1.5">
                <h3 className="text-[15px] font-extrabold text-navy-900">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-500">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
