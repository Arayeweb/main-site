import Link from "next/link";
import SectionHeader from "@/components/home/SectionHeader";
import { getPublishedToolPages, getHubPath, type ToolHub } from "@/lib/tools/toolRegistry";

function PageGroup({
  title,
  pages,
  hub,
  variant = "default",
}: {
  title: string;
  pages: ReturnType<typeof getPublishedToolPages>;
  hub: ToolHub;
  variant?: "default" | "compact";
}) {
  if (pages.length === 0) return null;
  const hubPath = getHubPath(hub);

  if (variant === "compact") {
    return (
      <div className="mt-10">
        <h3 className="text-center text-base font-extrabold text-navy-900">{title}</h3>
        <div className="mx-auto mt-4 grid max-w-3xl gap-3 sm:grid-cols-2">
          {pages.map((page) => (
            <Link
              key={page.slug}
              href={`${hubPath}/${page.slug}`}
              className="rounded-xl border border-navy-100 bg-slate-50 px-4 py-3 text-sm font-bold text-navy-700 transition hover:border-brand-200 hover:text-brand-700"
            >
              {page.primaryKeyword}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 first:mt-0">
      <h3 className="mb-4 text-center text-base font-extrabold text-navy-900">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`${hubPath}/${page.slug}`}
            className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition hover:border-brand-200 hover:shadow-card"
          >
            <p className="text-sm font-extrabold text-navy-900">{page.primaryKeyword}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">
              {page.label}
              {page.secondaryKeywords[0] ? ` — ${page.secondaryKeywords[0]}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ToolHubIndex({
  hub,
  title,
  subtitle,
}: {
  hub: ToolHub;
  title: string;
  subtitle: string;
}) {
  const pages = getPublishedToolPages(hub);
  if (pages.length === 0) return null;

  if (hub === "googlesabt") {
    const industries = pages.filter((p) => p.pageType === "industry");
    const problems = pages.filter((p) => p.pageType === "intent");
    const guides = pages.filter((p) => p.pageType === "guide");
    const comparisons = pages.filter((p) => p.pageType === "comparison");

    return (
      <section className="section-py bg-white">
        <div className="container-mx container-px">
          <SectionHeader
            badge="راهنماها"
            badgeClassName="bg-brand-50 text-brand-600"
            title={title}
            subtitle={subtitle}
          />
          <PageGroup title="ثبت بر اساس نوع کسب‌وکار" pages={industries} hub={hub} />
          <PageGroup title="مشکلات رایج و راه‌حل‌ها" pages={problems} hub={hub} variant="compact" />
          <PageGroup title="راهنماهای آموزشی" pages={guides} hub={hub} variant="compact" />
          <PageGroup title="مقایسه و تصمیم‌گیری" pages={comparisons} hub={hub} variant="compact" />
        </div>
      </section>
    );
  }

  const intents = pages.filter((p) => p.pageType === "industry" || p.pageType === "intent");
  const guides = pages.filter((p) => p.pageType === "guide" || p.pageType === "comparison");

  return (
    <section className="section-py bg-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="راهنماها"
          badgeClassName="bg-brand-50 text-brand-600"
          title={title}
          subtitle={subtitle}
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {intents.map((page) => (
            <Link
              key={page.slug}
              href={`${getHubPath(hub)}/${page.slug}`}
              className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition hover:border-brand-200 hover:shadow-card"
            >
              <p className="text-sm font-extrabold text-navy-900">{page.primaryKeyword}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">
                {page.label}
                {page.secondaryKeywords[0] ? ` — ${page.secondaryKeywords[0]}` : ""}
              </p>
            </Link>
          ))}
        </div>
        {guides.length > 0 ? (
          <div className="mt-10">
            <h3 className="text-center text-base font-extrabold text-navy-900">راهنما و مقایسه</h3>
            <div className="mx-auto mt-4 grid max-w-3xl gap-3 sm:grid-cols-2">
              {guides.map((page) => (
                <Link
                  key={page.slug}
                  href={`${getHubPath(hub)}/${page.slug}`}
                  className="rounded-xl border border-navy-100 bg-slate-50 px-4 py-3 text-sm font-bold text-navy-700 transition hover:border-brand-200 hover:text-brand-700"
                >
                  {page.primaryKeyword}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
