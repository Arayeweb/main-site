export default function QrHero() {
  return (
    <section className="border-b border-navy-300 pb-20 pt-12 sm:pb-24 sm:pt-16">
      <div className="container-mx container-px tool-reveal">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <p className="tool-kicker">ابزار ۰۲ / ساخت QR</p>
            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.18] text-navy-950 sm:text-6xl lg:text-7xl">
              لینک را به یک نشانه
              <span className="block text-brand-700">قابل اسکن تبدیل کنید.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-navy-600">
              لینک یا متن را وارد کنید؛ پیش‌نمایش همان لحظه ظاهر می‌شود و فایل آماده چاپ را
              دانلود می‌کنید.
            </p>
          </div>
          <aside className="border-r-2 border-brand-600 pr-5 text-sm leading-7 text-navy-600">
            <p className="font-extrabold text-navy-900">۰ تومان — بدون ثبت‌نام و واترمارک</p>
            <p className="mt-2">یک ورودی · نتیجه فوری · فایل PNG قابل دانلود</p>
            <a href="#tool" className="mt-5 inline-flex font-extrabold text-brand-700 hover:underline">
              رفتن به ابزار ←
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
