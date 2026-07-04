import Link from "next/link";

export default function BizcardFinalCta() {
  return (
    <section className="section-py">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-l from-brand-600 to-brand-500 px-8 py-12 text-center text-white shadow-card">
          <h2 className="text-2xl font-extrabold sm:text-3xl">همین الان کارت ویزیتت را بساز</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/90">
            رایگان، فوری، بدون ثبت‌نام. یا برای ثبت حرفه‌ای در گوگل‌مپ، پکیج محبوب را ببین.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#builder"
              className="rounded-xl bg-white px-7 py-3 text-sm font-bold text-brand-700 shadow-soft transition hover:bg-brand-50"
            >
              ساخت کارت رایگان
            </a>
            <Link
              href="/googlesabt?from=bizcard&package=popular#packages"
              className="rounded-xl border border-white/40 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              ثبت در گوگل + لینک کامل
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
