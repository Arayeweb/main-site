import { BrowserChrome } from "./ShowcaseFrames";

type ShivaProps = { full?: boolean };

export function ShivaShowcase({ full = false }: ShivaProps) {
  const content = (
    <div className="bg-[#f4faf9] text-right">
      <header className="flex items-center justify-between border-b border-teal-100/80 bg-white px-5 py-3 sm:px-8">
        <nav className="hidden items-center gap-5 text-[11px] font-semibold text-navy-600 sm:flex">
          <span>خدمات</span>
          <span>تیم درمان</span>
          <span>سوالات متداول</span>
          <span>تماس</span>
        </nav>
        <span className="text-sm font-extrabold text-teal-800 sm:text-base">کلینیک شنوایی شیوا</span>
        <span className="rounded-lg bg-teal-700 px-3 py-1.5 text-[10px] font-bold text-white sm:text-xs">
          درخواست نوبت
        </span>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-bl from-[#0d6b5c] via-teal-600 to-[#14a89a] px-5 py-8 sm:px-8 sm:py-12">
        <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-emerald-200/25 blur-2xl" />
        <div className="relative grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100 sm:text-xs">
              تخصص شنوایی‌سنجی
            </p>
            <h1 className="mt-2 text-xl font-extrabold leading-snug text-white sm:text-2xl lg:text-[2rem]">
              ارزیابی شنوایی و انتخاب سمعک مناسب
            </h1>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-teal-50 sm:text-sm">
              مسیر ساده از مشاوره اولیه تا تنظیم سمعک؛ با تیم متخصص و پیگیری منظم درمان.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-teal-800 sm:text-xs">
                نوبت همان هفته
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:text-xs">
                مشاوره تخصصی
              </span>
            </div>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-white/25 shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#a8e6cf_0%,#56c8b8_35%,#2a9d8f_70%,#1d6f63_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.55),transparent_45%)]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-teal-900/50 to-transparent" />
            <div className="absolute right-4 top-4 rounded-lg bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
              <p className="text-[9px] font-bold text-teal-800">تیم شنوایی‌سنجی</p>
              <p className="text-[8px] text-navy-500">+۱۵ سال تجربه</p>
            </div>
            <div className="absolute bottom-4 right-4 left-4 rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur-sm">
              <p className="text-[10px] font-bold text-teal-800">ارزیابی audiometry</p>
              <p className="mt-0.5 text-[9px] text-navy-500">گزارش وضعیت شنوایی + پیشنهاد سمعک</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 px-5 py-6 sm:grid-cols-3 sm:gap-4 sm:px-8">
        {[
          {
            title: "ارزیابی شنوایی",
            desc: "آزمون دقیق و تفسیر نتایج برای انتخاب مسیر درمان",
          },
          {
            title: "تنظیم و آموزش سمعک",
            desc: "تنظیم فنی سمعک و آموزش استفاده روزانه",
          },
          {
            title: "پیگیری درمان",
            desc: "ویزیت‌های پیگیری برای حفظ کیفیت شنوایی",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-teal-100 bg-white p-4 shadow-sm"
          >
            <div className="h-1 w-8 rounded-full bg-teal-500" />
            <p className="mt-2 text-xs font-extrabold text-teal-800 sm:text-sm">{item.title}</p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-navy-500 sm:text-xs">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {full ? (
        <section className="border-t border-teal-100 bg-white px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-xl rounded-2xl border border-teal-100 bg-teal-50/40 p-6">
            <h2 className="text-lg font-extrabold text-navy-900">درخواست وقت مشاوره</h2>
            <p className="mt-2 text-sm text-navy-500">
              فرم تماس برای هماهنگی نوبت ارزیابی شنوایی
            </p>
            <div className="mt-4 space-y-2">
              {["نام و نام خانوادگی", "شماره موبایل", "زمان ترجیحی"].map((field) => (
                <div
                  key={field}
                  className="rounded-lg border border-navy-100 bg-white px-3 py-2.5 text-sm text-navy-400"
                >
                  {field}
                </div>
              ))}
              <div className="rounded-lg bg-teal-700 py-3 text-center text-sm font-bold text-white">
                ثبت درخواست نوبت
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );

  if (full) {
    return <div className="overflow-hidden rounded-2xl border border-navy-100 shadow-lg">{content}</div>;
  }

  return <BrowserChrome url="clinic-shiva.com">{content}</BrowserChrome>;
}

export function ShivaShowcasePreview({ compact }: { compact?: boolean }) {
  void compact;
  return <ShivaShowcase />;
}
