export default function QrHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-brand-50/30 to-slate-50 pb-8 pt-14 sm:pb-10 sm:pt-20">
      <div className="container-mx container-px text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-600">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          رایگان — بدون نصب اپ
        </span>
        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl lg:text-[2.75rem]">
          از هر لینک یا متنی،{" "}
          <span className="bg-gradient-to-l from-brand-600 to-brand-400 bg-clip-text text-transparent">
            QR کد
          </span>{" "}
          بساز
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-navy-500 sm:text-base">
          آدرس سایت، شماره تماس، متن یا لینک کارت ویزیت را وارد کنید و QR کد آماده
          پرینت را دانلود کنید.
        </p>
      </div>
    </section>
  );
}
