import { footerColumns, FOOTER_ADDRESS, FOOTER_MAPS_URL, type FooterColumn } from "@/lib/homeData";
import { IconPhone, IconMail, IconInstagram, IconLinkedin, IconMapPin } from "./icons";
import Logo from "./Logo";

const socialIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  "شماره تماس: ۰۹۹۹۱۳۰۰۷۸۸": IconPhone,
  "ایمیل: support@araaye.com": IconMail,
  "اینستاگرام": IconInstagram,
  "لینکدین": IconLinkedin,
};

type FooterProps = {
  columns?: FooterColumn[];
};

export default function Footer({ columns = footerColumns }: FooterProps) {
  const columnCount = columns.length;
  const gridClass =
    columnCount >= 5
      ? "grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      : "grid gap-10 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <footer id="contact" className="border-t border-navy-100 bg-white">
      <div className="container-mx container-px py-16">
        <div className={gridClass}>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-bold text-navy-900">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => {
                  const Icon = socialIcons[link.label];
                  return (
                    <li key={link.label}>
                      <a
                        href={link.url}
                        className="flex items-center gap-2 text-sm text-navy-500 transition-colors hover:text-navy-900"
                      >
                        {Icon && <Icon size={15} className="text-navy-400" />}
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 overflow-x-auto pb-8">
          <a
            href={FOOTER_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-navy-400 transition-colors hover:text-navy-700"
          >
            <IconMapPin size={14} className="shrink-0 text-navy-400" />
            {FOOTER_ADDRESS}
          </a>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-navy-50 pt-8 sm:flex-row">
          <Logo size="md" showTagline />
          <p className="text-xs text-navy-400">
            © ۱۴۰۵ آرایه. شرکت هوش آرایه پارس
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-navy-400">
          همه حقوق برای شرکت هوش آرایه پارس محفوظ است.
        </p>
      </div>
    </footer>
  );
}
