import Link from "next/link";

export default function BizcardFinalCta() {
  return (
    <section className="tool-section-compact">
      <div className="container-mx container-px">
        <div className="grid gap-8 border-y border-navy-400 py-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="tool-kicker">قدم بعدی</p>
            <h2 className="mt-4 text-2xl font-extrabold text-navy-950 sm:text-3xl">
              لینک کسب‌وکارتان را همین حالا بسازید.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-navy-600">
              رایگان، فوری، بدون ثبت‌نام. برای دیده‌شدن روی نقشه‌ها نیز می‌توانید مسیر
              حرفه‌ای را انتخاب کنید.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#builder"
              className="bg-navy-950 px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              ساخت کارت رایگان
            </a>
            <Link
              href="/googlesabt?from=bizcard&package=popular#packages"
              className="border-b border-navy-400 px-2 py-3 text-sm font-bold text-navy-700 transition hover:border-brand-600 hover:text-brand-700"
            >
              ثبت در گوگل + لینک کامل
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
