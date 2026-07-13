import DemoNotice from "@/components/showdemoto/shared/DemoNotice";
import KordianFooter from "./KordianFooter";
import KordianHeader from "./KordianHeader";
import { KordianArticlesProvider } from "./KordianArticlesProvider";
import KordianHtmlLocale from "./KordianHtmlLocale";
import type { KordianLocale } from "@/lib/showdemoto/dr-kordian/types";

export default function KordianShell({
  locale,
  children,
}: {
  locale: KordianLocale;
  children: React.ReactNode;
}) {
  return (
    <KordianArticlesProvider>
      <KordianHtmlLocale locale={locale} />
      <div
        dir="ltr"
        lang={locale}
        className="min-h-screen bg-slate-50 text-left font-sans text-navy-900 antialiased [font-family:Inter,system-ui,sans-serif]"
      >
        <div className="border-b border-amber-200/60 bg-amber-50/80">
          <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
            <div dir="rtl" lang="fa" className="text-right">
              <DemoNotice />
            </div>
          </div>
        </div>
        <KordianHeader locale={locale} />
        <main>{children}</main>
        <KordianFooter locale={locale} />
      </div>
    </KordianArticlesProvider>
  );
}
