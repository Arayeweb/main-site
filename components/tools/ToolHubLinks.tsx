import Link from "next/link";
import SectionHeader from "@/components/home/SectionHeader";

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
] as const;

export default function ToolHubLinks({
  current,
  title = "ابزارهای رایگان آرایه",
  subtitle = "کارت ویزیت، لینک کوتاه و QR — رایگان و بدون ثبت‌نام",
}: {
  current?: "/bizcard" | "/shortener" | "/qr";
  title?: string;
  subtitle?: string;
}) {
  const items = TOOLS.filter((t) => t.href !== current);

  return (
    <section className="section-py bg-navy-50/30">
      <div className="container-mx container-px">
        <SectionHeader
          badge="ابزارها"
          badgeClassName="bg-brand-50 text-brand-600"
          title={title}
          subtitle={subtitle}
        />
        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          {items.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition hover:border-brand-200 hover:shadow-card"
            >
              <p className="text-sm font-extrabold text-navy-900">{tool.label}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
