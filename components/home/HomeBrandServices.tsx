import Link from "next/link";

const services = [
  {
    href: "/website-design",
    title: "طراحی سایت",
    description:
      "وب‌سایتی سریع و معتبر که ارزش کارتان را روشن نشان می‌دهد و بازدیدکننده را به تماس، رزرو یا خرید می‌رساند.",
  },
  {
    href: "/seo",
    title: "خدمات سئو",
    description:
      "ساختار فنی، محتوا و سئوی محلی را بهبود می‌دهیم تا در لحظه جست‌وجوی مشتری، مقابل چشم او باشید.",
  },
  {
    href: "/contact",
    title: "توسعه نرم‌افزار اختصاصی",
    description:
      "وب‌اپلیکیشن، پنل مدیریتی و ابزارهایی می‌سازیم که دقیقاً با فرایند واقعی تیم شما هماهنگ‌اند.",
  },
  {
    href: "/ai",
    title: "راهکارهای هوش مصنوعی",
    description:
      "مدل‌ها و ابزارهای هوش مصنوعی را به کار واقعی وصل می‌کنیم تا تصمیم‌گیری و اجرای کارهای روزمره سریع‌تر شود.",
  },
] as const;

export default function HomeBrandServices() {
  return (
    <section id="services" className="border-y border-navy-100/80 bg-white py-14 sm:py-16">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-teal-700">آنچه برای رشد دیجیتال نیاز دارید</p>
          <h2 className="mt-2 text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl">
            چند خدمت جدا نه؛ یک مسیر هماهنگ برای رشد
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-navy-500 sm:text-base">
            از نقطه‌ای شروع می‌کنیم که بیشترین اثر را برای شما دارد و راهکارها را طوری کنار هم
            می‌چینیم که دیده‌شدن، فروش و عملیات دیجیتال یکدیگر را تقویت کنند.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-[18px] border border-navy-100 bg-navy-50/30 p-5 text-right sm:p-6"
            >
              <h3 className="text-lg font-extrabold text-navy-900">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{service.description}</p>
              <Link
                href={service.href}
                className="mt-4 inline-flex text-sm font-bold text-teal-800 transition hover:text-teal-950"
              >
                بیشتر بدانید
                <span aria-hidden className="mr-1">
                  ←
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
