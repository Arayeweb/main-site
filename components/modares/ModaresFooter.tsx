import Logo from "@/components/Logo";
import { COMPANY_LEGAL_NAME } from "@/lib/contactPageData";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/siteContact";

const SUPPORT_EMAIL = "support@araaye.com";

export default function ModaresFooter() {
  return (
    <footer className="border-t border-navy-100 bg-white py-8 sm:py-10">
      <div className="container-mx container-px">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo size="sm" />
          <p className="text-xs font-medium text-navy-500">{COMPANY_LEGAL_NAME}</p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-navy-500">
            <a href={SITE_PHONE_TEL} className="transition-colors hover:text-navy-800">
              {SITE_PHONE_DISPLAY}
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="transition-colors hover:text-navy-800"
            >
              {SUPPORT_EMAIL}
            </a>
            <a href="/about" className="transition-colors hover:text-navy-800">
              حریم خصوصی
            </a>
          </div>

          <p className="text-[11px] text-navy-400">
            © ۱۴۰۵ آرایه. {COMPANY_LEGAL_NAME}
          </p>
        </div>
      </div>
    </footer>
  );
}
