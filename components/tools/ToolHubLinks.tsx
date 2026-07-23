import Link from "next/link";

const TOOLS = [
  {
    href: "/bizcard",
    label: "کارت ویزیت دیجیتال",
    desc: "لینک اختصاصی، QR، تماس و نقشه در یک صفحه",
  },
  {
    href: "/shortener",
    label: "کوتاه‌کننده لینک",
    desc: "لینک کوتاه رایگان با آدرس دلخواه و QR",
  },
  {
    href: "/qr",
    label: "ساخت QR کد",
    desc: "QR رایگان از لینک، متن، وای‌فای و بیشتر",
  },
  {
    href: "/review-link",
    label: "لینک نظر گوگل + QR",
    desc: "لینک مستقیم ثبت نظر، QR و متن آماده درخواست بازخورد",
  },
  {
    href: "/local-seo-check",
    label: "تست سئو محلی",
    desc: "امتیاز آمادگی گوگل مپ و سه اقدام اولویت‌دار",
  },
  {
    href: "/seo-roi-calculator",
    label: "محاسبه ROI سئو",
    desc: "سود، نقطه سربه‌سر و لید لازم برای سرمایه‌گذاری سئو",
  },
] as const;

export default function ToolHubLinks({
  current,
  title = "ابزارهای رایگان آرایه",
  subtitle = "از QR و کارت دیجیتال تا تست سئو محلی و محاسبه بازگشت سرمایه",
}: {
  current?: string;
  title?: string;
  subtitle?: string;
}) {
  const items = TOOLS.filter((t) => t.href !== current);

  return (
    <section className="tool-section-compact bg-navy-950 text-white">
      <div className="container-mx container-px">
        <div className="grid gap-5 border-b border-white/20 pb-6 sm:grid-cols-[120px_1fr] sm:items-end">
          <span className="text-xs font-extrabold text-brand-300">ابزارهای بعدی</span>
          <div>
            <h2 className="text-2xl font-extrabold">{title}</h2>
            <p className="mt-2 text-sm text-navy-200">{subtitle}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3">
          {items.map((tool, index) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group grid min-h-32 grid-cols-[52px_1fr] border-b border-white/20 py-6 transition hover:bg-white/5 sm:px-5 lg:border-l"
            >
              <span className="text-xs font-extrabold text-brand-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-base font-extrabold text-white group-hover:text-brand-200">
                  {tool.label} ←
                </p>
                <p className="mt-2 text-[13px] leading-7 text-navy-200">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
