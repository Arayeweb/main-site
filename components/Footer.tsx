import { footerColumns, type FooterColumn } from "@/lib/homeData";
import { IconPhone, IconMail, IconInstagram, IconLinkedin } from "./icons";
import Logo from "./Logo";

const socialIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  "شماره تماس: ۰۲۱۲۸۴۲۶۶۹۹": IconPhone,
  "ایمیل: hello@araaye.com": IconMail,
  "اینستاگرام": IconInstagram,
  "لینکدین": IconLinkedin,
};

type FooterProps = {
  columns?: FooterColumn[];
};

export default function Footer({ columns = footerColumns }: FooterProps) {
  const columnCount = columns.length;
  const gridClass =
    columnCount > 4
      ? "grid gap-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-navy-50 pt-8 sm:flex-row">
          <Logo size="md" showTagline />
          <p className="text-xs text-navy-400">
            © ۱۴۰۴ آرایه. توسعه نرم‌افزار اختصاصی، وب‌اپلیکیشن و هوش مصنوعی.
          </p>
        </div>
      </div>
    </footer>
  );
}
