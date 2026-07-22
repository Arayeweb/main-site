export default function DoctorsSpecialtySection() {
  return (
    <section id="doctors" className="bg-[#f0faf8]">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-6 lg:px-8">
        <div className="flex min-h-[200px] items-center justify-center py-10 lg:min-h-[220px] lg:py-12">
          <div className="max-w-xl text-center lg:text-right">
            <p className="text-xs font-semibold text-teal-700">راهکار تخصصی</p>
            <h2 className="mt-2 text-lg font-extrabold leading-snug tracking-tight text-navy-900 sm:text-xl">
              تجربه‌ای متناسب با نیاز پزشکان و کلینیک‌ها
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-navy-500">
              از دیده‌شدن در گوگل و معرفی تخصص تا اعتماد بیمار و درخواست نوبت؛ همه در یک مسیر
              ساده و حرفه‌ای.
            </p>
            <a
              href="/doctors"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-800"
            >
              مشاهده راهکار پزشکان
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
