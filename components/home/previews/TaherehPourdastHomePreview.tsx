export default function TaherehPourdastHomePreview() {
  return (
    <div className="overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-rose-100/80 px-5 py-4">
        <div className="text-right">
          <p className="text-[15px] font-extrabold tracking-tight text-navy-900">دکتر طاهره پوردست</p>
          <p className="mt-0.5 text-[11px] font-medium text-navy-500">متخصص زنان و زایمان · شیراز</p>
        </div>
        <span className="rounded-lg bg-rose-700 px-3 py-1.5 text-[10px] font-bold text-white">
          رزرو نوبت
        </span>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-rose-50 via-white to-navy-50 px-6 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(244,63,94,0.12),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-center text-right">
          <p className="text-[10px] font-bold tracking-[0.14em] text-rose-700">مرکز تخصصی درمان بیماری‌های زنان</p>
          <p className="mt-2 max-w-[18rem] text-lg font-extrabold leading-snug text-navy-900 sm:text-xl">
            درمان تخصصی اندومتریوز و بیماری‌های زنان
          </p>
          <p className="mt-2 max-w-[17rem] text-[11px] leading-relaxed text-navy-500">
            فلوشیپ لاپاراسکوپی پیشرفته زنان · دانشیار دانشگاه علوم پزشکی شیراز
          </p>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <span className="rounded-lg bg-rose-700 px-3 py-1.5 text-[10px] font-bold text-white">
              مشاهده نوبت
            </span>
            <span className="rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-[10px] font-bold text-navy-700">
              تماس با مطب
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-50 px-5 py-4 text-right">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400">Clinic Website</p>
        <p className="mt-1 text-sm font-extrabold text-navy-900">سایت مطب طاهره پوردست</p>
      </div>
    </div>
  );
}
