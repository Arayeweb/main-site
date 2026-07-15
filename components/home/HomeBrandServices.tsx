import Link from "next/link";

const services = [
  {
    href: "/website-design",
    title: "طراحی سایت",
    description:
      "سایت شرکتی و خدماتی با مسیر تماس مشخص؛ تا بازدیدکننده سریع خدمات شما را بفهمد و درخواست بدهد.",
  },
  {
    href: "/seo",
    title: "خدمات سئو",
    description:
      "از تحقیق کلمات کلیدی تا سئوی فنی و محلی؛ تا وقتی مشتری در گوگل جست‌وجو می‌کند شما را پیدا کند.",
  },
  {
    href: "/contact",
    title: "توسعه نرم‌افزار اختصاصی",
    description:
      "وب‌اپلیکیشن، پنل مدیریتی، CRM و ابزارهای اختصاصی متناسب با فرایند واقعی کسب‌وکار شما.",
  },
  {
    href: "/ai",
    title: "راهکارهای هوش مصنوعی",
    description:
      "دسترسی ساده‌تر به چند مدل هوش مصنوعی و ابزارهایی که کارهای روزمره را سریع‌تر پیش می‌برند.",
  },
] as const;

export default function HomeBrandServices() {
  return (
    <section id="services" className="border-y border-navy-100/80 bg-white py-14 sm:py-16">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-teal-700">خدمات اصلی شرکت آرایه</p>
          <h2 className="mt-2 text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl">
            طراحی سایت، سئو، نرم‌افزار و هوش مصنوعی
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-navy-500 sm:text-base">
            شرکت آرایه این چهار حوزه را کنار هم نگه می‌دارد تا دیده‌شدن، جذب مشتری و عملیات
            دیجیتال در یک مسیر بمانند.
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
