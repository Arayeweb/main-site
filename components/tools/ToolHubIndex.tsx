import Link from "next/link";
import SectionHeader from "@/components/home/SectionHeader";
import ToolEditorialHeader from "@/components/tools/ToolEditorialHeader";
import {
  getFeaturedGooglesabtProblemPages,
  getFeaturedToolPages,
  getPublishedToolPages,
  getHubPath,
  type ToolHub,
  type ToolRegistryEntry,
} from "@/lib/tools/toolRegistry";

function EditorialLinkGrid({
  pages,
  hub,
  primary = "keyword",
}: {
  pages: ToolRegistryEntry[];
  hub: ToolHub;
  primary?: "keyword" | "label";
}) {
  const hubPath = getHubPath(hub);
  return (
    <div className="mt-7 grid border-y border-navy-300 sm:grid-cols-2">
      {pages.map((page, index) => (
        <Link
          key={page.slug}
          href={`${hubPath}/${page.slug}`}
          className="group grid min-h-24 grid-cols-[52px_1fr] border-b border-navy-300 p-5 transition hover:bg-white sm:odd:border-l"
        >
          <span className="tool-index">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <p className="text-sm font-extrabold text-navy-900 group-hover:text-brand-700">
              {primary === "label" ? page.label : page.primaryKeyword}
            </p>
            <p className="mt-1.5 text-[12px] leading-6 text-navy-500">
              {primary === "label" ? page.primaryKeyword : page.label}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function CollapsedLinkList({
  pages,
  hub,
  summary,
}: {
  pages: ToolRegistryEntry[];
  hub: ToolHub;
  summary: string;
}) {
  if (pages.length === 0) return null;
  const hubPath = getHubPath(hub);
  return (
    <details className="mt-6 border-y border-navy-300 py-4">
      <summary className="cursor-pointer text-sm font-extrabold text-navy-700">{summary}</summary>
      <div className="mt-5 grid border-t border-navy-200 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`${hubPath}/${page.slug}`}
            className="border-b border-navy-200 px-2 py-3 text-sm font-bold text-navy-700 transition hover:bg-white hover:text-brand-700 sm:border-l"
          >
            {page.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

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

    const featuredIndustries = getFeaturedToolPages("googlesabt");
    const featuredIndustrySlugs = new Set(featuredIndustries.map((p) => p.slug));
    const remainingIndustries = industries.filter((p) => !featuredIndustrySlugs.has(p.slug));

    const featuredProblems = getFeaturedGooglesabtProblemPages();
    const featuredProblemSlugs = new Set(featuredProblems.map((p) => p.slug));
    const remainingProblems = problems.filter((p) => !featuredProblemSlugs.has(p.slug));

    return (
      <section className="tool-section">
        <div className="container-mx container-px">
          <ToolEditorialHeader
            index="۰۴"
            kicker="راهنمای صنفی"
            title={title}
            subtitle={subtitle}
          />
          <p className="mt-5 max-w-xl text-xs font-semibold leading-6 text-navy-500">
            صنف خود را انتخاب کنید؛ صفحات SEO کامل‌تر در ادامه در دسترس‌اند.
          </p>

          <EditorialLinkGrid pages={featuredIndustries} hub={hub} primary="label" />
          <CollapsedLinkList
            pages={remainingIndustries}
            hub={hub}
            summary={`مشاهده همه ${remainingIndustries.length} صنف دیگر`}
          />

          <div className="mt-12">
            <h3 className="text-sm font-extrabold text-navy-900">مشکل رایج دارید؟</h3>
            <p className="mt-2 max-w-xl text-xs leading-6 text-navy-500">
              مسیر نزدیک‌ترین مشکل را انتخاب کنید تا راه‌حل مشخص ببینید.
            </p>
            <EditorialLinkGrid pages={featuredProblems} hub={hub} primary="keyword" />
            <CollapsedLinkList
              pages={remainingProblems}
              hub={hub}
              summary={`مشاهده همه ${remainingProblems.length} مشکل دیگر`}
            />
          </div>

          {guides.length > 0 || comparisons.length > 0 ? (
            <div className="mt-12 border-t border-navy-300 pt-6">
              <h3 className="text-sm font-extrabold text-navy-900">راهنما و مقایسه</h3>
              <div className="mt-4 grid sm:grid-cols-2">
                {[...guides, ...comparisons].map((page) => (
                  <Link
                    key={page.slug}
                    href={`${getHubPath(hub)}/${page.slug}`}
                    className="border-b border-navy-200 px-2 py-3 text-sm font-bold text-navy-700 transition hover:bg-white hover:text-brand-700 sm:odd:border-l"
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

  if (
    hub === "review-link" ||
    hub === "local-seo-check" ||
    hub === "seo-roi-calculator"
  ) {
    return (
      <section className="section-py bg-white">
        <div className="container-mx container-px">
          <SectionHeader
            badge="راهنماهای صنفی"
            badgeClassName="bg-brand-50 text-brand-600"
            title={title}
            subtitle={subtitle}
          />
          <PageGroup title="انتخاب نوع کسب‌وکار" pages={pages} hub={hub} />
        </div>
      </section>
    );
  }

  const featured = getFeaturedToolPages(hub);
  const featuredSlugs = new Set(featured.map((page) => page.slug));
  const remainingIntents = pages.filter(
    (page) =>
      (page.pageType === "industry" || page.pageType === "intent") &&
      !featuredSlugs.has(page.slug),
  );
  const guides = pages.filter((p) => p.pageType === "guide" || p.pageType === "comparison");

  return (
    <section className="tool-section">
      <div className="container-mx container-px">
        <ToolEditorialHeader
          index={hub === "bizcard" ? "۰۵" : "۰۳"}
          kicker="فهرست کاربردها"
          title={title}
          subtitle={subtitle}
        />
        <p className="mt-5 max-w-xl text-xs font-semibold leading-6 text-navy-500">
          یکی از کاربردهای پرطرفدار را انتخاب کنید؛ ساخت ابزار رایگان است و ثبت‌نام نمی‌خواهد.
        </p>
        <div className="mt-7 grid border-y border-navy-300 sm:grid-cols-2">
          {featured.map((page, index) => (
            <Link
              key={page.slug}
              href={`${getHubPath(hub)}/${page.slug}`}
              className="group grid min-h-28 grid-cols-[52px_1fr] border-b border-navy-300 p-5 transition hover:bg-white sm:odd:border-l"
            >
              <span className="tool-index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-sm font-extrabold text-navy-900 group-hover:text-brand-700">
                  {page.primaryKeyword}
                </p>
                <p className="mt-2 text-[12px] leading-6 text-navy-500">
                  {page.label}
                  {page.secondaryKeywords[0] ? ` — ${page.secondaryKeywords[0]}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {remainingIntents.length > 0 ? (
          <details className="mt-6 border-y border-navy-300 py-4">
            <summary className="cursor-pointer text-sm font-extrabold text-navy-700">
              مشاهده همه {remainingIntents.length} کاربرد دیگر
            </summary>
            <div className="mt-5 grid border-t border-navy-200 sm:grid-cols-2 lg:grid-cols-3">
              {remainingIntents.map((page) => (
                <Link
                  key={page.slug}
                  href={`${getHubPath(hub)}/${page.slug}`}
                  className="border-b border-navy-200 px-2 py-3 text-sm font-bold text-navy-700 transition hover:bg-white hover:text-brand-700 sm:border-l"
                >
                  {page.primaryKeyword}
                </Link>
              ))}
            </div>
          </details>
        ) : null}
        {guides.length > 0 ? (
          <div className="mt-8 border-t border-navy-300 pt-5">
            <h3 className="text-sm font-extrabold text-navy-900">راهنما و مقایسه</h3>
            <div className="mt-4 grid sm:grid-cols-2">
              {guides.map((page) => (
                <Link
                  key={page.slug}
                  href={`${getHubPath(hub)}/${page.slug}`}
                  className="border-b border-navy-200 px-2 py-3 text-sm font-bold text-navy-700 transition hover:bg-white hover:text-brand-700 sm:odd:border-l"
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
