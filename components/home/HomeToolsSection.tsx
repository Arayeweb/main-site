import Link from "next/link";

const tools = [
  {
    href: "/bizcard",
    title: "کارت ویزیت دیجیتال",
    description:
      "لینک اختصاصی با تماس، نقشه، شبکه‌های اجتماعی و QR — بدون سایت و بدون هزینه.",
    cta: "ساخت کارت رایگان",
  },
  {
    href: "/shortener",
    title: "کوتاه‌کننده لینک",
    description:
      "لینک‌های بلند را کوتاه و تمیز کنید؛ با آدرس دلخواه و QR خودکار برای اشتراک‌گذاری.",
    cta: "کوتاه کردن لینک",
  },
  {
    href: "/qr",
    title: "ساخت QR کد",
    description:
      "از لینک، متن، وای‌فای یا شماره تماس QR آماده دانلود بسازید — مناسب پرینت و استوری.",
    cta: "ساخت QR رایگان",
  },
] as const;

export default function HomeToolsSection() {
  return (
    <section id="tools" className="border-y border-navy-100/80 bg-white py-14 sm:py-16">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-teal-700">ابزارهای رایگان آرایه</p>
          <h2 className="mt-2 text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl">
            کارت ویزیت، لینک کوتاه و QR — همین الان
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-navy-500 sm:text-base">
            سه ابزار رایگان برای حضور سریع‌تر آنلاین؛ بدون ثبت‌نام، بدون نصب اپ.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
          {tools.map((tool) => (
            <article
              key={tool.href}
              className="flex flex-col rounded-[18px] border border-navy-100 bg-navy-50/30 p-5 text-right sm:p-6"
            >
              <h3 className="text-lg font-extrabold text-navy-900">{tool.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">
                {tool.description}
              </p>
              <Link
                href={tool.href}
                className="mt-5 inline-flex text-sm font-bold text-teal-800 transition hover:text-teal-950"
              >
                {tool.cta}
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
