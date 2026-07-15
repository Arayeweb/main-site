import Link from "next/link";

const links = [
  { href: "/website-design", label: "طراحی سایت حرفه‌ای" },
  { href: "/seo", label: "خدمات سئو سایت" },
  { href: "/fastweb", label: "طراحی سایت فوری" },
  { href: "/modares", label: "طراحی سایت مدرس خصوصی" },
] as const;

export default function HomeServiceLinks() {
  return (
    <section className="border-y border-navy-100/80 bg-white py-8">
      <div className="container-mx container-px">
        <p className="mb-4 text-center text-sm font-bold text-navy-700">خدمات اصلی آرایه</p>
        <nav
          aria-label="خدمات اصلی"
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-navy-100 bg-navy-50/40 px-4 py-2.5 text-[13px] font-bold text-teal-800 transition hover:border-teal-200 hover:bg-teal-50/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
